import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Cpu
} from 'lucide-react';

import SessionHero from './components/SessionHero';
import ResumptionCard from './components/ResumptionCard';
import ContextInspector from './components/ContextInspector';
import HistoryList from './components/HistoryList';

import { 
  fetchAggregatedContext, 
  generateHandoffNote, 
  fetchHandoffHistory, 
  fetchHandoffDetail,
  updateHandoff,
  deleteHandoff,
  fetchAiStatus
} from './services/api';

export default function App() {
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiStatus, setAiStatus] = useState(null);

  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepStage, setStepStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initial load
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoadingContext(true);
    setErrorMessage('');
    try {
      const [ctx, hist, ai] = await Promise.all([
        fetchAggregatedContext(),
        fetchHandoffHistory(),
        fetchAiStatus().catch(() => ({ available: false }))
      ]);

      setContext(ctx);
      setHistory(hist);
      setAiStatus(ai);

      // Select latest note by default if available
      if (hist && hist.length > 0) {
        const latestDetail = await fetchHandoffDetail(hist[0].id);
        setSelectedNote(latestDetail);
      }
    } catch (err) {
      setErrorMessage(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage('');
    setStepStage('Collecting & Scrubbing Context...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setStepStage('Inference via Local Gemma 2...');

      const newRecord = await generateHandoffNote({
        user_notes: userNotes,
        include_git: true,
        include_terminal: true,
        include_browser: true
      });

      setStepStage('Finalizing Structured Note...');
      await new Promise(r => setTimeout(r, 400));

      setSelectedNote(newRecord);
      setUserNotes('');

      // Refresh list
      const updatedHistory = await fetchHandoffHistory();
      setHistory(updatedHistory);
    } catch (err) {
      setErrorMessage(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setStepStage('');
    }
  };

  const handleSelectNote = async (id) => {
    try {
      const detail = await fetchHandoffDetail(id);
      setSelectedNote(detail);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(`Failed to load note detail: ${err.message}`);
    }
  };

  const handleToggleFavorite = async (id, newStatus) => {
    try {
      await updateHandoff(id, { is_favorite: newStatus });
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(prev => ({ ...prev, is_favorite: newStatus }));
      }
      setHistory(prev => prev.map(h => h.id === id ? { ...h, is_favorite: newStatus } : h));
    } catch (err) {
      setErrorMessage(`Failed to toggle bookmark: ${err.message}`);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this handoff note?")) return;
    try {
      await deleteHandoff(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null);
      }
    } catch (err) {
      setErrorMessage(`Failed to delete note: ${err.message}`);
    }
  };

  const filteredHistory = history.filter(item => {
    if (!searchQuery) return true;
    return item.current_task.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.repo_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navbar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-800/80 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center glow-primary shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">ReMind</h1>
              <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                v0.1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Tomorrow-Me Developer Handoff Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {aiStatus?.available ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <Cpu className="w-3.5 h-3.5" />
              Ollama: {aiStatus.selected_model}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-950/60 text-rose-400 border border-rose-800/60">
              <AlertCircle className="w-3.5 h-3.5" />
              Ollama Offline
            </span>
          )}

          <button
            onClick={loadDashboard}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Dashboard"
          >
            <RotateCw className={`w-4 h-4 ${isLoadingContext ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content */}
      <main>
        {/* Active Session Hero & Trigger */}
        <SessionHero
          context={context}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          stepStage={stepStage}
          userNotes={userNotes}
          setUserNotes={setUserNotes}
        />

        {/* Resumption Card (Tomorrow's Morning View) */}
        {selectedNote && (
          <ResumptionCard
            noteRecord={selectedNote}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Collapsible Context & Sanitization Inspector */}
        <ContextInspector context={context} />

        {/* History List */}
        <HistoryList
          history={filteredHistory}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDeleteNote}
          onToggleFavorite={handleToggleFavorite}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedId={selectedNote?.id}
        />
      </main>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>Tomorrow-Me Handoff • Privacy-first, local AI developer resumption.</p>
        <p className="font-mono text-[11px]">Local Gemma 2 Inference • Zero Cloud Leak</p>
      </footer>
    </div>
  );
}
