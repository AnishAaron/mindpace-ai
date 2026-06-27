import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';
import { useGemini, WellbeingSummary } from '../hooks/useGemini';
import { ExamBanner } from '../components/ExamBanner';
import { ExamType, JournalEntry } from '../types';
import { BookOpen, MessageSquare, Activity, TrendingUp, Flame, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const SENTIMENT_SCORE: Record<string, number> = {
  'Confident': 10,
  'Hopeful': 8,
  'Neutral': 5,
  'Anxious': 3,
  'Frustrated': 2,
  'Overwhelmed': 1,
  'Sad': 1,
  'Burned Out': 0,
};

const BURNOUT_COLOR = {
  Low: { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle },
  Moderate: { bar: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: TrendingUp },
  High: { bar: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle },
  Critical: { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: Flame },
};

export const Dashboard = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const { generateWellbeingSummary, isGeneratingSummary } = useGemini();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [wellbeing, setWellbeing] = useState<WellbeingSummary | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const hasFetchedSummary = useRef(false);

  // Subscribe to journal entries in real-time
  useEffect(() => {
    if (!user) return;
    const logsRef = collection(db, 'users', user.id, 'journal_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(30));
    const unsub = onSnapshot(q, (snap) => {
      const data: JournalEntry[] = snap.docs.map(d => {
        const docData = d.data();
        return {
          id: d.id,
          text: docData.text,
          timestamp: docData.timestamp?.toDate 
            ? docData.timestamp.toDate().toISOString() 
            : new Date(docData.timestamp || 0).toISOString(),
          sentiment: docData.sentiment,
          triggers: docData.triggers,
          copingStrategy: docData.copingStrategy
        };
      });
      setEntries(data);
      setLoadingData(false);
    });
    return () => unsub();
  }, [user]);

  // Auto-generate wellbeing summary once when entries are first loaded
  useEffect(() => {
    if (loadingData || entries.length === 0 || !user?.targetExam || hasFetchedSummary.current) return;
    
    const recent = entries
      .filter(e => e.sentiment)
      .slice(0, 7)
      .map(e => ({ text: e.text || '', sentiment: e.sentiment || '', triggers: e.triggers || [] }));

    if (recent.length === 0) return;

    hasFetchedSummary.current = true;
    generateWellbeingSummary(recent, user.targetExam, user.name)
      .then(result => {
        if (result) {
          setWellbeing(result);
        } else {
          // Reset so it can retry on next render if AI call failed
          hasFetchedSummary.current = false;
        }
      });
  }, [loadingData, entries.length, user?.targetExam]);

  // Compute total days journaled (non-punishing, no streak pressure)
  const daysJournaled = useMemo(() => {
    const uniqueDays = new Set(
      entries.map(e => {
        const ts = new Date(e.timestamp);
        return ts.toDateString();
      })
    );
    return uniqueDays.size;
  }, [entries]);

  // Compute average mood score this week (Mon–today)
  const avgWeeklyMood = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);
    const thisWeek = entries.filter(e => {
      const ts = new Date(e.timestamp);
      return ts >= weekAgo && e.sentiment;
    });
    if (thisWeek.length === 0) return null;
    const avg = thisWeek.reduce((sum, e) => sum + (e.sentiment ? SENTIMENT_SCORE[e.sentiment] ?? 5 : 5), 0) / thisWeek.length;
    if (avg >= 7) return { label: 'Good', color: 'text-emerald-600' };
    if (avg >= 4) return { label: 'Neutral', color: 'text-yellow-600' };
    return { label: 'Stressed', color: 'text-red-600' };
  }, [entries]);

  // Compute mood trend for the last 7 days (sparkline data)
  const moodTrend = useMemo(() => {
    const last7: { day: string; score: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const dayEntries = entries.filter(e => {
        const ts = new Date(e.timestamp);
        return ts.toDateString() === dayStr;
      });
      const avg = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + (e.sentiment ? SENTIMENT_SCORE[e.sentiment] ?? 5 : 5), 0) / dayEntries.length
        : -1; // no entry
      last7.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), score: avg, label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }) });
    }
    return last7;
  }, [entries]);

  const burnoutConfig = wellbeing ? BURNOUT_COLOR[wellbeing.burnoutRiskLevel] : null;
  const BurnoutIcon = burnoutConfig?.icon || CheckCircle;

  const recentSentiment = entries.find(e => e.sentiment)?.sentiment;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="mt-1 text-slate-600">Here's your mental wellness snapshot for today.</p>
      </div>

      {/* Exam Banner */}
      {user?.targetExam && <ExamBanner examType={user.targetExam as ExamType} />}

      {/* Stats Row — wellness-focused, no gamification */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center py-5">
          <p className="text-4xl font-bold text-brand-600">{daysJournaled}</p>
          <p className="text-sm text-slate-500 mt-1">Days Journaled</p>
        </div>
        <div className="card text-center py-5">
          <p className={`text-2xl font-bold ${avgWeeklyMood?.color || 'text-slate-800'}`}>
            {avgWeeklyMood?.label || '—'}
          </p>
          <p className="text-sm text-slate-500 mt-1">Avg Weekly Mood</p>
        </div>
        <div className="card text-center py-5">
          <p className="text-2xl font-bold text-slate-800">{recentSentiment || '—'}</p>
          <p className="text-sm text-slate-500 mt-1">Latest Mood</p>
        </div>
        <div className="card text-center py-5">
          <p className="text-4xl font-bold text-slate-800">
            {entries.filter(e => {
              const ts = new Date(e.timestamp);
              return ts.toDateString() === new Date().toDateString();
            }).length}
          </p>
          <p className="text-sm text-slate-500 mt-1">Entries Today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Burnout Risk Meter */}
        <div className="lg:col-span-2">
          {isGeneratingSummary ? (
            <div className="card flex flex-col items-center justify-center h-full min-h-[220px] gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <p className="text-sm">Analyzing your wellbeing...</p>
            </div>
          ) : wellbeing && burnoutConfig ? (
            <div className={`card border ${burnoutConfig.border} ${burnoutConfig.bg} h-full`}>
              <div className="flex items-center gap-3 mb-4">
                <BurnoutIcon className={`w-6 h-6 ${burnoutConfig.text}`} />
                <h2 className="text-lg font-bold text-slate-800">Burnout Risk</h2>
              </div>
              <p className={`text-4xl font-extrabold ${burnoutConfig.text} mb-1`}>{wellbeing.burnoutRiskLevel}</p>
              <p className="text-slate-500 text-sm mb-4">Score: {wellbeing.burnoutRiskScore}/100</p>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 mb-5">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${burnoutConfig.bar}`}
                  style={{ width: `${wellbeing.burnoutRiskScore}%` }}
                />
              </div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${burnoutConfig.text}`}>
                Dominant Pattern: {wellbeing.dominantEmotion}
              </p>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center h-full min-h-[220px] text-center gap-2">
              <BookOpen className="w-8 h-8 text-slate-300" />
              <p className="text-sm text-slate-500">Add a few journal entries to unlock your burnout risk analysis.</p>
            </div>
          )}
        </div>

        {/* Mood Trend Sparkline */}
        <div className="lg:col-span-3 card">
          <h2 className="text-lg font-bold text-slate-800 mb-4">7-Day Mood Trend</h2>
          <div className="flex items-end gap-2 h-32">
            {moodTrend.map((day) => {
              const hasData = day.score >= 0;
              const heightPct = hasData ? Math.max(8, (day.score / 10) * 100) : 8;
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1" title={`${day.label}: ${hasData ? day.score.toFixed(1) : 'No entry'}/10`}>
                  <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        !hasData ? 'bg-slate-100' :
                        day.score >= 7 ? 'bg-emerald-400' :
                        day.score >= 4 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{day.day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Positive</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span> Neutral</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Stressed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block"></span> No entry</span>
          </div>
        </div>
      </div>

      {/* AI Weekly Insight + Affirmation */}
      {wellbeing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card border border-violet-100 bg-violet-50">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-2">AI Insight · This Week</p>
            <p className="text-slate-700 leading-relaxed text-sm">{wellbeing.weeklyInsight}</p>
          </div>
          <div className="card border border-amber-100 bg-amber-50">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">✨ Today's Affirmation</p>
            <p className="text-slate-800 font-medium leading-relaxed text-sm italic">"{wellbeing.affirmation}"</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/daily-vent')}
          className="card hover:border-brand-300 hover:shadow-md transition-all group text-left border border-slate-200"
        >
          <BookOpen className="w-7 h-7 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-slate-800">Write Today's Entry</p>
          <p className="text-xs text-slate-500 mt-1">
            {recentSentiment ? `Last mood: ${recentSentiment}` : 'Start your first vent'}
          </p>
        </button>
        <button
          onClick={() => navigate('/calm-companion')}
          className="card hover:border-brand-300 hover:shadow-md transition-all group text-left border border-slate-200"
        >
          <MessageSquare className="w-7 h-7 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-slate-800">Talk to CalmCompanion</p>
          <p className="text-xs text-slate-500 mt-1">AI stress support, anytime</p>
        </button>
        <button
          onClick={() => navigate('/trigger-matrix')}
          className="card hover:border-brand-300 hover:shadow-md transition-all group text-left border border-slate-200"
        >
          <Activity className="w-7 h-7 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-slate-800">View Trigger Matrix</p>
          <p className="text-xs text-slate-500 mt-1">Analyze your stress patterns</p>
        </button>
      </div>
    </div>
  );
};
