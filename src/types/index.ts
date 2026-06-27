export type ExamType = 'NEET' | 'JEE' | 'UPSC' | 'CUET' | 'CAT' | 'GATE';

export interface User {
  id: string;
  name: string;
  targetExam: ExamType | null;
}

export interface JournalEntry {
  id: string;
  text: string;
  timestamp: string;
  sentiment?: string;
  triggers?: string[];
  copingStrategy?: string;
}

export interface TriggerData {
  id: string;
  factor: string;
  intensity: number; // 1 to 10
  emotion: string;
  timestamp: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
