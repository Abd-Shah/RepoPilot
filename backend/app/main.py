from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from app.models import AnalyzeRequest, AnalyzeResponse, HealthResponse
from app.services.repository import clone_repository, cleanup_repository, RepositoryError
from app.services.scanner import scan_repository
from app.services.file_selector import select_relevant_files
from app.services.code_chunker import chunk_files
from app.services.chunk_selector import rank_chunks, expand_dependencies
from app.services.context_builder import build_context
from app.services.analyzer import analyze_issue, AnalyzerError, DEFAULT_MODEL

app = FastAPI(title="RepoPilot API", description="AI-assisted repository debugging and code investigation", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "RepoPilot API is running", "docs": "/docs"}


@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse()


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_repository(request: AnalyzeRequest):
    repo_path = None
    try:
        repo_path = clone_repository(str(request.repository_url))
        files = scan_repository(repo_path)
        if not files:
            raise HTTPException(status_code=422, detail="No supported source files were found in the repository.")

        candidates = select_relevant_files(
            repo_path=repo_path,
            files=files,
            issue=request.issue,
            limit=request.candidate_file_limit,
        )
        if not candidates:
            candidates = sorted(files, key=lambda f: f["size"], reverse=True)[: request.candidate_file_limit]

        chunks = chunk_files(repo_path, candidates)
        ranked = rank_chunks(chunks, request.issue)
        if not ranked:
            ranked = [{**c, "relevance_score": 1.0} for c in chunks]
        expanded = expand_dependencies(ranked, chunks)
        selected = build_context(expanded, request.max_context_tokens)
        if not selected:
            raise HTTPException(status_code=422, detail="RepoPilot could not build useful code context for this issue.")

        analysis = analyze_issue(request.issue, selected)
        public_chunks = [
            {k: v for k, v in c.items() if k != "content"}
            for c in selected
        ]
        return AnalyzeResponse(
            repository_url=str(request.repository_url),
            issue=request.issue,
            scanned_file_count=len(files),
            candidate_file_count=len(candidates),
            generated_chunk_count=len(chunks),
            selected_chunk_count=len(selected),
            selected_chunks=public_chunks,
            analysis=analysis,
            model=DEFAULT_MODEL,
        )
    except HTTPException:
        raise
    except RepositoryError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except AnalyzerError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc
    finally:
        if repo_path is not None:
            cleanup_repository(repo_path)
