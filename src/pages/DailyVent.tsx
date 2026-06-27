import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { JournalEntry } from '../types';
import { useGemini } from '../hooks/useGemini';
import { useAppContext } from '../context/AppContext';
import { MindfulnessCard } from '../components/MindfulnessCard';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const DailyVent = () => {
  const { user } = useAppContext();
  const { isProcessing, analyzeJournalEntry, getJournalPrompt } = useGemini();
  const location = useLocation();
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [latestStrategy, setLatestStrategy] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  
  const showReminder = location.state?.remindToLog;

  useEffect(() => {
    if (!user) return;
    
    const logsRef = collection(db, 'users', user.id, 'journal_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries: JournalEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEntries.push({
          id: doc.id,
          text: data.text,
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
          sentiment: data.sentiment,
          triggers: data.triggers,
          copingStrategy: data.copingStrategy
        });
      });
      setEntries(fetchedEntries);
    });

    return () => unsubscribe();
  }, [user]);

  const fetchAiPrompt = async () => {
    if (!user?.targetExam) return;
    setLoadingPrompt(true);
    const recentSentiment = entries.find(e => e.sentiment)?.sentiment;
    const prompt = await getJournalPrompt(user.targetExam, recentSentiment);
    setAiPrompt(prompt);
    setLoadingPrompt(false);
  };

  const usePrompt = () => {
    if (aiPrompt) setEntry(aiPrompt);
    setAiPrompt(null);
  };

  const handleSave = async () => {
    if (!entry.trim() || !user?.targetExam || !user?.id) return;
    
    const textToAnalyze = entry;
    setEntry('');
    setLatestStrategy(null);
    
    const analysis = await analyzeJournalEntry(textToAnalyze, user.targetExam);
    
    if (analysis?.copingStrategy) {
      setLatestStrategy(analysis.copingStrategy);
    }
    
    try {
      const logsRef = collection(db, 'users', user.id, 'journal_logs');
      await addDoc(logsRef, {
        text: textToAnalyze,
        timestamp: serverTimestamp(),
        sentiment: analysis?.sentimentAnalysis || null,
        triggers: analysis?.triggers || [],
        copingStrategy: analysis?.copingStrategy || null
      });
    } catch (error) {
      console.error("Error saving journal log:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Daily Vent</h1>
        <p className="mt-2 text-slate-600">A safe space to pour out your thoughts. Let it all out.</p>
      </div>

      {showReminder && (
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800">Mindful Reflection Prompt</h4>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Welcome back! To unlock your full emotional dashboard and track today's mental wellness score, take 2 minutes to vent your thoughts or use the AI prompt below.
            </p>
          </div>
        </div>
      )}

      <div className="card mb-8">
        {/* Smart Prompt Area */}
        {aiPrompt ? (
          <div className="mb-3 p-3 rounded-lg bg-brand-50 border border-brand-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-brand-800 italic">"{aiPrompt}"</p>
            </div>
            <button
              onClick={usePrompt}
              className="text-xs font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 px-2 py-1 rounded transition-colors whitespace-nowrap"
            >
              Use this
            </button>
          </div>
        ) : null}

        <textarea
          className="w-full h-48 p-4 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-brand-500 resize-none text-slate-700"
          placeholder="How are you feeling today? What's on your mind about your preparation?"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          aria-label="Journal entry text area"
          disabled={isProcessing}
        />
        <div className="mt-4 flex justify-between items-center gap-4">
          <button
            onClick={fetchAiPrompt}
            disabled={loadingPrompt || isProcessing}
            className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors disabled:opacity-40"
            aria-label="Get AI journal prompt"
          >
            {loadingPrompt
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Sparkles className="w-4 h-4" />}
            {loadingPrompt ? 'Thinking...' : 'Get a prompt'}
          </button>
          <div className="flex items-center gap-4">
            {isProcessing && <span className="text-sm text-brand-600 font-medium">AI is analyzing your thoughts...</span>}
            <button 
              onClick={handleSave}
              disabled={!entry.trim() || isProcessing}
              className="btn-primary disabled:opacity-50 flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isProcessing ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>

      {latestStrategy && (
        <MindfulnessCard strategy={latestStrategy} />
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Past Entries</h2>
        {entries.length === 0 ? (
          <p className="text-slate-500 italic">No entries yet. Start writing above.</p>
        ) : (
          entries.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                <p className="text-sm text-slate-500">
                  {new Date(item.timestamp).toLocaleDateString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                {item.sentiment && (
                  <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                    {item.sentiment}
                  </span>
                )}
              </div>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{item.text}</p>
              
              {item.triggers && item.triggers.length > 0 && (
                <div className="mt-4 pt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Identified Stressors</p>
                  <div className="flex gap-2 flex-wrap">
                    {item.triggers.map((trigger, idx) => (
                      <span key={idx} className="bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded text-xs font-medium">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
