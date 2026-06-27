import { ExamType } from '../types';

export interface ExamInfo {
  name: string;
  fullName: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  category: string;
  motivationalTag: string;
  calmingMessage: string;
  mindfulReminders: string[];
}

export const EXAM_DATA: Record<ExamType, ExamInfo> = {
  NEET: {
    name: 'NEET',
    fullName: 'National Eligibility cum Entrance Test',
    icon: '🩺',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50/60',
    borderColor: 'border-emerald-100',
    category: 'Medical Entrance Focus',
    motivationalTag: 'One concept at a time. Your journey to healing others starts with caring for yourself today.',
    calmingMessage: 'Your value is not defined by a scorecard. Take a deep breath and pace your learning.',
    mindfulReminders: [
      'Break biology sessions into active recall blocks',
      'Physics equations click better with a rested mind',
      'Remember to hydrate and stand up every hour',
      'Self-care is a vital part of your preparation'
    ]
  },
  JEE: {
    name: 'JEE',
    fullName: 'Joint Entrance Examination',
    icon: '⚙️',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50/60',
    borderColor: 'border-blue-100',
    category: 'Engineering Entrance Focus',
    motivationalTag: 'Solving complex problems is a marathon, not a sprint. Pace your mind.',
    calmingMessage: 'Engineering is about curiosity and persistence, not sleepless nights.',
    mindfulReminders: [
      'Take regular breaks between math practice sets',
      'Stuck on a physics problem? Step away for 5 minutes',
      'Patience is as important as speed',
      'Your brain needs sleep to consolidate concepts'
    ]
  },
  UPSC: {
    name: 'UPSC',
    fullName: 'Union Public Service Commission (CSE)',
    icon: '🏛️',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50/60',
    borderColor: 'border-amber-100',
    category: 'Civil Services Focus',
    motivationalTag: 'A vast journey is completed through small, steady daily steps.',
    calmingMessage: 'The syllabus is wide, but your mind is incredibly resilient. Focus on today\'s page.',
    mindfulReminders: [
      'Separate news reading from reflection time',
      'Write freely to untangle policy and study fatigue',
      'Resting your mind helps memory retention',
      'Celebrate today\'s effort, regardless of size'
    ]
  },
  CUET: {
    name: 'CUET',
    fullName: 'Common University Entrance Test',
    icon: '🎓',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50/60',
    borderColor: 'border-violet-100',
    category: 'University Admission Focus',
    motivationalTag: 'Step confidently into your university chapter by pacing yourself today.',
    calmingMessage: 'Multiple domains can feel chaotic, but you have the power to organize and focus.',
    mindfulReminders: [
      'Focus on one domain subject at a time',
      'Take deep breaths before starting mock tests',
      'Your future is full of diverse opportunities',
      'Keep your study desk clean and distraction-free'
    ]
  },
  CAT: {
    name: 'CAT',
    fullName: 'Common Admission Test',
    icon: '📊',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50/60',
    borderColor: 'border-rose-100',
    category: 'MBA Entrance Focus',
    motivationalTag: 'True leadership starts with self-awareness and mindful focus.',
    calmingMessage: 'Speed is build on accuracy, and accuracy is built on a calm mind.',
    mindfulReminders: [
      'Practice deep breathing between section sprints',
      'DILR puzzles are solved best with a clear head',
      'Quant speed improves when you aren\'t racing anxiety',
      'Set clear boundaries between mock analysis and sleep'
    ]
  },
  GATE: {
    name: 'GATE',
    fullName: 'Graduate Aptitude Test in Engineering',
    icon: '🔬',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50/60',
    borderColor: 'border-cyan-100',
    category: 'Graduate Study & PSU Focus',
    motivationalTag: 'Deep technical mastery thrives in a rested, mindful intellect.',
    calmingMessage: 'Core engineering concepts click when your mind is calm and receptive.',
    mindfulReminders: [
      'Take micro-breaks to stretch your neck and back',
      'Focus on conceptual clarity over raw repetition count',
      'PSU goals are reached with steady daily habits',
      'Let your mind rest to absorb core engineering topics'
    ]
  },
};

export const ALL_EXAMS: ExamType[] = ['NEET', 'JEE', 'UPSC', 'CUET', 'CAT', 'GATE'];
