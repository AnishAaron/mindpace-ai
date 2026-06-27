import { useState } from 'react';
import { ExamType } from '../types';
import { EXAM_DATA } from '../config/examData';
import { EyeOff, Eye, Sparkles } from 'lucide-react';

interface ExamBannerProps {
  examType: ExamType;
}

export const ExamBanner = ({ examType }: ExamBannerProps) => {
  const info = EXAM_DATA[examType];
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsVisible(true)}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          aria-label="Show mindful guidance"
        >
          <Eye className="w-3.5 h-3.5" />
          Show Mindful Guidance for {info.name}
        </button>
      </div>
    );
  }

  return (
    <div className={`${info.bgColor} ${info.borderColor} border rounded-2xl p-5 mb-8 relative transition-all duration-300`}>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-colors"
        aria-label="Hide mindful guidance"
      >
        <EyeOff className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        <span className="text-4xl select-none" role="img" aria-hidden="true">{info.icon}</span>
        <div className="pr-8">
          <span className={`inline-block text-[10px] font-bold tracking-widest uppercase mb-1 px-2 py-0.5 rounded ${info.bgColor} ${info.color}`}>
            {info.category}
          </span>
          <h2 className="text-xl font-bold text-slate-800">{info.fullName}</h2>
          <p className="text-slate-600 text-sm mt-1.5 leading-relaxed font-medium">
            {info.calmingMessage}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200/50">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className={`w-4 h-4 ${info.color}`} />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mindful Reminders</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {info.mindfulReminders.map((reminder, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${info.color} bg-current opacity-60 flex-shrink-0`} />
              <span>{reminder}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
