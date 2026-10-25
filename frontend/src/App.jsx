import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';

import SessionHero from './components/SessionHero';
import ResumptionCard from './components/ResumptionCard';
import ContextInspector from './components/ContextInspector';
import HistoryList from './components/HistoryList';
import LandingPage from './components/LandingPage';

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
  const [view, setView] = useState('landing');
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
      setErrorMessage(`Unable to connect: ${err.message}`);
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage('');
    setStepStage('Collecting recent git diffs & terminal history...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setStepStage('Analyzing with local Gemma model...');

      const newRecord = await generateHandoffNote({
        user_notes: userNotes,
        include_git: true,
        include_terminal: true,
        include_browser: true,
        include_windows: true
      });

      setStepStage('Structuring resumption checklist...');
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
      setErrorMessage(`Failed to open note: ${err.message}`);
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
      setErrorMessage(`Failed to bookmark: ${err.message}`);
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
      setErrorMessage(`Failed to delete: ${err.message}`);
    }
  };

  const filteredHistory = history.filter(item => {
    if (!searchQuery) return true;
    return item.current_task.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.repo_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (view === 'landing') {
    return <LandingPage onLaunchApp={() => setView('dashboard')} />;
  }

  return (
    <div className="app-container">
      {/* Top Header Navigation */}
      <header className="flex justify-between items-center" style={{ paddingBottom: '1.25rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '40px', height: '40px', background: 'var(--accent-blue-light)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="header-title" style={{ margin: 0 }}>ReMind</h1>
              <span className="pill pill-blue" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                Dashboard
              </span>
            </div>
            <p className="text-xs text-muted">
              Tomorrow-Me Developer Resumption Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('landing')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            title="Return to Landing Page"
          >
            <ArrowLeft size={13} />
            <span>Product Overview</span>
          </button>

          <button
            onClick={loadDashboard}
            className="btn-secondary"
            title="Refresh dashboard"
          >
            <RotateCw size={13} className={isLoadingContext ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {errorMessage && (
        <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', background: 'var(--accent-rose-light)', border: '1px solid rgba(225, 29, 72, 0.3)', borderRadius: '8px', color: 'var(--accent-rose)', fontSize: '0.875rem' }} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content */}
      <main>
        {/* Active Session & Generate Hero */}
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

        {/* Context Inspector */}
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
      <footer className="flex justify-between items-center text-xs text-muted" style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
        <p>Tomorrow-Me Handoff • Privacy-first, local AI resumption notes.</p>
        <p>Local Gemma 2 Model • Zero Cloud Upload</p>
      </footer>
    </div>
  );
}
