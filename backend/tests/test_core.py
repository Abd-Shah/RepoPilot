from pathlib import Path
from app.services.file_selector import extract_keywords
from app.services.code_chunker import chunk_files
from app.services.chunk_selector import rank_chunks
from app.services.context_builder import build_context


def test_keywords_expand_auth_terms():
    words = extract_keywords("Users cannot login with email")
    assert "login" in words
    assert "authenticate" in words
    assert "email" in words


def test_python_chunking_and_ranking(tmp_path: Path):
    code = """
def login_user(email, password):
    return authenticate(email, password)

def calculate_tax(total):
    return total * 0.1
"""
    f = tmp_path / "auth.py"
    f.write_text(code)
    files = [{"path": "auth.py", "language": "python", "size": len(code)}]
    chunks = chunk_files(tmp_path, files)
    ranked = rank_chunks(chunks, "login authentication fails")
    assert ranked[0]["name"] == "login_user"


def test_context_budget():
    chunks = [
        {"file_path": f"f{i}.py", "name": f"x{i}", "type": "function", "start_line": 1, "end_line": 2, "content": "x" * 1000, "relevance_score": 10-i}
        for i in range(10)
    ]
    selected = build_context(chunks, max_tokens=600)
    assert sum(len(c["content"]) // 4 for c in selected) <= 600
