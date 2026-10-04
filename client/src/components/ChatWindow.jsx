import React, { useEffect, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';

export default function ChatWindow({ messages, loading, error }) {
  const bottomRef = useRef(null);

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, error]);

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4" aria-live="polite">
      {messages.length === 0 && !loading && !error && (
        <p className="text-center text-sm text-slate-400 mt-10">
          Say hello to start practicing. Write in the language you want to practice.
        </p>
      )}

      {messages.map((m, i) => (
        <MessageBubble key={i} role={m.role} content={m.content} />
      ))}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400 px-1">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          LinguaBuddy is thinking...
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-2.5 bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 text-sm text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}