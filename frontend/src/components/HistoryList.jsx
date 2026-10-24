import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Bookmark, 
  Calendar, 
  GitBranch, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function HistoryList({ 
  history, 
  onSelectNote, 
  onDeleteNote, 
  onToggleFavorite, 
  searchQuery, 
  setSearchQuery,
  selectedId 
}) {
  return (
    <div className="glass-panel p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Handoff History & Resumptions</span>
          </h3>
          <p className="text-xs text-slate-400">
            Saved local notes stored in SQLite
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or tasks..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {history && history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectNote(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500/50 glow-primary'
                    : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id, !item.is_favorite);
                    }}
                    className={`mt-0.5 p-1 rounded hover:bg-slate-800 transition-colors ${
                      item.is_favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate mb-1">
                      {item.current_task}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-indigo-300">
                        <GitBranch className="w-3 h-3" />
                        {item.repo_name} ({item.branch || 'main'})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(item.id);
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
          No handoff notes found. Click "Generate Tomorrow-Me Handoff" to create your first session brief.
        </div>
      )}
    </div>
  );
}
