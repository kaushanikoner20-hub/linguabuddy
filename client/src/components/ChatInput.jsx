import React from 'react';
import { Send } from 'lucide-react';

// disabled: a reply is loading (sending is blocked, typing still allowed)
// locked:   no language chosen yet (input and Send are both disabled)
export default function ChatInput({ value, onChange, onSend, disabled, locked = false, placeholder = 'Type your message...' }) {
  const canSend = value.trim().length > 0 && !disabled && !locked;

  // A form submit covers both the Send button and Enter-to-send.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSend) onSend();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 sm:p-4 border-t border-slate-700 bg-slate-800">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Your message"
        maxLength={2000}
        autoComplete="off"
        disabled={locked}
        className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!canSend}
        className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm px-4 sm:px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Send className="w-4 h-4" aria-hidden="true" />
        <span>Send</span>
      </button>
    </form>
  );
}