import { GoogleGenAI } from '@google/genai';
import { useState } from 'react';

// Initialize the Google Gen AI SDK dynamically
const getAIClient = () => {
  const localKey = localStorage.getItem('gemini_api_key');
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  const apiKey = localKey || envKey;
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please set it in Settings.');
  }
  return new GoogleGenAI({ apiKey });
};

export interface AnalysisResult {
  sentimentAnalysis: string;
  triggers: string[];
  copingStrategy: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface WellbeingSummary {
  burnoutRiskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  burnoutRiskScore: number; // 0-100
  dominantEmotion: string;
  weeklyInsight: string;  // 2-3 sentence pattern insight
  affirmation: string;    // personalized daily affirmation
}

export const useGemini = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const analyzeJournalEntry = async (text: string, examType: string): Promise<AnalysisResult | null> => {
    setIsProcessing(true);
    try {
      const prompt = `You are an empathetic mental wellness coach for students preparing for ${examType}. Analyze the following journal entry: "${text}". Return a JSON object with:
sentimentAnalysis: (one of: 'Confident', 'Hopeful', 'Neutral', 'Anxious', 'Overwhelmed', 'Burned Out', 'Frustrated', 'Sad').
triggers: (A list of 2-4 specific exam-related stressors mentioned or implied).
copingStrategy: (A 3-sentence, hyper-contextual grounding exercise specific to their ${examType} pressure and the emotions detected).`;

      const response = await getAIClient().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      if (response.text) {
        return JSON.parse(response.text) as AnalysisResult;
      }
      return null;
    } catch (error) {
      console.error("Error analyzing journal entry:", error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Generates a holistic wellbeing summary from the student's recent journal history.
   * Used on the Dashboard to show Burnout Risk, dominant emotion, and a personalized affirmation.
   */
  const generateWellbeingSummary = async (
    recentEntries: { text: string; sentiment: string; triggers: string[] }[],
    examType: string,
    userName: string
  ): Promise<WellbeingSummary | null> => {
    if (recentEntries.length === 0) return null;
    setIsGeneratingSummary(true);
    try {
      const entriesSummary = recentEntries
        .slice(0, 7) // analyze last 7 entries max
        .map((e, i) => `Entry ${i + 1}: Sentiment="${e.sentiment}", Triggers=[${e.triggers.join(', ')}], Text="${e.text.slice(0, 150)}"`)
        .join('\n');

      const prompt = `You are a clinical-grade AI wellness analyst for competitive exam students. 
Here are the recent journal entries from ${userName}, a ${examType} aspirant:
${entriesSummary}

Analyze these entries holistically and return a JSON object with:
- burnoutRiskScore: integer from 0-100 (0=thriving, 100=critical burnout). Base this on sentiment pattern, trigger frequency, and emotional trajectory.
- burnoutRiskLevel: one of "Low" (0-30), "Moderate" (31-60), "High" (61-80), "Critical" (81-100).
- dominantEmotion: The most recurring emotional state across entries (one word/phrase).
- weeklyInsight: A 2-sentence compassionate insight about the emotional pattern you detected. Be specific to ${examType} context. Do NOT be generic.
- affirmation: A personalized, powerful 1-sentence motivational affirmation for ${userName} based on their specific ${examType} journey and recent struggles. Make it feel deeply personal, not generic.`;

      const response = await getAIClient().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as WellbeingSummary;
      }
      return null;
    } catch (error) {
      console.error("Error generating wellbeing summary:", error);
      return null;
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const getCompanionResponse = async (history: ChatMessage[], newText: string, examType: string): Promise<string> => {
    setIsProcessing(true);
    try {
      // The Gemini API requires conversations to start with a 'user' role message.
      // We filter out any leading 'model' messages (e.g., the greeting) from the
      // history before constructing the contents array.
      const filteredHistory = history.filter((_, i) => {
        if (i === 0 && history[0].role === 'model') return false;
        return true;
      });

      const contents: ChatMessage[] = [
        ...filteredHistory,
        { role: 'user', parts: [{ text: newText }] }
      ];

      const systemInstruction = `You are CalmCompanion, a warm, empathetic buddy for ${examType} aspirants. 
Your role: validate feelings, reduce study-related stress, provide hyper-personalized encouragement rooted in the challenges of ${examType} preparation.
RULES: Never give generic advice. Always tie your response to the unique pressure of ${examType}. Keep responses concise (2-4 sentences max). Always end with a question or actionable suggestion to keep the conversation going. Be human, not clinical.`;

      const response = await getAIClient().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents as any,
        config: {
          systemInstruction,
        }
      });
      
      return response.text || "I'm here with you. Take a breath, and feel free to share more.";
    } catch (error) {
      console.error("Error getting companion response:", error);
      return "I'm having trouble connecting right now, but please know I'm here for you. Take a deep breath.";
    } finally {
      setIsProcessing(false);
    }
  };


  /**
   * Returns an AI-generated, exam-specific journal prompt to help students
   * who don't know what to write about.
   */
  const getJournalPrompt = async (examType: string, recentSentiment?: string): Promise<string> => {
    try {
      const contextClue = recentSentiment
        ? `The student's most recent mood was "${recentSentiment}".`
        : '';

      const response = await getAIClient().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a journaling coach for ${examType} aspirants. ${contextClue}
Generate a single, thoughtful, open-ended journaling prompt specifically for a ${examType} student today. 
The prompt should encourage self-reflection about their preparation journey, stress, or motivation.
Return ONLY the prompt text, no quotes, no explanation. Keep it under 25 words.`
      });
      return response.text?.trim() || 'How are you feeling about your preparation today?';
    } catch {
      return 'What is the one thing weighing on your mind most about your exam prep right now?';
    }
  };

  return {
    isProcessing,
    isGeneratingSummary,
    analyzeJournalEntry,
    generateWellbeingSummary,
    getCompanionResponse,
    getJournalPrompt
  };
};
