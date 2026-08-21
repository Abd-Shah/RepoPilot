import React, { useMemo } from "react";
import type {
  Analysis,
  ResultTab,
} from "../types";

type OverviewProps = {
  result: Analysis;

  setActiveTab: (
    tab: ResultTab
  ) => void;

  setActiveFile: (
    file: string | null
  ) => void;

  copyPatch: () => void;

  patchCopied: boolean;
};

export default function Overview({
  result,
  setActiveTab,
  setActiveFile,
  copyPatch,
  patchCopied,
}: OverviewProps) {
  const confidence = Math.round(
    result.analysis.confidence * 100
  );

  const codeTrail = useMemo(() => {
    const seen = new Set<string>();

    return result.selected_chunks.filter(
      (chunk) => {
        const key =
          `${chunk.file_path}:${chunk.name}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      }
    );
  }, [result]);

  return (
    <>
      <section className="metrics-row">
        <Metric
          label="Files Scanned"
          value={
            result.scanned_file_count
          }
        />

        <Metric
          label="Candidate Files"
          value={
            result.candidate_file_count
          }
        />

        <Metric
          label="Code Chunks"
          value={
            result.generated_chunk_count
          }
        />

        <Metric
          label="Selected Chunks"
          value={
            result.selected_chunk_count
          }
        />

        <Metric
          label="Model Used"
          value={shortModel(
            result.model
          )}
          compact
        />
      </section>

      <section className="diagnosis-grid">
        <article className="panel">
          <span className="panel-label">
            ⌁ DIAGNOSIS
          </span>

          <p>
            {result.analysis.summary}
          </p>

          <div className="confidence-row">
            <strong>
              {confidence}% Confidence
            </strong>

            <div className="confidence-track">
              <div
                style={{
                  width: `${confidence}%`,
                }}
              />
            </div>
          </div>
        </article>

        <article className="panel">
          <span className="panel-label">
            ◎ ROOT CAUSE
          </span>

          <p>
            {result.analysis.root_cause}
          </p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <span className="panel-label">
            CODE TRAIL
          </span>

          <button
            onClick={() =>
              setActiveTab("code")
            }
          >
            Explore →
          </button>
        </div>

        <div className="trace">
          {codeTrail
            .slice(0, 5)
            .map((chunk, index) => (
              <React.Fragment
                key={`${chunk.file_path}-${chunk.name}`}
              >
                <button
                  className="trace-node"
                  onClick={() => {
                    setActiveFile(
                      chunk.file_path
                    );

                    setActiveTab("code");
                  }}
                >
                  <strong>
                    {chunk.name}
                  </strong>

                  <span>
                    {shortPath(
                      chunk.file_path
                    )}
                  </span>
                </button>

                {index <
                  Math.min(
                    codeTrail.length,
                    5
                  ) -
                    1 && (
                  <span className="trace-arrow">
                    →
                  </span>
                )}
              </React.Fragment>
            ))}
        </div>
      </section>

      <section className="overview-bottom">
        <article className="panel">
          <div className="panel-heading">
            <span className="panel-label">
              TOP EVIDENCE
            </span>

            <small>
              {
                result.analysis.findings
                  .length
              }{" "}
              findings
            </small>
          </div>

          <div className="evidence-preview">
            {result.analysis.findings
              .slice(0, 3)
              .map(
                (finding, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveFile(
                        finding.file_path ||
                          null
                      );

                      setActiveTab(
                        "evidence"
                      );
                    }}
                  >
                    <span className="preview-index">
                      0{index + 1}
                    </span>

                    <div>
                      <strong>
                        {finding.title}
                      </strong>

                      <small>
                        {finding.file_path ||
                          "Repository evidence"}
                      </small>
                    </div>

                    <span>→</span>
                  </button>
                )
              )}
          </div>

          <button
            className="outline-button"
            onClick={() =>
              setActiveTab("evidence")
            }
          >
            View all evidence →
          </button>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <span className="panel-label">
              SUGGESTED FIX
            </span>

            {result.analysis.patch && (
              <button
                onClick={copyPatch}
              >
                {patchCopied
                  ? "Copied"
                  : "Copy Patch"}
              </button>
            )}
          </div>

          <p className="fix-copy">
            {
              result.analysis
                .suggested_fix
            }
          </p>

          {result.analysis.patch ? (
            <pre className="mini-patch">
              {result.analysis.patch}
            </pre>
          ) : (
            <p className="muted">
              No patch was generated for
              this investigation.
            </p>
          )}
        </article>

        <article className="panel">
          <span className="panel-label">
            VALIDATION PLAN
          </span>

          <ol className="validation-mini">
            {result.analysis.validation_plan
              .slice(0, 6)
              .map(
                (step, index) => (
                  <li key={index}>
                    <span>
                      {index + 1}
                    </span>

                    <p>{step}</p>
                  </li>
                )
              )}
          </ol>
        </article>
      </section>
    </>
  );
}

function Metric({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>

      <strong
        className={
          compact
            ? "compact-value"
            : ""
        }
      >
        {value}
      </strong>
    </article>
  );
}

function shortPath(path: string) {
  const parts = path.split("/");

  if (parts.length <= 2) {
    return path;
  }

  return parts
    .slice(-2)
    .join("/");
}

function shortModel(model: string) {
  return model
    .replace("openai/", "")
    .replace("gpt-", "GPT-")
    .toUpperCase();
}