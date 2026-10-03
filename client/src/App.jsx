import React, { useEffect, useState } from 'react';
import { MessageSquareHeart, Sparkles, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [healthStatus, setHealthStatus] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setHealthStatus({ loading: false, data, error: null }))
      .catch((err) => setHealthStatus({ loading: false, data: null, error: err.message }));
  }, []);

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

        {/* Stage 1 Foundation Notice */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Stage 1 — Project Foundation
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The project structure, backend health endpoint, documentation, and frontend layout are ready. The interactive language practice experience, scenario selection, and Google Gemma 4 AI partner integration will be implemented in upcoming stages.
          </p>
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
