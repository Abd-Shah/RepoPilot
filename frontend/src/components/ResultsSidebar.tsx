import { GitBranch } from "lucide-react";
import type { ResultTab } from "../types";

type ResultsSidebarProps = {
  activeTab: ResultTab;
  repositoryUrl: string;

  setActiveTab: (
    tab: ResultTab
  ) => void;
};

export default function ResultsSidebar({
  activeTab,
  repositoryUrl,
  setActiveTab,
}: ResultsSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <GitBranch size={18} />

        Repo<span>Pilot.</span>
      </div>

      <nav>
        <SidebarButton
          label="Overview"
          active={
            activeTab === "overview"
          }
          onClick={() =>
            setActiveTab("overview")
          }
        />

        <SidebarButton
          label="Evidence"
          active={
            activeTab === "evidence"
          }
          onClick={() =>
            setActiveTab("evidence")
          }
        />

        <SidebarButton
          label="Code Trail"
          active={activeTab === "code"}
          onClick={() =>
            setActiveTab("code")
          }
        />

        <SidebarButton
          label="Fix & Patch"
          active={activeTab === "fix"}
          onClick={() =>
            setActiveTab("fix")
          }
        />

        <SidebarButton
          label="Validation"
          active={
            activeTab === "validation"
          }
          onClick={() =>
            setActiveTab("validation")
          }
        />
      </nav>

      <div className="sidebar-footer">
        <span>
          ANALYZED REPOSITORY
        </span>

        <strong>
          {friendlyRepoName(
            repositoryUrl
          )}
        </strong>
      </div>
    </aside>
  );
}

function SidebarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`sidebar-button ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      <span>
        {active ? "◉" : "○"}
      </span>

      {label}
    </button>
  );
}

function friendlyRepoName(
  url: string
) {
  try {
    const parsed = new URL(url);

    return parsed.pathname
      .replace(/^\/|\/$/g, "")
      .replace(/\.git$/, "");
  } catch {
    return url;
  }
}