# RepoPilot

AI-powered repository investigation tool. Give it a public GitHub repo and a natural-language issue description, and it returns an evidence-backed diagnosis: likely root cause, relevant code locations, a suggested fix, a validation plan, and an optional patch.

RepoPilot treats debugging as a retrieval problem first, AI reasoning second — it doesn't dump the whole repo into an LLM prompt. It narrows the codebase down to relevant, ranked code chunks and sends only that focused context to the model.

## Architecture

```text
                              ┌─────────────────────────┐
                              │      React + Vite       │
                              │        Frontend         │
                              └────────────┬────────────┘
                                           │
                                           │ POST /api/analyze
                                           ▼
                              ┌─────────────────────────┐
                              │         FastAPI         │
                              │        REST API         │
                              └────────────┬────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────┐
│                     Repository Analysis Pipeline                      │
│                                                                       │
│     GitHub Repository                                                 │
│            │                                                          │
│            ▼                                                          │
│     ┌──────────────┐                                                  │
│     │  Clone Repo  │                                                  │
│     └──────┬───────┘                                                  │
│            │                                                          │
│            ▼                                                          │
│     ┌──────────────┐                                                  │
│     │  Scan Files  │ ─────► Discover supported source files           │
│     └──────┬───────┘                                                  │
│            │                                                          │
│            ▼                                                          │
│     ┌────────────────┐                                                │
│     │ File Selector  │ ─────► Select issue-relevant files             │
│     └───────┬────────┘                                                │
│             │                                                         │
│             ▼                                                         │
│     ┌────────────────┐                                                │
│     │  Code Chunker  │ ─────► Functions + logical code blocks         │
│     └───────┬────────┘                                                │
│             │                                                         │
│             ▼                                                         │
│     ┌────────────────┐                                                │
│     │  Chunk Ranker  │ ─────► Score chunks against the issue          │
│     └───────┬────────┘                                                │
│             │                                                         │
│             ▼                                                         │
│     ┌─────────────────────┐                                           │
│     │ Dependency Expansion│ ───► Add related implementation context   │
│     └──────────┬──────────┘                                           │
│                │                                                      │
│                ▼                                                      │
│     ┌─────────────────────┐                                           │
│     │   Context Builder   │ ───► Build token-budgeted context         │
│     └──────────┬──────────┘                                           │
│                │                                                      │
└────────────────┼──────────────────────────────────────────────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │     Groq API     │
        │    GPT-OSS LLM   │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────────────┐
        │    Structured Analysis   │
        │                          │
        │  • Summary               │
        │  • Root Cause            │
        │  • Confidence            │
        │  • Evidence              │
        │  • Suggested Fix         │
        │  • Files to Change       │
        │  • Validation Plan       │
        │  • Optional Patch        │
        └──────────────────────────┘
```

## How It Works

1. **Clone Repository** — pulls the public GitHub repo into a temporary workspace
2. **Scan Files** — discovers supported source files
3. **Select Candidate Files** — scores files against the issue description
4. **Chunk Code** — breaks candidate files into functions and logical blocks
5. **Rank Chunks** — scores each chunk's relevance to the issue
6. **Expand Dependencies** — pulls in related functions, logic, and tests
7. **Build Context** — fits the ranked chunks into a token budget
8. **Analyze** — sends the final context to the LLM, validates the structured response

Example run against `tiangolo/full-stack-fastapi-template`:

| Stage | Result |
|---|---:|
| Files Scanned | 206 |
| Candidate Files | 20 |
| Code Chunks Generated | 113 |
| Chunks Sent to LLM | 15 |

Every finding traces back to a specific file and line range, so the output is auditable rather than a black-box guess.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI, Pydantic |
| AI Inference | Groq API, GPT-OSS |
| Retrieval | Custom file selection, code chunking, relevance ranking |
| Docs | OpenAPI / Swagger |

## Limitations

- Works with public GitHub repositories only — no private repo support yet
- Reads and analyzes code, does not execute it or run the test suite
- Generates a suggested patch, but does not apply it or open a pull request
- Diagnoses should be reviewed by a developer before use, not merged directly

---
