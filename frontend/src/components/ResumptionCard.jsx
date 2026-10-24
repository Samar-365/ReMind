import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRightCircle, 
  FileCode, 
  Terminal, 
  Bookmark, 
  Copy, 
  Check, 
  Share2, 
  Clock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function ResumptionCard({ noteRecord, onToggleFavorite }) {
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState({});

  if (!noteRecord || !noteRecord.note) {
    return null;
  }

  const { note, created_at, model_used, is_favorite, repo_name, branch } = noteRecord;

  const toggleCheck = (idx) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = () => {
    const md = `
# Tomorrow-Me Handoff: ${repo_name} (${new Date(created_at).toLocaleDateString()})

## 🎯 Current Task
${note.current_task}

## 🚀 Immediate Next Steps
${(note.next_steps || []).map(s => `- [ ] ${s}`).join('\n')}

## 🚧 Blockers & Problem Hypotheses
${(note.blockers || []).map(b => `- ${b}`).join('\n')}
${(note.likely_problem_areas || []).map(p => `- Hypothesis: ${p.hypothesis}\n  Evidence: ${p.cited_evidence}`).join('\n')}

## 📁 Key Files & Commands
- Files: ${(note.relevant_files || []).join(', ')}
- Commands: ${(note.relevant_commands || []).join(', ')}
`.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 mb-8 border-indigo-500/30 glow-primary">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Tomorrow's Resumption Brief</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            {note.current_task}
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(created_at).toLocaleString()}
            </span>
            <span>•</span>
            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-indigo-300">
              {model_used}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-700"
            title="Copy as Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Markdown" : "Export Markdown"}</span>
          </button>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(noteRecord.id, !is_favorite)}
              className={`p-2 rounded-lg border transition-colors ${
                is_favorite 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Next Steps & Blockers (Primary focus for resumption) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section: Immediate Next Steps */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-indigo-500/20">
            <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ArrowRightCircle className="w-4 h-4 text-indigo-400" />
              <span>Priority Resumption Steps</span>
            </h3>
            <div className="space-y-3">
              {(note.next_steps || []).map((step, idx) => (
                <label 
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    checkedSteps[idx] 
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-500 line-through' 
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-800 text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedSteps[idx]}
                    onChange={() => toggleCheck(idx)}
                    className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                  />
                  <span className="text-sm leading-relaxed">{step}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section: Blockers & Hypotheses */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-rose-500/20">
            <h3 className="text-sm font-semibold text-rose-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Blockers & Problem Hypotheses</span>
            </h3>

            {note.blockers && note.blockers.length > 0 ? (
              <div className="space-y-2 mb-4">
                {note.blockers.map((b, i) => (
                  <div key={i} className="text-xs text-rose-200 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
                    {b}
                  </div>
                ))}
              </div>
            ) : null}

            {note.likely_problem_areas && note.likely_problem_areas.length > 0 ? (
              <div className="space-y-3">
                {note.likely_problem_areas.map((prob, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                    <p className="text-sm font-medium text-slate-200 mb-1">
                      💡 {prob.hypothesis}
                    </p>
                    <div className="text-xs font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-900 break-all">
                      <span className="text-indigo-400">Evidence: </span>{prob.cited_evidence}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No critical roadblocks detected during this session.</p>
            )}
          </div>
        </div>

        {/* Right Column: Progress, Current State, Files & Commands */}
        <div className="lg:col-span-5 space-y-6">

          {/* Current State & Progress */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Current Implementation State</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {note.current_state}
            </p>

            {note.progress && note.progress.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Accomplished:</h4>
                <ul className="space-y-1.5">
                  {note.progress.map((p, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Relevant Files & Resume Commands */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Resume Context</span>
            </h3>

            {note.relevant_files && note.relevant_files.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-medium text-slate-400 block mb-1.5">Active Files:</span>
                <div className="flex flex-wrap gap-1.5">
                  {note.relevant_files.map((file, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-800 font-mono text-xs text-cyan-300 border border-slate-700/60">
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {note.relevant_commands && note.relevant_commands.length > 0 && (
              <div>
                <span className="text-xs font-medium text-slate-400 block mb-1.5">Resume Commands:</span>
                <div className="space-y-1.5">
                  {note.relevant_commands.map((cmd, i) => (
                    <div key={i} className="px-2.5 py-1.5 rounded bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800 flex items-center justify-between">
                      <code>{cmd}</code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(cmd)}
                        className="text-slate-500 hover:text-slate-300 ml-2"
                        title="Copy command"
                      >
                        <Copy className="w-3 h-3" />
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
