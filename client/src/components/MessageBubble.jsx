import React from 'react';

export default function MessageBubble({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-slate-400 mb-1 px-1">
          {isUser ? 'You' : 'LinguaBuddy'}
        </span>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words rounded-2xl ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-sm'
              : 'bg-slate-700 text-slate-100 border border-slate-600 rounded-bl-sm'
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}