import shutil
import tempfile
from pathlib import Path
from urllib.parse import urlparse

from git import Repo


class RepositoryError(RuntimeError):
    pass


def _validate_github_url(repository_url: str) -> None:
    parsed = urlparse(repository_url)
    if parsed.scheme not in {"http", "https"}:
        raise RepositoryError("Repository URL must use http or https.")
    if parsed.hostname not in {"github.com", "www.github.com"}:
        raise RepositoryError("RepoPilot currently accepts GitHub repository URLs only.")
    if len([p for p in parsed.path.split("/") if p]) < 2:
        raise RepositoryError("Repository URL must include owner and repository name.")


def clone_repository(repository_url: str) -> Path:
    _validate_github_url(repository_url)
    workspace = Path(tempfile.mkdtemp(prefix="repopilot_"))
    repo_path = workspace / "repo"

    try:
        Repo.clone_from(repository_url, repo_path, depth=1, single_branch=True)
        return repo_path
    except Exception as exc:
        shutil.rmtree(workspace, ignore_errors=True)
        raise RepositoryError(f"Failed to clone repository: {exc}") from exc


def cleanup_repository(repo_path: Path) -> None:
    shutil.rmtree(repo_path.parent, ignore_errors=True)
