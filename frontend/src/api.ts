import type { Analysis } from "./types";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export async function analyzeRepository(
  repositoryUrl: string,
  issue: string
): Promise<Analysis> {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repository_url: repositoryUrl.trim(),
      issue: issue.trim(),
      candidate_file_limit: 20,
      max_context_tokens: 3000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Analysis failed"
    );
  }

  return data;
}