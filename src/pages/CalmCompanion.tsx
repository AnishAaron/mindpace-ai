import { useState, useRef, useEffect } from 'react';
import { useGemini, ChatMessage } from '../hooks/useGemini';
import { useAppContext } from '../context/AppContext';

export const CalmCompanion = () => {
  const { user } = useAppContext();
  const { isProcessing, getCompanionResponse } = useGemini();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Build initial greeting reactively once user context is loaded
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (user && !initializedRef.current) {
      initializedRef.current = true;
      setMessages([
        {
          role: 'model',
          parts: [{ text: `Hello ${user.name}! 👋 I'm your CalmCompanion. How is your preparation for ${user.targetExam || 'your exam'} going today? Feel free to share anything on your mind.` }]
        }
      ]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user?.targetExam) return;

    const userText = inputValue.trim();
    setInputValue('');

    // Append user message immediately
    const updatedHistory = [...messages, { role: 'user' as const, parts: [{ text: userText }] }];
    setMessages(updatedHistory);

    // Fetch AI response
    const aiResponseText = await getCompanionResponse(messages, userText, user.targetExam);
    
    // Append AI response
    setMessages([...updatedHistory, { role: 'model' as const, parts: [{ text: aiResponseText }] }]);
  };

  // Loading state while user context initialises
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 flex items-center justify-center h-64">
        <p className="text-slate-400">Connecting to your companion...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900">CalmCompanion</h1>
        <p className="mt-2 text-slate-600">Your always-available AI buddy for stress relief and guidance.</p>
      </div>

      <div className="flex-1 card flex flex-col overflow-hidden mb-4 p-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <span className="text-sm">🤝</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-sm">🤝</span>
              </div>
              <div className="max-w-[75%] rounded-2xl px-5 py-3 bg-slate-100 text-slate-800 rounded-bl-none">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Talk to your CalmCompanion about ${user.targetExam} prep...`}
              className="flex-1 input-field"
              aria-label="Chat input"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              className="btn-primary disabled:opacity-50 min-w-[100px]"
            >
              {isProcessing ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
