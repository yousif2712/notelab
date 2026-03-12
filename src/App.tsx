import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Sparkles, History, Loader2, GraduationCap, ArrowRight } from 'lucide-react';
import { generateNotes } from './services/gemini';
import { NoteDisplay } from './components/NoteDisplay';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SavedNote {
  id: string;
  title: string;
  url: string;
  content: string;
  date: string;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedNote[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('notelab_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setNotes(null);

    try {
      const result = await generateNotes(url);
      setNotes(result);
      
      // Extract title from markdown if possible
      const titleMatch = result.match(/^# 🧪 Yousif’s NoteLab: (.*)$/m);
      const title = titleMatch ? titleMatch[1] : 'Untitled Lecture';

      const newNote: SavedNote = {
        id: Date.now().toString(),
        title,
        url,
        content: result,
        date: new Date().toLocaleDateString(),
      };

      const updatedHistory = [newNote, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('notelab_history', JSON.stringify(updatedHistory));
    } catch (err) {
      setError('Failed to analyze the video. Please ensure the URL is correct and the video is accessible.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (note: SavedNote) => {
    setNotes(note.content);
    setUrl(note.url);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-academic-border px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-academic-accent p-2 rounded-xl text-white">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">Yousif’s NoteLab</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Academic Research Engine</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-full transition-colors text-sm font-medium text-slate-600"
        >
          <History size={18} />
          <span>History</span>
        </button>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {/* Hero / Input Section */}
        <section className={cn(
          "transition-all duration-700 ease-in-out print:hidden",
          notes ? "mb-12" : "mt-20 mb-32 text-center"
        )}>
          {!notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-slate-900">
                Transform Lectures into <br />
                <span className="text-academic-accent italic font-serif">Structured Knowledge.</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                Paste a YouTube lecture URL below. Our AI researcher will extract key concepts, 
                technical details, and formulas into professional study notes.
              </p>
            </motion.div>
          )}

          <form 
            onSubmit={handleGenerate}
            className={cn(
              "relative max-w-3xl mx-auto transition-all duration-500",
              notes ? "scale-95" : "scale-100"
            )}
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-academic-accent transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube lecture URL (e.g., https://youtube.com/watch?v=...)"
                className="w-full pl-14 pr-32 py-5 bg-white border-2 border-academic-border rounded-2xl shadow-sm focus:border-academic-accent focus:ring-4 focus:ring-academic-accent/10 outline-none transition-all text-lg"
              />
              <button
                type="submit"
                disabled={loading || !url}
                className="absolute right-3 inset-y-3 px-6 bg-academic-accent text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                <span>{loading ? 'Analyzing...' : 'Generate'}</span>
              </button>
            </div>
          </form>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-red-500 mt-4 text-sm font-medium"
            >
              {error}
            </motion.p>
          )}
        </section>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-academic-accent/20 blur-3xl rounded-full animate-pulse" />
                <Loader2 className="animate-spin text-academic-accent relative" size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyzing Lecture Content</h3>
              <p className="text-slate-500 max-w-md italic">
                "Education is the most powerful weapon which you can use to change the world."
              </p>
              <div className="mt-8 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 bg-academic-accent rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {notes && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <NoteDisplay content={notes} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History Sidebar/Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl border-l border-academic-border flex flex-col"
            >
              <div className="p-6 border-b border-academic-border flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <History size={20} className="text-academic-accent" />
                  Recent Lab Notes
                </h3>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <ArrowRight size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No saved notes yet.</p>
                  </div>
                ) : (
                  history.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => loadFromHistory(note)}
                      className="w-full text-left p-4 rounded-xl border border-academic-border hover:border-academic-accent hover:bg-blue-50/50 transition-all group"
                    >
                      <h4 className="font-semibold text-slate-900 line-clamp-2 mb-1 group-hover:text-academic-accent transition-colors">
                        {note.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{note.date}</span>
                        <span className="truncate max-w-[150px]">{new URL(note.url).hostname}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="py-8 px-6 border-t border-academic-border text-center text-slate-400 text-sm print:hidden">
        <p>© 2026 Yousif’s NoteLab • Professional Academic Research Tool</p>
      </footer>
    </div>
  );
}
