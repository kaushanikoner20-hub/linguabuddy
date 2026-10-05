import React, { useRef, useState } from 'react';
import { MessageSquareHeart, RotateCcw } from 'lucide-react';
import ChatWindow from './components/Chatwindow.jsx';
import ChatInput from './components/Chatinput.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import LevelSelector from './components/LevelSelector.jsx';
import { sendChatMessage } from './services/Chatapi.js';
import { INITIAL_LEVEL } from './config/languages.js';

// How many earlier messages are sent along with each new message.
const MAX_HISTORY_MESSAGES = 12;

export default function App() {
  // [{ role: 'user' | 'assistant', content, correction?, vocabulary?, difficulty? }]
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // The selectors are the single source of truth for the session.
  // No language is assumed: '' means "not chosen yet".
  const [targetLanguage, setTargetLanguage] = useState('');
  const [level, setLevel] = useState(INITIAL_LEVEL);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || loading || !targetLanguage) return; // never send empty messages / without a language

    // History = everything before this new message. Only role + content are sent
    // (learning metadata such as corrections stays in the UI).
    const conversationHistory = messages
      .slice(-MAX_HISTORY_MESSAGES)
      .map(({ role, content }) => ({ role, content }));

    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setDraft('');
    setError(null);
    setLoading(true);

    try {
      // The CURRENT selector values are sent with every request.
      const result = await sendChatMessage(
        { message: text, conversationHistory, targetLanguage, level },
        controller.signal
      );
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.reply,
          translation: result.translation,
          tip: result.tip,
          correction: result.correction,
          vocabulary: result.vocabulary,
          difficulty: result.difficulty,
        },
      ]);
    } catch (err) {
      if (err.name === 'AbortError') return; // conversation was reset mid-request
      // Take the unsent message back out and restore it to the input for a retry.
      setMessages((prev) => prev.slice(0, -1));
      setDraft(text);
      setError(err.message);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const resetConversation = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setDraft('');
    setError(null);
    setLoading(false);
  };

  // Changing the language starts a fresh conversation so old-language history
  // is never mixed into the new language.
  const handleLanguageChange = (next) => {
    if (next === targetLanguage) return;
    resetConversation();
    setTargetLanguage(next);
  };

  // Changing the level keeps the conversation; the new level is sent with the next message.
  const handleLevelChange = (next) => setLevel(next);

  return (
    <div className="h-dvh bg-slate-900 text-slate-100 flex justify-center sm:p-4">
      <div className="w-full max-w-3xl h-full flex flex-col bg-slate-800 sm:border sm:border-slate-700 sm:rounded-2xl overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white leading-tight">LinguaBuddy</h1>
              <p className="text-xs sm:text-sm text-slate-400 truncate">Your patient language practice partner</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetConversation}
            disabled={messages.length === 0 && !loading && !error && !draft}
            className="shrink-0 flex items-center gap-1.5 text-xs sm:text-sm text-slate-200 border border-slate-600 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-3 py-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            New Conversation
          </button>
        </header>

        <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/40 space-y-2">
          <div className="flex gap-3">
            <LanguageSelector value={targetLanguage} onChange={handleLanguageChange} />
            <LevelSelector value={level} onChange={handleLevelChange} />
          </div>
          <p className="text-xs text-slate-400">
            {targetLanguage ? (
              <>
                Practicing: <span dir="auto" className="text-slate-200">{targetLanguage}</span> · {level}
              </>
            ) : (
              'Choose a language to start practicing'
            )}
          </p>
        </div>

        <ChatWindow messages={messages} loading={loading} error={error} ready={Boolean(targetLanguage)} />

        <ChatInput
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          disabled={loading}
          locked={!targetLanguage}
          placeholder={targetLanguage ? 'Type your message...' : 'Choose a language above to begin'}
        />
      </div>
    </div>
  );
}