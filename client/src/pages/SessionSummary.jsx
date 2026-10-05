import React from 'react';
import { SUPPORTED_SCENARIOS } from '../config/languages.js';
import CorrectionCard from '../components/CorrectionCard.jsx';
import VocabularyList from '../components/VocabularyList.jsx';
import { formatDuration } from '../utils/session.js';

function PointList({ title, items, color }) {
  const points = (Array.isArray(items) ? items : []).filter((item) => typeof item === 'string' && item.trim());
  if (!points.length) return null;
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <h3 className={`mb-2 text-sm font-semibold ${color}`}>{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
        {points.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
      </ul>
    </section>
  );
}

export default function SessionSummary({ summary, config, metrics, progress, onPracticeAgain, onChangeSettings }) {
  const scenarioLabel = SUPPORTED_SCENARIOS.find(({ value }) => value === config.scenario)?.label || config.scenario;
  const levelLabel = config.level.charAt(0).toUpperCase() + config.level.slice(1);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
        <header className="rounded-2xl border border-teal-400/20 bg-teal-950/20 p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">Session Complete</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Nice work practicing!</h1>
          <p className="mt-2 text-sm text-slate-300">
            <span dir="auto">{config.targetLanguage}</span> · {levelLabel} · {scenarioLabel}
          </p>
        </header>

        {summary.fallback && (
          <p role="status" className="rounded-lg border border-amber-400/20 bg-amber-950/20 p-3 text-sm text-amber-100">
            We couldn’t generate the full AI summary right now. Your session stats and learning notes are still available.
          </p>
        )}

        <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <h2 className="mb-1 text-sm font-semibold text-teal-300">Overview</h2>
          <p className="text-sm leading-relaxed text-slate-200">{summary.overview}</p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <PointList title="What You Did Well" items={summary.strengths} color="text-teal-300" />
          <PointList title="Keep Practicing" items={summary.improvements} color="text-sky-300" />
        </div>

        {!!summary.corrections?.length && (
          <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-amber-200">Corrections</h2>
            <div className="space-y-2">
              {summary.corrections.map((correction, index) => (
                <CorrectionCard key={`${index}-${correction.original}`} correction={correction} />
              ))}
            </div>
          </section>
        )}

        {!!summary.vocabulary?.length && (
          <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-teal-300">Useful Vocabulary</h2>
            <VocabularyList items={summary.vocabulary} />
          </section>
        )}

        <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">Session Stats</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><dt className="text-slate-400">Messages</dt><dd className="font-semibold text-white">{metrics.learnerMessages}</dd></div>
            <div><dt className="text-slate-400">Corrections</dt><dd className="font-semibold text-white">{metrics.correctionCount}</dd></div>
            <div><dt className="text-slate-400">Vocabulary</dt><dd className="font-semibold text-white">{metrics.vocabularyCount}</dd></div>
            <div><dt className="text-slate-400">Duration</dt><dd className="font-semibold text-white">{formatDuration(metrics.durationSeconds)}</dd></div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-teal-300">Your Progress on This Device</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><dt className="text-slate-400">Sessions</dt><dd className="font-semibold text-white">{progress.sessionsCompleted}</dd></div>
            <div><dt className="text-slate-400">Practice messages</dt><dd className="font-semibold text-white">{progress.totalPracticeMessages}</dd></div>
            <div><dt className="text-slate-400">Corrections reviewed</dt><dd className="font-semibold text-white">{progress.totalCorrections}</dd></div>
            <div><dt className="text-slate-400">Vocabulary learned</dt><dd className="font-semibold text-white">{progress.totalVocabulary}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">Progress stays in this browser. Conversations are not saved.</p>
        </section>

        <footer className="flex flex-col gap-3 pb-2 sm:flex-row">
          <button type="button" onClick={onPracticeAgain} className="flex-1 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white transition hover:bg-teal-500">
            Practice Again
          </button>
          <button type="button" onClick={onChangeSettings} className="flex-1 rounded-xl border border-slate-600 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-700">
            Change Settings
          </button>
        </footer>
      </main>
    </div>
  );
}
