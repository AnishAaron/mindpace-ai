import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';

interface TriggerStats {
  factor: string;
  count: number;
  recentEmotion: string;
  lastSeen: Date;
}

export const TriggerMatrix = () => {
  const { user } = useAppContext();
  const [triggersList, setTriggersList] = useState<{factor: string, emotion: string, timestamp: Date}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const logsRef = collection(db, 'users', user.id, 'journal_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const extractedTriggers: {factor: string, emotion: string, timestamp: Date}[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.triggers && Array.isArray(data.triggers)) {
          data.triggers.forEach(trigger => {
            extractedTriggers.push({
              factor: trigger,
              emotion: data.sentiment || 'Unknown',
              timestamp: data.timestamp?.toDate() || new Date()
            });
          });
        }
      });
      
      setTriggersList(extractedTriggers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Aggregate triggers by frequency
  const aggregatedTriggers = useMemo(() => {
    const statsMap = new Map<string, TriggerStats>();
    
    triggersList.forEach(t => {
      // Normalize trigger name for grouping
      const normalized = t.factor.trim().toLowerCase();
      
      if (statsMap.has(normalized)) {
        const existing = statsMap.get(normalized)!;
        statsMap.set(normalized, {
          factor: existing.factor, // keep original casing of first seen
          count: existing.count + 1,
          recentEmotion: t.timestamp > existing.lastSeen ? t.emotion : existing.recentEmotion,
          lastSeen: t.timestamp > existing.lastSeen ? t.timestamp : existing.lastSeen
        });
      } else {
        statsMap.set(normalized, {
          factor: t.factor,
          count: 1,
          recentEmotion: t.emotion,
          lastSeen: t.timestamp
        });
      }
    });

    // Sort by frequency (highest first)
    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count);
  }, [triggersList]);

  const getIntensityColor = (count: number) => {
    if (count >= 5) return 'bg-red-100 text-red-800 border-red-200';
    if (count >= 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center h-64">
        <p className="text-slate-500 font-medium">Analyzing your data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Trigger Matrix</h1>
        <p className="mt-2 text-slate-600">Identify and track what impacts your mental state.</p>
      </div>

      {aggregatedTriggers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500">No triggers identified yet. Keep using the Daily Vent!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aggregatedTriggers.map((trigger, idx) => (
            <div key={idx} className="card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 capitalize">{trigger.factor}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getIntensityColor(trigger.count)}`}>
                    Frequency: {trigger.count}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">
                  Latest Emotion: <span className="font-medium text-slate-800">{trigger.recentEmotion}</span>
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                Last identified: {trigger.lastSeen.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
