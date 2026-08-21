from typing import Literal
from pydantic import BaseModel, Field, HttpUrl


class AnalyzeRequest(BaseModel):
    repository_url: HttpUrl
    issue: str = Field(min_length=5, max_length=4000)
    candidate_file_limit: int = Field(default=20, ge=5, le=50)
    max_context_tokens: int = Field(default=4200, ge=1000, le=10000)


class ChunkRef(BaseModel):
    file_path: str
    name: str
    type: str
    start_line: int
    end_line: int
    relevance_score: float


class Finding(BaseModel):
    title: str
    explanation: str
    file_path: str | None
    line_hint: str | None


class AnalysisResult(BaseModel):
    summary: str
    root_cause: str
    confidence: float = Field(ge=0, le=1)

    suggested_fix: str
    files_to_change: list[str]
    validation_plan: list[str]

    findings: list[Finding]

    patch: str | None


class AnalyzeResponse(BaseModel):
    repository_url: str
    issue: str
    scanned_file_count: int
    candidate_file_count: int
    generated_chunk_count: int
    selected_chunk_count: int
    selected_chunks: list[ChunkRef]
    analysis: AnalysisResult
    model: str


class HealthResponse(BaseModel):
    status: Literal["healthy"] = "healthy"
