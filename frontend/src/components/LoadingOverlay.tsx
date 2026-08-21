const stages = [
  {
    title: "Mapping repository structure",
    subtitle: "Scanning files and folders",
  },
  {
    title: "Finding relevant files",
    subtitle: "Ranking files by relevance",
  },
  {
    title: "Retrieving and scoring code chunks",
    subtitle: "Selecting high-signal code",
  },
  {
    title: "Tracing dependencies",
    subtitle: "Following related implementation paths",
  },
  {
    title: "Building analysis context",
    subtitle: "Preparing focused code for the model",
  },
  {
    title: "Generating diagnosis",
    subtitle: "Synthesizing evidence and recommendations",
  },
];

export const investigationStageCount =
  stages.length;

export default function LoadingOverlay({
  currentStage,
}: {
  currentStage: number;
}) {
  const percentage = Math.min(
    94,
    Math.round(
      ((currentStage + 1) / stages.length) *
        100
    )
  );

  return (
    <div className="loading-overlay">
      <section className="loading-modal">
        <div className="loading-pulse">
          <span>⌁</span>
        </div>

        <h2>Investigating repository</h2>

        <p>
          RepoPilot is analyzing your
          codebase...
        </p>

        <div className="loading-stage-list">
          {stages.map((stage, index) => {
            const done =
              index < currentStage;

            const current =
              index === currentStage;

            return (
              <div
                key={stage.title}
                className={`loading-stage ${
                  done
                    ? "done"
                    : current
                      ? "current"
                      : ""
                }`}
              >
                <div className="stage-icon">
                  {done
                    ? "✓"
                    : index + 1}
                </div>

                <div className="stage-copy">
                  <strong>
                    {stage.title}
                  </strong>

                  <span>
                    {stage.subtitle}
                  </span>

                  {current && (
                    <div className="stage-progress">
                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {current && (
                  <strong className="stage-percent">
                    {percentage}%
                  </strong>
                )}
              </div>
            );
          })}
        </div>

        <div className="loading-tip">
          <span>◉</span>

          <p>
            <strong>Tip:</strong>{" "}
            Larger repositories may take a
            little longer to investigate.
          </p>
        </div>
      </section>
    </div>
  );
}