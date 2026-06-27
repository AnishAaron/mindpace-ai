import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';
import { ExamType } from '../types';
import { EXAM_DATA, ALL_EXAMS } from '../config/examData';

export const Onboarding = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // If user already has an exam selected in Firestore, skip onboarding entirely
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (user.targetExam) {
    return <Navigate to="/daily-vent" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exam && user) {
      setIsSaving(true);
      try {
        await setDoc(doc(db, 'users', user.id), { targetExam: exam }, { merge: true });
        navigate('/daily-vent');
      } catch (error) {
        console.error('Error saving exam preference:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="card max-w-2xl w-full space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900">
            Welcome, {user.name}!
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            This is a one-time setup. Pick your target exam and we'll personalise everything for you.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Which exam are you preparing for?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_EXAMS.map((examType) => {
                const info = EXAM_DATA[examType];
                const isSelected = exam === examType;
                return (
                  <button
                    key={examType}
                    type="button"
                    onClick={() => setExam(examType)}
                    disabled={isSaving}
                    className={`flex flex-col items-center p-4 border-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? `${info.bgColor} ${info.borderColor} ${info.color} ring-2 ring-offset-1 ring-current shadow-md`
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                    aria-label={`Select ${info.fullName}`}
                  >
                    <span className="text-3xl mb-2">{info.icon}</span>
                    <span className="font-bold text-base">{info.name}</span>
                    <span className="text-xs mt-1 opacity-80 text-center leading-tight">{info.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {exam && (
            <div className={`p-4 rounded-xl border ${EXAM_DATA[exam].bgColor} ${EXAM_DATA[exam].borderColor}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${EXAM_DATA[exam].color}`}>
                {EXAM_DATA[exam].fullName}
              </p>
              <p className="text-slate-700 text-sm italic">"{EXAM_DATA[exam].motivationalTag}"</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!exam || isSaving}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Start My Journey →'}
          </button>
        </form>
      </div>
    </div>
  );
};
