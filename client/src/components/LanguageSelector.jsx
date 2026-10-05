import React from 'react';
import { SUPPORTED_LANGUAGES } from '../config/languages.js';

export default function LanguageSelector({ value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400 flex-1 min-w-0">
      Language
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
      >
        <option value="" disabled>
          Select a language...
        </option>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}