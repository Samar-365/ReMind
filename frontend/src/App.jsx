import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  AlertCircle, 
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
    <div className="app-container">
      {/* Top Navbar */}
      <header className="flex justify-between items-center" style={{ paddingBottom: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}>
            <Sparkles size={22} style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="title-main" style={{ fontSize: '1.25rem' }}>ReMind</h1>
              <span className="badge badge-indigo">
                v0.1.0
              </span>
            </div>
            <p className="text-xs text-muted">Tomorrow-Me Developer Handoff Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {aiStatus?.available ? (
            <span className="badge badge-emerald">
              <Cpu size={14} />
              Ollama: {aiStatus.selected_model}
            </span>
          ) : (
            <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#FDA4AF', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
              <AlertCircle size={14} />
              Ollama Offline
            </span>
          )}

          <button
            onClick={loadDashboard}
            className="btn-icon"
            title="Refresh Dashboard"
          >
            <RotateCw size={15} className={isLoadingContext ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Error alert */}
      {errorMessage && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(76, 5, 25, 0.4)', border: '1px solid rgba(225, 29, 72, 0.4)', color: '#FECDD3', fontSize: '0.875rem' }} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
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
      <footer className="flex justify-between items-center text-xs text-dim" style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <p>Tomorrow-Me Handoff • Privacy-first, local AI developer resumption.</p>
        <p className="font-mono text-xs">Local Gemma 2 Inference • Zero Cloud Leak</p>
      </footer>
    </div>
  );
}
