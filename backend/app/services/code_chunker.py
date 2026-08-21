import ast
import re
from pathlib import Path


def _python_chunks(file_path: Path, relative_path: str) -> list[dict]:
    try:
        source = file_path.read_text(encoding="utf-8", errors="ignore")
        tree = ast.parse(source)
    except Exception:
        return []
    lines = source.splitlines()
    chunks: list[dict] = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            start = node.lineno
            end = getattr(node, "end_lineno", start)
            content = "\n".join(lines[start - 1:end])
            chunks.append({
                "file_path": relative_path,
                "name": node.name,
                "type": "class" if isinstance(node, ast.ClassDef) else "function",
                "start_line": start,
                "end_line": end,
                "content": content,
            })
    return chunks


def _generic_chunks(file_path: Path, relative_path: str, max_lines: int = 80) -> list[dict]:
    try:
        lines = file_path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except Exception:
        return []
    chunks: list[dict] = []
    if not lines:
        return chunks
    for i in range(0, len(lines), max_lines):
        part = lines[i:i + max_lines]
        name = f"lines_{i + 1}_{i + len(part)}"
        # Try to extract a useful symbol-like name from JS/TS/Java/C-family code.
        joined_head = "\n".join(part[:8])
        match = re.search(r"(?:function|class|interface|const|let|var|def|public|private|protected)\s+([A-Za-z_$][\w$]*)", joined_head)
        if match:
            name = match.group(1)
        chunks.append({
            "file_path": relative_path,
            "name": name,
            "type": "code_block",
            "start_line": i + 1,
            "end_line": i + len(part),
            "content": "\n".join(part),
        })
    return chunks


def chunk_files(repo_path: Path, files: list[dict]) -> list[dict]:
    all_chunks: list[dict] = []
    for file in files:
        relative_path = file["path"]
        path = repo_path / relative_path
        if path.suffix.lower() == ".py":
            chunks = _python_chunks(path, relative_path)
            if not chunks:
                chunks = _generic_chunks(path, relative_path)
        else:
            chunks = _generic_chunks(path, relative_path)
        all_chunks.extend(chunks)
    return all_chunks
