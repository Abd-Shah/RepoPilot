from pathlib import Path

IGNORED_DIRS = {
    ".git", "node_modules", "venv", ".venv", "__pycache__", ".next", "dist",
    "build", "coverage", ".pytest_cache", ".mypy_cache", ".idea", ".vscode",
}

ALLOWED_EXTENSIONS = {
    ".py": "python", ".js": "javascript", ".jsx": "javascript",
    ".ts": "typescript", ".tsx": "typescript", ".java": "java",
    ".cpp": "cpp", ".cc": "cpp", ".c": "c", ".h": "c/cpp",
    ".cs": "csharp", ".go": "go", ".rs": "rust", ".html": "html",
    ".css": "css", ".sql": "sql", ".yml": "yaml", ".yaml": "yaml",
    ".json": "json", ".toml": "toml", ".sh": "shell",
}

MAX_FILE_BYTES = 250_000


def scan_repository(repo_path: Path) -> list[dict]:
    files: list[dict] = []
    for path in repo_path.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(repo_path)
        if any(part in IGNORED_DIRS for part in rel.parts):
            continue
        ext = path.suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue
        try:
            size = path.stat().st_size
        except OSError:
            continue
        if size > MAX_FILE_BYTES:
            continue
        files.append({"path": str(rel), "language": ALLOWED_EXTENSIONS[ext], "size": size})
    return files
