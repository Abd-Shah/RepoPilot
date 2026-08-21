import type { Analysis } from "../types";

type EvidenceViewProps = {
  result: Analysis;

  activeFile: string | null;

  setActiveFile: (
    file: string | null
  ) => void;
};

export default function EvidenceView({
  result,
  activeFile,
  setActiveFile,
}: EvidenceViewProps) {
  const matchingChunks =
    activeFile
      ? result.selected_chunks.filter(
          (chunk) =>
            chunk.file_path ===
            activeFile
        )
      : [];

  return (
    <section className="evidence-workspace">
      <div className="evidence-list">
        {result.analysis.findings.map(
          (finding, index) => (
            <button
              key={index}
              className={`evidence-item ${
                activeFile ===
                finding.file_path
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveFile(
                  finding.file_path ||
                    null
                )
              }
            >
              <span className="evidence-number">
                0{index + 1}
              </span>

              <div>
                <strong>
                  {finding.title}
                </strong>

                <p>
                  {finding.explanation}
                </p>

                {finding.file_path && (
                  <code>
                    {finding.file_path}

                    {finding.line_hint
                      ? `:${finding.line_hint}`
                      : ""}
                  </code>
                )}
              </div>

              <span>→</span>
            </button>
          )
        )}
      </div>

      <aside className="panel related-panel">
        <span className="panel-label">
          RELATED CODE
        </span>

        {activeFile ? (
          <>
            <code className="selected-file">
              {activeFile}
            </code>

            <div className="related-code">
              {matchingChunks.length >
              0 ? (
                matchingChunks.map(
                  (chunk, index) => (
                    <article
                      key={index}
                    >
                      <strong>
                        {chunk.name}
                      </strong>

                      <span>
                        {chunk.type}
                      </span>

                      <small>
                        lines{" "}
                        {chunk.start_line}–
                        {chunk.end_line}
                      </small>
                    </article>
                  )
                )
              ) : (
                <p className="muted">
                  No retrieved chunks
                  matched this file.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="muted">
            Select an evidence item to
            inspect its related code.
          </p>
        )}
      </aside>
    </section>
  );
}