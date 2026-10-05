import React from 'react';
import { Sparkles } from 'lucide-react';

// Gentle correction card. dir="auto" lets each text block pick its own direction,
// so Latin, CJK, Cyrillic, Arabic, etc. all render correctly.
export default function CorrectionCard({ correction }) {
  if (!correction || typeof correction.original !== 'string' || typeof correction.corrected !== 'string') {
    return null;
  }

  return (
    <div className="mt-2 w-full rounded-xl border border-amber-400/30 bg-amber-950/20 px-3 py-2.5 text-sm space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        Small correction
      </div>

      <div>
        <span className="block text-xs text-slate-400">You wrote</span>
        <span dir="auto" className="block text-slate-200 break-words">{correction.original}</span>
      </div>

      <div>
        <span className="block text-xs text-slate-400">A more natural way</span>
        <span dir="auto" className="block text-teal-300 font-medium break-words">{correction.corrected}</span>
      </div>

      {correction.explanation && (
        <div>
          <span className="block text-xs text-slate-400">Why</span>
          <span dir="auto" className="block text-slate-300 break-words">{correction.explanation}</span>
        </div>
      )}
    </div>
  );
}