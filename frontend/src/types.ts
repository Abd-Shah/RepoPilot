export type Chunk = {
  file_path: string;
  name: string;
  type: string;
  start_line: number;
  end_line: number;
  relevance_score: number;
};

export type Finding = {
  title: string;
  explanation: string;
  file_path?: string | null;
  line_hint?: string | null;
};

export type AnalysisResult = {
  summary: string;
  root_cause: string;
  confidence: number;
  findings: Finding[];
  suggested_fix: string;
  files_to_change: string[];
  validation_plan: string[];
  patch?: string | null;
};

export type Analysis = {
  repository_url: string;
  issue: string;

  scanned_file_count: number;
  candidate_file_count: number;
  generated_chunk_count: number;
  selected_chunk_count: number;

  model: string;

  selected_chunks: Chunk[];

  analysis: AnalysisResult;
};

export type ResultTab =
  | "overview"
  | "evidence"
  | "code"
  | "fix"
  | "validation";