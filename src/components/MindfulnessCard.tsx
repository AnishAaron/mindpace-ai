import { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';

interface MindfulnessCardProps {
  strategy: string;
}

export const MindfulnessCard = ({ strategy }: MindfulnessCardProps) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (timeLeft === 0) setTimeLeft(120);
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Breathing animation states based on time
  const isInhaling = timeLeft % 10 > 5;

  return (
    <div className="mb-8 p-6 bg-brand-50 border border-brand-200 rounded-xl shadow-sm relative overflow-hidden transition-all duration-500">
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-brand-900 mb-3">Adaptive Mindfulness</h3>
          <p className="text-brand-800 text-sm md:text-base mb-6 leading-relaxed">
            {strategy}
          </p>
          
          <button
            onClick={toggleTimer}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
              isActive 
                ? 'bg-red-100 text-red-700 hover:bg-red-200 ring-2 ring-red-400' 
                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md'
            }`}
          >
            {isActive ? (
              <>
                <Square className="w-5 h-5" fill="currentColor" /> Stop Exercise
              </>
            ) : (
              <>
                <Play className="w-5 h-5" fill="currentColor" /> Start 2-Min Action
              </>
            )}
          </button>
        </div>

        {/* Timer Visualization UI */}
        {(isActive || timeLeft < 120) && (
          <div className="w-48 h-48 flex-shrink-0 relative flex flex-col items-center justify-center bg-white rounded-full shadow-inner border-4 border-brand-100">
            {isActive && timeLeft > 0 ? (
              <div
                className="absolute inset-0 rounded-full bg-brand-200/50 transition-all duration-[4000ms] ease-in-out"
                style={{
                  transform: `scale(${isInhaling ? 0.9 : 0.6})`,
                  opacity: isInhaling ? 0.8 : 0.3,
                }}
              />
            ) : null}
            
            <div className="relative z-10 text-center">
              <div className="text-3xl font-bold text-brand-700 tabular-nums tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs font-semibold text-brand-500 uppercase mt-1 tracking-widest h-4">
                {isActive ? (isInhaling ? 'Breathe In' : 'Breathe Out') : (timeLeft === 0 ? 'Completed' : 'Paused')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
