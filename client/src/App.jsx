import React, { useRef, useState } from 'react';
import { Loader2, MessageSquareHeart, RotateCcw } from 'lucide-react';
import ChatWindow from './components/Chatwindow.jsx';
import ChatInput from './components/Chatinput.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import LevelSelector from './components/LevelSelector.jsx';
import ScenarioSelector from './components/ScenarioSelector.jsx';
import { requestSessionSummary, sendChatMessage } from './services/Chatapi.js';
import { INITIAL_LEVEL, SUPPORTED_SCENARIOS } from './config/languages.js';
import Onboarding from './pages/Onboarding.jsx';
import SessionSummary from './pages/SessionSummary.jsx';
import {
  addSessionToProgress,
  getSessionMetrics,
  makeFallbackSummary,
  readLocalProgress,
  saveLocalProgress,
} from './utils/session.js';

// How many earlier messages are sent along with each new message.
const MAX_HISTORY_MESSAGES = 12;

export default function App() {
  // [{ role: 'user' | 'assistant', content, correction?, vocabulary?, difficulty? }]
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Session state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryMetrics, setSummaryMetrics] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [progress, setProgress] = useState(() => readLocalProgress());
  const completedRef = useRef(false);
  const [config, setConfig] = useState({
    targetLanguage: '',
    level: INITIAL_LEVEL,
    scenario: '',
  });

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || loading || !config.targetLanguage || !config.level || !config.scenario) return;

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
      // The CURRENT session config values are sent with every request.
      const result = await sendChatMessage(
        {
          message: text,
          conversationHistory,
          targetLanguage: config.targetLanguage,
          level: config.level,
          scenario: config.scenario
        },
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

  const startFreshPractice = () => {
    resetConversation();
    setSummary(null);
    setSummaryMetrics(null);
    setSummaryLoading(false);
    completedRef.current = false;
    setSessionStartedAt(Date.now());
    setSessionStarted(true);
  };

  const endSession = async () => {
    if (summaryLoading || completedRef.current) return;
    completedRef.current = true;
    setSummaryLoading(true);
    const scenarioLabel = SUPPORTED_SCENARIOS.find(({ value }) => value === config.scenario)?.label || config.scenario;
    const metrics = getSessionMetrics(messages, sessionStartedAt);
    setSummaryMetrics(metrics);
    const fallback = makeFallbackSummary({ config, scenarioLabel, metrics });
    let completedSummary = fallback;

    if (metrics.learnerMessages > 0) {
      try {
        const remoteSummary = await requestSessionSummary({
          targetLanguage: config.targetLanguage,
          level: config.level,
          scenario: config.scenario,
          conversationHistory: messages.slice(-12).map(({ role, content }) => ({ role, content })),
          corrections: metrics.corrections,
          vocabulary: metrics.vocabulary,
        });
        completedSummary = remoteSummary.fallback ? fallback : remoteSummary;
      } catch {
        // The local summary still includes session stats, corrections and vocabulary.
      }
    }

    const nextProgress = addSessionToProgress(readLocalProgress(), metrics);
    saveLocalProgress(nextProgress);
    setProgress(nextProgress);
    setSummary({ ...completedSummary, corrections: metrics.corrections, vocabulary: metrics.vocabulary });
    setSummaryLoading(false);
  };

  const returnToSettings = () => {
    resetConversation();
    setSummary(null);
    setSummaryMetrics(null);
    setSessionStartedAt(null);
    setSessionStarted(false);
    setSummaryLoading(false);
    completedRef.current = false;
  };

  const startPractice = () => {
    if (!config.targetLanguage || !config.level || !config.scenario) return;
    completedRef.current = false;
    setSessionStartedAt(Date.now());
    setSessionStarted(true);
  };

  const updateConfig = (key, value) => {
    if (config[key] === value) return;
    // Never carry turns into a session with different practice settings.
    resetConversation();
    setSummary(null);
    setSummaryMetrics(null);
    setSessionStartedAt(Date.now());
    completedRef.current = false;
    setConfig((current) => ({ ...current, [key]: value }));
  };

  if (summaryLoading) {
    return (
      <div className="h-dvh bg-slate-900 text-slate-100 flex justify-center sm:p-4">
        <div className="w-full max-w-3xl h-full flex flex-col items-center justify-center gap-3 bg-slate-800 sm:border sm:border-slate-700 sm:rounded-2xl">
          <Loader2 className="h-7 w-7 animate-spin text-teal-300" aria-hidden="true" />
          <p role="status" className="text-sm text-slate-300">Preparing your session summary…</p>
        </div>
      </div>
    );
  }

  if (summary) {
    const metrics = summaryMetrics || getSessionMetrics(messages, sessionStartedAt);
    return (
      <div className="h-dvh bg-slate-900 text-slate-100 flex justify-center sm:p-4">
        <div className="w-full max-w-3xl h-full flex flex-col bg-slate-800 sm:border sm:border-slate-700 sm:rounded-2xl overflow-hidden">
          <SessionSummary
            summary={summary}
            config={config}
            metrics={metrics}
            progress={progress}
            onPracticeAgain={startFreshPractice}
            onChangeSettings={returnToSettings}
          />
        </div>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="h-dvh bg-slate-900 text-slate-100 flex justify-center sm:p-4">
        <div className="w-full max-w-3xl h-full flex flex-col bg-slate-800 sm:border sm:border-slate-700 sm:rounded-2xl overflow-hidden">
          <Onboarding
            config={config}
            setConfig={setConfig}
            onStart={startPractice}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-slate-900 text-slate-100 flex justify-center sm:p-4">
      <div className="w-full max-w-3xl h-full flex flex-col bg-slate-800 sm:border sm:border-slate-700 sm:rounded-2xl overflow-hidden">
        <header className="flex items-center justify-between gap-2 px-3 py-3 border-b border-slate-700 sm:gap-3 sm:px-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white leading-tight sm:text-lg">LinguaBuddy</h1>
              <p className="hidden truncate text-xs text-slate-400 sm:block sm:text-sm">Your patient language practice partner</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={startFreshPractice}
              disabled={messages.length === 0 && !loading && !error && !draft}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-600 px-2 py-2 text-xs text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">New</span><span className="hidden sm:inline">New Conversation</span>
            </button>
            <button
              type="button"
              onClick={endSession}
              disabled={loading || summaryLoading}
              className="shrink-0 rounded-lg bg-teal-700 px-2 py-2 text-xs font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
            >
              <span className="sm:hidden">End</span><span className="hidden sm:inline">End Session</span>
            </button>
          </div>
        </header>

        <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/40 space-y-2">
          <div className="flex gap-3">
            <LanguageSelector
              value={config.targetLanguage}
              onChange={(val) => updateConfig('targetLanguage', val)}
            />
            <LevelSelector
              value={config.level}
              onChange={(val) => updateConfig('level', val)}
            />
            <ScenarioSelector
              value={config.scenario}
              onChange={(val) => updateConfig('scenario', val)}
            />
          </div>
          <p className="text-xs text-slate-400">
            {config.targetLanguage ? (
              <>
                Practicing: <span dir="auto" className="text-slate-200">{config.targetLanguage}</span> · {config.level}
                <br />Scenario: {SUPPORTED_SCENARIOS.find(({ value }) => value === config.scenario)?.label}
              </>
            ) : (
              'Choose your practice settings to begin'
            )}
          </p>
        </div>

        <ChatWindow messages={messages} loading={loading} error={error} ready={Boolean(config.targetLanguage)} />

        <ChatInput
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          disabled={loading}
          locked={!config.targetLanguage}
          placeholder={config.targetLanguage ? 'Type your message...' : 'Choose a language above to begin'}
        />
      </div>
    </div>
  );
}
