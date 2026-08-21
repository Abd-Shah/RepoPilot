import {
  useEffect,
  useState,
} from "react";

import { analyzeRepository } from "./api";

import type {
  Analysis,
  ResultTab,
} from "./types";

import LandingPage from "./components/LandingPage";

import LoadingOverlay, {
  investigationStageCount,
} from "./components/LoadingOverlay";

import ResultsSidebar from "./components/ResultsSidebar";
import Overview from "./components/Overview";
import EvidenceView from "./components/EvidenceView";
import CodeView from "./components/CodeView";
import FixView from "./components/FixView";
import ValidationView from "./components/ValidationView";

export default function App() {
  const [repo, setRepo] =
    useState("");

  const [issue, setIssue] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    loadingStage,
    setLoadingStage,
  ] = useState(0);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<Analysis | null>(
      null
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<ResultTab>(
      "overview"
    );

  const [
    activeFile,
    setActiveFile,
  ] =
    useState<string | null>(
      null
    );

  const [
    showAllChunks,
    setShowAllChunks,
  ] = useState(false);

  const [
    copied,
    setCopied,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    if (!loading) {
      setLoadingStage(0);
      return;
    }

    const interval =
      window.setInterval(() => {
        setLoadingStage(
          (current) =>
            Math.min(
              current + 1,
              investigationStageCount -
                1
            )
        );
      }, 1500);

    return () =>
      window.clearInterval(
        interval
      );
  }, [loading]);

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    setResult(null);

    setActiveTab("overview");
    setActiveFile(null);
    setShowAllChunks(false);

    try {
      const analysis =
        await analyzeRepository(
          repo,
          issue
        );

      setResult(analysis);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function newInvestigation() {
    setResult(null);

    setRepo("");
    setIssue("");

    setError("");

    setActiveTab("overview");
    setActiveFile(null);

    setShowAllChunks(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function copyText(
    text: string,
    label: string
  ) {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopied(label);

      window.setTimeout(() => {
        setCopied(null);
      }, 1400);
    } catch {
      setCopied(null);
    }
  }

  if (!result) {
    return (
      <>
        <LandingPage
          repo={repo}
          issue={issue}
          loading={loading}
          error={error}
          setRepo={setRepo}
          setIssue={setIssue}
          onAnalyze={
            handleAnalyze
          }
        />

        {loading && (
          <LoadingOverlay
            currentStage={
              loadingStage
            }
          />
        )}
      </>
    );
  }

  const confidence =
    Math.round(
      result.analysis
        .confidence * 100
    );

  return (
    <main className="results-page">
      <header className="results-header">
        <button
          className="wordmark-button"
          onClick={
            newInvestigation
          }
        >
          Repo<span>Pilot.</span>
        </button>

        <div className="header-actions">
          <span className="system-ready">
            <i />
            SYSTEM READY
          </span>

          <button
            className="new-investigation"
            onClick={
              newInvestigation
            }
          >
            + New Investigation
          </button>
        </div>
      </header>

      <div className="results-layout">
        <ResultsSidebar
          activeTab={activeTab}
          repositoryUrl={
            result.repository_url
          }
          setActiveTab={
            setActiveTab
          }
        />

        <section className="workspace">
          <div className="workspace-heading">
            <div>
              <span className="complete-label">
                <i />
                INVESTIGATION COMPLETE
              </span>

              <h1>
                {getPageTitle(
                  activeTab
                )}
              </h1>
            </div>

            <div className="confidence-badge">
              {confidence}%
              CONFIDENCE

              <span>⌁</span>
            </div>
          </div>

          {activeTab ===
            "overview" && (
            <Overview
              result={result}
              setActiveTab={
                setActiveTab
              }
              setActiveFile={
                setActiveFile
              }
              copyPatch={() =>
                copyText(
                  result.analysis
                    .patch || "",
                  "patch"
                )
              }
              patchCopied={
                copied === "patch"
              }
            />
          )}

          {activeTab ===
            "evidence" && (
            <EvidenceView
              result={result}
              activeFile={
                activeFile
              }
              setActiveFile={
                setActiveFile
              }
            />
          )}

          {activeTab ===
            "code" && (
            <CodeView
              result={result}
              activeFile={
                activeFile
              }
              showAll={
                showAllChunks
              }
              toggleShowAll={() =>
                setShowAllChunks(
                  (current) =>
                    !current
                )
              }
            />
          )}

          {activeTab ===
            "fix" && (
            <FixView
              result={result}
              copied={copied}
              copyText={
                copyText
              }
            />
          )}

          {activeTab ===
            "validation" && (
            <ValidationView
              result={result}
            />
          )}

          <footer className="workspace-footer">
            <span>
              Repository{" "}
              <strong>
                {friendlyRepoName(
                  result.repository_url
                )}
              </strong>
            </span>

            <span>
              Model{" "}
              <strong>
                {result.model}
              </strong>
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}

function getPageTitle(
  tab: ResultTab
) {
  switch (tab) {
    case "overview":
      return "Investigation overview";

    case "evidence":
      return "Repository evidence";

    case "code":
      return "Code trail";

    case "fix":
      return "Fix & patch";

    case "validation":
      return "Validation plan";
  }
}

function friendlyRepoName(
  url: string
) {
  try {
    const parsed =
      new URL(url);

    return parsed.pathname
      .replace(
        /^\/|\/$/g,
        ""
      )
      .replace(
        /\.git$/,
        ""
      );
  } catch {
    return url;
  }
}