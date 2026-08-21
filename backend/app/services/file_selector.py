import re
from pathlib import Path

STOP_WORDS = {
    "the", "a", "an", "is", "are", "and", "or", "to", "of", "in", "on",
    "for", "with", "when", "during", "from", "it", "this", "that", "users",
    "unable", "fails", "failing", "failure", "identify", "possible", "causes",
    "issue", "problem", "investigate", "application", "system",
}

SYNONYMS = {
    "login": {"login", "authenticate", "authentication", "auth", "token", "session", "password"},
    "email": {"email", "username", "user"},
    "database": {"database", "db", "query", "repository", "crud"},
    "api": {"api", "route", "endpoint", "controller"},
}


def extract_keywords(issue: str) -> set[str]:
    words = {w for w in re.findall(r"[a-zA-Z_]+", issue.lower()) if len(w) > 2 and w not in STOP_WORDS}
    expanded = set(words)
    for word in list(words):
        for root, values in SYNONYMS.items():
            if word == root or word in values:
                expanded.update(values)
    return expanded


def _is_test(path: str) -> bool:
    p = path.lower()
    return "/tests/" in f"/{p}" or p.startswith("tests/") or "/test_" in p or p.endswith("_test.py")


def select_relevant_files(repo_path: Path, files: list[dict], issue: str, limit: int = 20) -> list[dict]:
    keywords = extract_keywords(issue)
    ranked: list[dict] = []

    for file in files:
        file_path = repo_path / file["path"]
        path_text = file["path"].lower()
        score = 0.0
        for keyword in keywords:
            if keyword in path_text:
                score += 5
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore").lower()
        except Exception:
            continue
        for keyword in keywords:
            score += min(content.count(keyword), 10)
        if _is_test(file["path"]):
            score *= 0.55
        if score > 0:
            ranked.append({**file, "relevance_score": round(score, 2)})

    ranked.sort(key=lambda item: item["relevance_score"], reverse=True)
    return ranked[:limit]
