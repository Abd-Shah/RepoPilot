import {
  FileCode2,
  GitBranch,
  Search,
  ShieldCheck,
} from "lucide-react";

type LandingPageProps = {
  repo: string;
  issue: string;
  loading: boolean;
  error: string;

  setRepo: (value: string) => void;
  setIssue: (value: string) => void;

  onAnalyze: () => void;
};

export default function LandingPage({
  repo,
  issue,
  loading,
  error,
  setRepo,
  setIssue,
  onAnalyze,
}: LandingPageProps) {
  return (
    <main className="landing-page">
      <div className="landing-background-grid" />

      <section className="centered-hero">
        <div className="hero-wordmark">
          Repo<span>Pilot.</span>
        </div>

        <div className="hero-status">
          <span />
          SYSTEM READY
        </div>

        <h1>
          Trace bugs.
          <br />
          Not your <em>weekend.</em>
        </h1>

        <p className="hero-description">
          RepoPilot investigates your repository,
          traces the code behind an issue, and
          surfaces the likely root cause with
          evidence and a fix.
        </p>

        <section className="center-investigation-card">
          <div className="card-topline">
            <span>NEW INVESTIGATION</span>

            <div>
              <i />
              READY
            </div>
          </div>

          <label>REPOSITORY</label>

          <div className="dark-input">
            <GitBranch size={17} />

            <input
              value={repo}
              onChange={(event) =>
                setRepo(event.target.value)
              }
              placeholder="Paste a GitHub repository URL..."
              disabled={loading}
            />
          </div>

          <label>ISSUE</label>

          <textarea
            rows={5}
            value={issue}
            onChange={(event) =>
              setIssue(event.target.value)
            }
            placeholder="Describe the issue RepoPilot should investigate..."
            disabled={loading}
          />

          <button
            className="investigate-cta"
            onClick={onAnalyze}
            disabled={
              loading ||
              !repo.trim() ||
              issue.trim().length < 5
            }
          >
            INVESTIGATE
            <span>→</span>
          </button>

          {error && (
            <div className="error-box">
              <strong>
                Investigation failed
              </strong>

              <span>{error}</span>
            </div>
          )}
        </section>

        <section className="landing-steps">
          <Step
            number="01"
            icon={<Search size={18} />}
            title="SCAN"
            text="Map the repository"
          />

          <Step
            number="02"
            icon={<GitBranch size={18} />}
            title="TRACE"
            text="Follow the code"
          />

          <Step
            number="03"
            icon={<FileCode2 size={18} />}
            title="DIAGNOSE"
            text="Find the root cause"
          />

          <Step
            number="04"
            icon={<ShieldCheck size={18} />}
            title="FIX"
            text="Suggest a resolution"
          />
        </section>
      </section>
    </main>
  );
}

function Step({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article>
      <span>{number}</span>

      <div>{icon}</div>

      <strong>{title}</strong>

      <p>{text}</p>
    </article>
  );
}