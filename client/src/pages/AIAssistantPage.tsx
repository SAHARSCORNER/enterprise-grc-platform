import React, { useState } from 'react';
import { Bot, Send, Sparkles, Terminal, FileText, ArrowRight } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  markdownDetails?: string;
  suggestedActions?: string[];
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello! I am your Enterprise GRC Intelligence Assistant. Ask me anything about employee risk, asset allocations, audit compliance, or vendor assessments.',
      suggestedActions: [
        'Show employees without assets',
        'List high-risk vendors',
        'Which department has the highest risk',
        'Show overdue audits',
      ],
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await apiFetch<any>('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ query: q }),
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.summary,
        markdownDetails: res.markdownDetails,
        suggestedActions: res.suggestedActions,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `AI Query failed: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            <span>GRC AI Assistant & Natural Language Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Pluggable local LLM / analytics engine inspecting enterprise live database</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-400">
          <Sparkles className="w-4 h-4" />
          <span>Local Engine Active</span>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 glass-panel">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="font-semibold">{msg.text}</div>

              {msg.markdownDetails && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                  {msg.markdownDetails}
                </div>
              )}

              {msg.suggestedActions && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(action)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-[11px] transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-cyan-400 text-xs animate-pulse p-3 bg-slate-900/60 rounded-xl w-fit">
            <Bot className="w-4 h-4" />
            <span>Analyzing enterprise GRC data streams...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex items-center space-x-3 shrink-0">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputQuery)}
          placeholder="Ask AI: 'Show employees without assets', 'List high-risk vendors', 'Summarize incident trends'..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 shadow-inner"
        />
        <button
          onClick={() => handleSend(inputQuery)}
          className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white rounded-xl shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
