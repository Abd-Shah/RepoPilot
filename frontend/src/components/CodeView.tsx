import type { Analysis } from "../types";

type CodeViewProps = {
  result: Analysis;

  activeFile: string | null;

  showAll: boolean;

  toggleShowAll: () => void;
};

export default function CodeView({
  result,
  activeFile,
  showAll,
  toggleShowAll,
}: CodeViewProps) {
  const visibleChunks =
    result.selected_chunks.slice(
      0,
      showAll
        ? result.selected_chunks.length
        : 6
    );

  return (
    <>
      <div className="code-toolbar">
        <div>
          <strong>
            {result.selected_chunk_count}{" "}
            chunks selected
          </strong>

          <span>
            from{" "}
            {result.generated_chunk_count}{" "}
            generated chunks
          </span>
        </div>

        {result.selected_chunks.length >
          6 && (
          <button
            className="outline-button compact"
            onClick={toggleShowAll}
          >
            {showAll
              ? "Show fewer"
              : "Show all chunks"}
          </button>
        )}
      </div>

      <div className="code-grid">
        {visibleChunks.map(
          (chunk, index) => (
            <article
              key={`${chunk.file_path}-${chunk.name}-${index}`}
              className={`code-card ${
                activeFile ===
                chunk.file_path
                  ? "selected"
                  : ""
              }`}
            >
              <div className="code-card-head">
                <span>{"</>"}</span>

                <small>
                  {chunk.type}
                </small>
              </div>

              <h3>
                {chunk.name}
              </h3>

              <code>
                {chunk.file_path}
              </code>

              <footer>
                <span>
                  lines{" "}
                  {chunk.start_line}–
                  {chunk.end_line}
                </span>

                <span>
                  relevance{" "}
                  {
                    chunk.relevance_score
                  }
                </span>
              </footer>
            </article>
          )
        )}
      </div>
    </>
  );
}