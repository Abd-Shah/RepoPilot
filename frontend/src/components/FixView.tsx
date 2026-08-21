import type { Analysis } from "../types";

type FixViewProps = {
  result: Analysis;

  copied: string | null;

  copyText: (
    text: string,
    label: string
  ) => void;
};

export default function FixView({
  result,
  copied,
  copyText,
}: FixViewProps) {
  return (
    <section className="fix-workspace">
      <article className="panel">
        <span className="panel-label">
          RECOMMENDATION
        </span>

        <h2>
          Suggested implementation
        </h2>

        <p>
          {
            result.analysis
              .suggested_fix
          }
        </p>

        <h3>Files to change</h3>

        <div className="files-to-change">
          {result.analysis.files_to_change
            .length > 0 ? (
            result.analysis.files_to_change.map(
              (file) => (
                <button
                  key={file}
                  onClick={() =>
                    copyText(
                      file,
                      file
                    )
                  }
                >
                  <code>
                    {file}
                  </code>

                  <span>
                    {copied === file
                      ? "Copied"
                      : "Copy"}
                  </span>
                </button>
              )
            )
          ) : (
            <p className="muted">
              No specific files were
              identified.
            </p>
          )}
        </div>
      </article>

      <article className="panel patch-panel">
        <div className="panel-heading">
          <span className="panel-label">
            PATCH SUGGESTION
          </span>

          {result.analysis.patch && (
            <button
              onClick={() =>
                copyText(
                  result.analysis.patch ||
                    "",
                  "patch"
                )
              }
            >
              {copied === "patch"
                ? "Copied"
                : "Copy Patch"}
            </button>
          )}
        </div>

        {result.analysis.patch ? (
          <pre>
            {result.analysis.patch}
          </pre>
        ) : (
          <p className="muted">
            RepoPilot did not have enough
            evidence to safely suggest a
            patch.
          </p>
        )}
      </article>
    </section>
  );
}