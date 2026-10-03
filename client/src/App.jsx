import React, { useEffect, useState } from 'react';
import { MessageSquareHeart, Sparkles, Server, CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';

export default function App() {
  const [healthStatus, setHealthStatus] = useState({ loading: true, data: null, error: null });
  const [message, setMessage] = useState('Hello! I want to practice English.');
  const [chatState, setChatState] = useState({ loading: false, reply: null, error: null });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setHealthStatus({ loading: false, data, error: null }))
      .catch((err) => setHealthStatus({ loading: false, data: null, error: err.message }));
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || chatState.loading) return;

    setChatState({ loading: true, reply: null, error: null });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server returned status ${res.status}`);
      }

      setChatState({ loading: false, reply: data.reply, error: null });
    } catch (err) {
      setChatState({ loading: false, reply: null, error: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl text-center space-y-6">
        {/* Header */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 text-teal-400 mb-2">
          <MessageSquareHeart className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white">
          LinguaBuddy
        </h1>

        <p className="text-lg text-slate-300">
          A patient, supportive AI language-practice partner designed for real conversational learning.
        </p>

        {/* Stage 2 Integration Test Section */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 text-left space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Stage 2 — Gemma 4 Integration Test
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message to test Gemma..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition"
              disabled={chatState.loading}
            />
            <button
              type="submit"
              disabled={chatState.loading || !message.trim()}
              className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition"
            >
              {chatState.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send
                </>
              )}
            </button>
          </form>

          {/* AI Response Output Box */}
          {chatState.reply && (
            <div className="bg-slate-800 border border-teal-500/30 rounded-lg p-4 text-left space-y-1">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">
                Gemma 4 Response:
              </span>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {chatState.reply}
              </p>
            </div>
          )}

          {/* Error Display Box */}
          {chatState.error && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-4 text-left flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">
                  Error:
                </span>
                <p className="text-sm text-rose-200">
                  {chatState.error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Backend API Connection Check */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50">
          <span className="flex items-center gap-1.5 font-mono">
            <Server className="w-3.5 h-3.5" /> Backend Health:
          </span>

          {healthStatus.loading && <span className="text-amber-400">Connecting...</span>}
          {healthStatus.data && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {healthStatus.data.service} (Status: {healthStatus.data.status})
            </span>
          )}
          {healthStatus.error && (
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> Disconnected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
