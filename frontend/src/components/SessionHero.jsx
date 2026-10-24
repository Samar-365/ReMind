import React from 'react';
import { 
  GitBranch, 
  Terminal, 
  Globe, 
  FolderGit2, 
  FileEdit, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function SessionHero({ 
  context, 
  onGenerate, 
  isGenerating, 
  stepStage, 
  userNotes, 
  setUserNotes 
}) {
  const git = context?.git || {};
  const status = git?.status || {};
  const stagedCount = status.staged?.length || 0;
  const unstagedCount = status.unstaged?.length || 0;
  const untrackedCount = status.untracked?.length || 0;
  const totalModifications = stagedCount + unstagedCount + untrackedCount;

  return (
    <div className="glass-panel p-6 sm:p-8 relative overflow-hidden mb-8 border-indigo-500/20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Daemon Active
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Privacy Shield On (Local Gemma)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FolderGit2 className="w-7 h-7 text-indigo-400" />
            {git.repo_name ? git.repo_name : "Workspace Ready"}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-xs text-slate-200">{git.branch || 'main'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${stagedCount > 0 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                {stagedCount} staged
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${unstagedCount > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {unstagedCount} modified
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${untrackedCount > 0 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                {untrackedCount} untracked
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>{context?.terminal?.commands?.length || 0} terminal cmds</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              <span>{context?.browser?.tabs?.length || 0} research tabs</span>
            </div>
          </div>
        </div>

        {/* Action Button & Stepper */}
        <div className="flex flex-col items-start lg:items-end gap-3 min-w-[280px]">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2.5 transition-all shadow-lg ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 glow-primary active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span>{stepStage || "Synthesizing Handoff..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span>Generate Tomorrow-Me Handoff</span>
              </>
            )}
          </button>

          {isGenerating && (
            <p className="text-xs text-indigo-300 animate-pulse text-right">
              Analyzing diffs & drafting 7-section resumption note...
            </p>
          )}
        </div>
      </div>

      {/* Optional Note input */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <FileEdit className="w-3.5 h-3.5 text-indigo-400" />
          <span>Session Context Note (Optional)</span>
        </div>
        <input
          type="text"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="e.g. 'Refactored auth middleware and stopped at token expiration test...'"
          className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>
  );
}
