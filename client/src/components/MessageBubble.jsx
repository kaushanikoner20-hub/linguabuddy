import React from 'react';
import { Lightbulb } from 'lucide-react';
import CorrectionCard from './CorrectionCard.jsx';
import VocabularyList from './VocabularyList.jsx';

// A message may optionally carry learning info:
// { role, content, translation, tip, correction: null | {...}, vocabulary: [], difficulty }
export default function MessageBubble({ message }) {
  const { role, content, translation, tip, correction, vocabulary } = message;
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-slate-400 mb-1 px-1">
          {isUser ? 'You' : 'LinguaBuddy'}
        </span>
        <div
          dir="auto"
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words rounded-2xl ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-sm'
              : 'bg-slate-700 text-slate-100 border border-slate-600 rounded-bl-sm'
          }`}
        >
          {content}
        </div>

        {!isUser && translation && (
          <p dir="auto" className="mt-1 px-1 text-xs italic text-slate-400 break-words">
            {translation}
          </p>
        )}

        {!isUser && tip && (
          <div className="mt-2 w-full flex items-start gap-2 rounded-xl border border-sky-400/20 bg-sky-950/20 px-3 py-2 text-sm text-slate-300">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-sky-300" aria-hidden="true" />
            <span dir="auto" className="break-words">{tip}</span>
          </div>
        )}

        {!isUser && <CorrectionCard correction={correction} />}
        {!isUser && <VocabularyList items={vocabulary} />}
      </div>
    </div>
  );
}