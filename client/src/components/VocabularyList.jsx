import React from 'react';
import { BookOpen } from 'lucide-react';

// Compact vocabulary section. Works with any script; nothing assumes English words.
export default function VocabularyList({ items }) {
  const valid = (Array.isArray(items) ? items : []).filter(
    (v) => v && typeof v.word === 'string' && typeof v.meaning === 'string'
  );
  if (valid.length === 0) return null;

  return (
    <div className="mt-2 w-full rounded-xl border border-teal-400/20 bg-slate-900/60 px-3 py-2.5 text-sm space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-300">
        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
        {valid.length === 1 ? 'Useful expression' : 'Useful expressions'}
      </div>

      <ul className="space-y-2">
        {valid.map((v, i) => (
          <li key={`${v.word}-${i}`}>
            <span dir="auto" className="font-semibold text-slate-100 break-words">{v.word}</span>
            <span className="block text-slate-400">{v.meaning}</span>
            {typeof v.example === 'string' && v.example && (
              <span dir="auto" className="block text-slate-300 break-words">
                <span className="text-xs text-slate-500">Example: </span>
                {v.example}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}