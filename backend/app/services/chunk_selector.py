import ast
import re
from collections import defaultdict
from app.services.file_selector import extract_keywords


def _is_test_file(path: str) -> bool:
    p = path.lower()
    return "/tests/" in f"/{p}" or p.startswith("tests/") or "/test_" in p or p.endswith("_test.py")


def rank_chunks(chunks: list[dict], issue: str) -> list[dict]:
    keywords = extract_keywords(issue)
    ranked: list[dict] = []
    for chunk in chunks:
        name = chunk["name"].lower()
        path = chunk["file_path"].lower()
        content = chunk["content"].lower()
        score = 0.0
        for keyword in keywords:
            if keyword in name:
                score += 10
            if keyword in path:
                score += 5
            score += min(content.count(keyword), 5)
        if _is_test_file(path):
            score *= 0.5
        if score > 0:
            ranked.append({**chunk, "relevance_score": round(score, 2)})
    ranked.sort(key=lambda c: c["relevance_score"], reverse=True)
    return ranked


def _python_called_names(content: str) -> set[str]:
    try:
        tree = ast.parse(content)
    except Exception:
        return set()
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                names.add(node.func.id)
            elif isinstance(node.func, ast.Attribute):
                names.add(node.func.attr)
    return names


def _generic_called_names(content: str) -> set[str]:
    return set(re.findall(r"\b([A-Za-z_$][\w$]*)\s*\(", content))


def expand_dependencies(ranked_chunks: list[dict], all_chunks: list[dict], seed_count: int = 8, max_added: int = 12) -> list[dict]:
    by_name: dict[str, list[dict]] = defaultdict(list)
    for chunk in all_chunks:
        by_name[chunk["name"]].append(chunk)

    result = list(ranked_chunks)
    existing = {(c["file_path"], c["name"], c["start_line"]) for c in result}
    added = 0

    for seed in ranked_chunks[:seed_count]:
        if seed["file_path"].endswith(".py"):
            calls = _python_called_names(seed["content"])
        else:
            calls = _generic_called_names(seed["content"])
        for call in calls:
            for dep in by_name.get(call, []):
                key = (dep["file_path"], dep["name"], dep["start_line"])
                if key in existing:
                    continue
                result.append({**dep, "relevance_score": max(6.0, seed["relevance_score"] * 0.35)})
                existing.add(key)
                added += 1
                if added >= max_added:
                    return sorted(result, key=lambda c: c["relevance_score"], reverse=True)
    return sorted(result, key=lambda c: c["relevance_score"], reverse=True)
