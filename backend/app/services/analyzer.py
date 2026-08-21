import json
import os

from groq import Groq
from pydantic import ValidationError

from app.models import AnalysisResult


DEFAULT_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b",
)


class AnalyzerError(RuntimeError):
    pass


def _client() -> Groq:
    key = os.getenv("GROQ_API_KEY")

    if not key:
        raise AnalyzerError(
            "GROQ_API_KEY is not set. "
            "Add it to backend/.env and restart the API."
        )

    return Groq(api_key=key)


def _format_context(chunks: list[dict]) -> str:
    sections: list[str] = []

    for chunk in chunks:
        sections.append(
            f"FILE: {chunk['file_path']}\n"
            f"SYMBOL: {chunk['name']} ({chunk['type']})\n"
            f"LINES: {chunk['start_line']}-{chunk['end_line']}\n"
            f"RELEVANCE: {chunk['relevance_score']}\n"
            f"```\n{chunk['content']}\n```"
        )

    return "\n\n---\n\n".join(sections)

def _make_schema_strict(schema: dict) -> dict:
    if isinstance(schema, dict):
        if schema.get("type") == "object":
            schema["additionalProperties"] = False

        for value in schema.values():
            if isinstance(value, dict):
                _make_schema_strict(value)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        _make_schema_strict(item)

    return schema

def analyze_issue(
    issue: str,
    selected_chunks: list[dict],
) -> AnalysisResult:

    if not selected_chunks:
        raise AnalyzerError(
            "No relevant code chunks were found for analysis."
        )

    context = _format_context(selected_chunks)

    system = """
You are RepoPilot, a senior software engineer performing
evidence-based repository debugging.

Rules:

1. Use only the supplied repository context.
2. Do not invent files, functions, behavior, or line numbers.
3. Distinguish confirmed evidence from likely conclusions.
4. If evidence is incomplete, say so explicitly.
5. Give a concrete suggested fix whenever the supplied code
   supports one.
6. files_to_change must contain only files present in the
   supplied repository context.
7. validation_plan must contain practical steps that would
   verify the proposed fix.
8. patch should contain a small unified-diff style suggestion
   only when there is enough evidence to produce one safely.
   Otherwise return null.
9. Return no more than 4 findings.
10. Keep each finding explanation under 60 words.
11. Keep the suggested fix under 120 words.
12. Return no more than 5 validation steps.
13. Be concise. Prioritize completing every required field
    over providing lengthy explanations.
"""

    user = f"""
Investigate this software issue.

ISSUE:
{issue}

CODE CONTEXT:
{context}

Determine:

- what appears to be happening,
- the most likely root cause,
- the strongest pieces of evidence,
- the specific change you recommend,
- which files would likely need modification,
- how the proposed change should be validated,
- and, when sufficiently supported by the code, a small patch.

Keep findings concise and evidence-based.
"""

    try:
        response = _client().chat.completions.create(
    model=DEFAULT_MODEL,
    messages=[
        {
            "role": "user",
            "content": f"""
You are RepoPilot, a senior software engineer performing evidence-based debugging.

Use only the supplied repository context.
Do not invent files, functions, behavior, or line numbers.
Keep the response concise.
Return no more than 3 findings.
Each finding explanation must be under 40 words.
The suggested fix must be under 100 words.
Return no more than 4 validation steps.
Always complete every field in the required output schema.

ISSUE:
{issue}

CODE CONTEXT:
{context}
"""
        }
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "repopilot_analysis",
            "strict": True,
            "schema": _make_schema_strict(
                AnalysisResult.model_json_schema()
            ),
        },
    },
    reasoning_effort="low",
    temperature=0.1,
)

        raw = response.choices[0].message.content

        if not raw:
            raise AnalyzerError(
                "The AI returned an empty response."
            )

        data = json.loads(raw)

        return AnalysisResult.model_validate(data)

    except json.JSONDecodeError as exc:
        raise AnalyzerError(
            "The AI returned invalid JSON."
        ) from exc

    except ValidationError as exc:
        raise AnalyzerError(
            f"AI response validation failed: {exc}"
        ) from exc

    except AnalyzerError:
        raise

    except Exception as exc:
        raise AnalyzerError(
            f"AI analysis failed: {exc}"
        ) from exc