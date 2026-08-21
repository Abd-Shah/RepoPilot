import type { Analysis } from "../types";

export default function ValidationView({
  result,
}: {
  result: Analysis;
}) {
  return (
    <section className="validation-workspace">
      <article className="panel validation-large">
        <span className="panel-label">
          VALIDATION PLAN
        </span>

        <h2>
          Verify the proposed fix
        </h2>

        <ol>
          {result.analysis.validation_plan.map(
            (step, index) => (
              <li key={index}>
                <span>
                  {index + 1}
                </span>

                <div>
                  <strong>
                    Step {index + 1}
                  </strong>

                  <p>{step}</p>
                </div>
              </li>
            )
          )}
        </ol>
      </article>
    </section>
  );
}