import React, { useState } from 'react';
import { 
  GitBranch, 
  Terminal, 
  Globe, 
  FolderGit2, 
  FileEdit, 
  Sparkles, 
  Loader2,
  ChevronDown,
  ChevronUp,
  GitCommitHorizontal,
  AppWindow
} from 'lucide-react';

export default function SessionHero({ 
  context, 
  onGenerate, 
  isGenerating, 
  stepStage, 
  userNotes, 
  setUserNotes 
}) {
  const [expandedProjects, setExpandedProjects] = useState({});
  const activeProjects = context?.active_projects || [];
  const totalCommits = activeProjects.reduce((sum, p) => sum + (p.commit_count || 0), 0);
  const totalChanges = activeProjects.reduce((sum, p) => sum + (p.uncommitted_changes || 0), 0);

  const toggleProject = (idx) => {
    setExpandedProjects(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="card">
      <div className="flex flex-col lg-flex-row justify-between items-start gap-6">
        <div style={{ flex: 1 }}>
          

          <h1 className="header-title flex items-center gap-2" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>
            <FolderGit2 size={24} style={{ color: 'var(--accent-blue)' }} />
            <span>Today's Development Activity</span>
          </h1>

          {/* Summary metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ marginTop: '0.5rem' }}>
            <span className="pill pill-blue">
              {activeProjects.length} {activeProjects.length === 1 ? 'project' : 'projects'}
            </span>
            <span className="pill pill-default">
              <GitCommitHorizontal size={12} />
              {totalCommits} commits today
            </span>
            {totalChanges > 0 && (
              <span className="pill pill-amber">
                {totalChanges} uncommitted
              </span>
            )}
            <div className="flex items-center gap-1.5 text-muted">
              <Terminal size={13} />
              <span>{context?.terminal?.commands?.length || 0} recent commands</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <Globe size={13} />
              <span>{context?.browser?.tabs?.length || 0} reference tabs</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <AppWindow size={13} />
              <span>{context?.windows?.windows?.length || 0} active windows</span>
            </div>
          </div>

          {/* Active Projects List */}
          {activeProjects.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeProjects.map((project, idx) => (
                <div key={idx} style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-hover, #F1F5F9)',
                  transition: 'box-shadow 0.15s ease',
                }}>
                  <div 
                    className="flex items-center justify-between"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => toggleProject(idx)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <FolderGit2 size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {project.repo_name}
                      </span>
                      <span className="pill pill-default" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', gap: '0.2rem' }}>
                        <GitBranch size={10} />
                        {project.branch}
                      </span>
                      <span className="pill pill-blue" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                        {project.commit_count} commits
                      </span>
                      {project.uncommitted_changes > 0 && (
                        <span className="pill pill-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                          {project.uncommitted_changes} uncommitted
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem' }}>
                      {expandedProjects[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Commit messages */}
                  {project.commits_today && project.commits_today.length > 0 && (
                    <div style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      {project.commits_today
                        .slice(0, expandedProjects[idx] ? undefined : 3)
                        .map((commit, ci) => (
                          <div key={ci} style={{ 
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.4rem',
                            fontSize: '0.8rem', 
                            color: 'var(--text-secondary)',
                            padding: '0.15rem 0',
                            lineHeight: '1.4',
                          }}>
                            <GitCommitHorizontal size={12} style={{ 
                              marginTop: '3px', 
                              flexShrink: 0, 
                              color: 'var(--accent-blue)',
                              opacity: 0.7,
                            }} />
                            <span className="font-mono" style={{ fontSize: '0.78rem' }}>{commit}</span>
                          </div>
                        ))}
                      {!expandedProjects[idx] && project.commits_today.length > 3 && (
                        <span style={{ 
                          fontSize: '0.72rem', 
                          color: 'var(--text-muted)', 
                          fontStyle: 'italic',
                          paddingLeft: '1rem',
                        }}>
                          +{project.commits_today.length - 3} more commits…
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeProjects.length === 0 && (
            <p className="text-sm text-muted" style={{ marginTop: '0.75rem' }}>
              No project activity detected today yet. Generate a handoff to capture your current state.
            </p>
          )}
        </div>

        {/* Generate Action Button */}
        <div className="flex flex-col items-start gap-2" style={{ minWidth: '240px' }}>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{stepStage || "Creating note..."}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Handoff Note</span>
              </>
            )}
          </button>

          {isGenerating && (
            <p className="text-xs text-muted" style={{ textAlign: 'center', width: '100%' }}>
              Inspecting diffs & drafting resume checklist...
            </p>
          )}
        </div>
      </div>

      {/* Developer Context Note Input */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
        <label className="section-label" style={{ marginBottom: '0.4rem' }}>
          <FileEdit size={14} style={{ color: 'var(--accent-blue)' }} />
          <span>Add session note or goal (Optional)</span>
        </label>
        <input
          type="text"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="e.g. Worked on payment webhook and stopped before handling timeouts"
          className="form-input"
        />
      </div>
    </div>
  );
}
