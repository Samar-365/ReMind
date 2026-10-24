import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square,
  AlertCircle, 
  Terminal, 
  FileCode, 
  Bookmark, 
  Copy, 
  Check, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function ResumptionCard({ noteRecord, onToggleFavorite }) {
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState({});

  if (!noteRecord || !noteRecord.note) {
    return null;
  }

  const { note, created_at, model_used, is_favorite, repo_name } = noteRecord;

  const toggleCheck = (idx) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = () => {
    const md = `
# Tomorrow-Me Handoff: ${repo_name} (${new Date(created_at).toLocaleDateString()})

## Current Task
${note.current_task}

## Immediate Next Steps
${(note.next_steps || []).map(s => `- [ ] ${s}`).join('\n')}

## Blockers & Problem Hypotheses
${(note.blockers || []).map(b => `- ${b}`).join('\n')}
${(note.likely_problem_areas || []).map(p => `- Hypothesis: ${p.hypothesis}\n  Evidence: ${p.cited_evidence}`).join('\n')}

## Key Files & Commands
- Files: ${(note.relevant_files || []).join(', ')}
- Commands: ${(note.relevant_commands || []).join(', ')}
`.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
      {/* Card Header */}
      <div className="flex justify-between items-start gap-4" style={{ paddingBottom: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
        <div>
          <div className="section-label" style={{ color: 'var(--accent-blue)', marginBottom: '0.25rem' }}>
            <Sparkles size={14} />
            <span>Tomorrow's Resumption Brief</span>
          </div>
          <h2 className="card-title">
            {note.current_task}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted" style={{ marginTop: '0.5rem' }}>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              Generated {new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(created_at).toLocaleDateString()})
            </span>
            <span>•</span>
            <span className="pill pill-default" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
              Model: {model_used}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="btn-secondary"
            title="Copy as Markdown"
          >
            {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy Markdown"}</span>
          </button>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(noteRecord.id, !is_favorite)}
              className="btn-icon"
              style={{ color: is_favorite ? '#D97706' : 'var(--text-muted)' }}
            >
              <Bookmark size={16} fill={is_favorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* Structured Sections Grid */}
      <div className="grid grid-cols-1 lg-grid-cols-12 gap-6">
        
        {/* Left Column: What to do next & Blockers */}
        <div className="lg-col-span-7 space-y-6">
          
          {/* Priority Checklist */}
          <div className="subcard" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <h3 className="section-label" style={{ color: 'var(--accent-blue)' }}>
              <ArrowRight size={14} />
              <span>Recommended Next Steps</span>
            </h3>
            <div className="space-y-2">
              {(note.next_steps || []).map((step, idx) => {
                const isDone = !!checkedSteps[idx];
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="flex items-start gap-3"
                    style={{
                      background: isDone ? '#F8FAFC' : '#FFFFFF',
                      border: '1px solid ' + (isDone ? '#E2E8F0' : '#CBD5E1'),
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ marginTop: '0.15rem', color: isDone ? 'var(--accent-emerald)' : 'var(--text-dim)' }}>
                      {isDone ? <CheckSquare size={17} /> : <Square size={17} />}
                    </div>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      lineHeight: '1.4'
                    }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blockers & Identified Problem Areas */}
          <div className="subcard" style={{ background: 'var(--accent-rose-light)', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
            <h3 className="section-label" style={{ color: 'var(--accent-rose)', marginBottom: '0.75rem' }}>
              <AlertCircle size={14} />
              <span>Roadblocks & Hypotheses</span>
            </h3>

            {note.blockers && note.blockers.length > 0 && (
              <div className="space-y-2" style={{ marginBottom: '1rem' }}>
                {note.blockers.map((b, i) => (
                  <div key={i} className="text-sm" style={{ background: '#FFFFFF', border: '1px solid rgba(225, 29, 72, 0.3)', padding: '0.6rem 0.8rem', borderRadius: '6px', color: 'var(--accent-rose)' }}>
                    <strong>Blocker:</strong> {b}
                  </div>
                ))}
              </div>
            )}

            {note.likely_problem_areas && note.likely_problem_areas.length > 0 ? (
              <div className="space-y-2">
                {note.likely_problem_areas.map((prob, i) => (
                  <div key={i} style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem', fontWeight: '500' }}>
                      Potential cause: {prob.hypothesis}
                    </p>
                    <div style={{ background: '#F8FAFC', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <strong>Evidence: </strong><code>{prob.cited_evidence}</code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted" style={{ fontStyle: 'italic' }}>No blockers or errors recorded in this session.</p>
            )}
          </div>
        </div>

        {/* Right Column: Status Summary & Context */}
        <div className="lg-col-span-5 space-y-6">

          {/* Implementation State */}
          <div className="subcard">
            <h3 className="section-label">
              <span>Current Implementation State</span>
            </h3>
            <p className="text-sm text-secondary" style={{ lineHeight: '1.5', marginBottom: '1rem' }}>
              {note.current_state}
            </p>

            {note.progress && note.progress.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase" style={{ marginBottom: '0.5rem' }}>Work Completed:</h4>
                <ul className="space-y-1.5" style={{ listStyle: 'none' }}>
                  {note.progress.map((p, i) => (
                    <li key={i} className="text-xs text-secondary flex items-start gap-2">
                      <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key Files & Resume Commands */}
          <div className="subcard">
            <h3 className="section-label">
              <FileCode size={14} style={{ color: 'var(--accent-blue)' }} />
              <span>Resume Context</span>
            </h3>

            {note.relevant_files && note.relevant_files.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <span className="text-xs text-muted block" style={{ marginBottom: '0.4rem' }}>Modified Files:</span>
                <div className="flex flex-wrap gap-1">
                  {note.relevant_files.map((file, i) => (
                    <span key={i} className="font-mono text-xs" style={{ background: '#FFFFFF', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', color: 'var(--text-primary)' }}>
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {note.relevant_commands && note.relevant_commands.length > 0 && (
              <div>
                <span className="text-xs text-muted block" style={{ marginBottom: '0.4rem' }}>Resume Commands:</span>
                <div className="space-y-1.5">
                  {note.relevant_commands.map((cmd, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono" style={{ background: '#FFFFFF', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', color: 'var(--accent-blue)' }}>
                      <code>$ {cmd}</code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(cmd)}
                        className="btn-icon"
                        style={{ padding: '0.2rem', border: 'none', background: 'transparent' }}
                        title="Copy command"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
