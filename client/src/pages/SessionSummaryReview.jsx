import React, { useState } from 'react';
import { SUPPORTED_SCENARIOS } from '../config/languages.js';
import CorrectionCard from '../components/CorrectionCard.jsx';
import VocabularyList from '../components/VocabularyList.jsx';
import { requestReviewActivity } from '../services/chatApi.js';
import { formatDuration } from '../utils/session.js';

function PointList({ title, items, color }) {
  const points = (Array.isArray(items) ? items : []).filter((item) => typeof item === 'string' && item.trim());
  if (!points.length) return null;
  return <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"><h3 className={`mb-2 text-sm font-semibold ${color}`}>{title}</h3><ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">{points.map((item, i) => <li key={`${i}-${item}`}>{item}</li>)}</ul></section>;
}

export default function SessionSummaryReview({ summary, config, metrics, progress, onPracticeAgain, onChangeSettings, onReviewComplete }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const scenarioLabel = SUPPORTED_SCENARIOS.find(({ value }) => value === config.scenario)?.label || config.scenario;
  const insights = Array.isArray(summary.insights) ? summary.insights.slice(0, 3) : [];

  const startReview = async (mode, category) => {
    if (loading || activity) return;
    const insight = (category && typeof category === 'object' ? category : insights.find((item) => item.category === category)) || insights[0];
    if (!insight) return;
    setLoading(true); setError('');
    try {
      setActivity(await requestReviewActivity({ targetLanguage: config.targetLanguage, level: config.level, scenario: config.scenario, mode, insight, corrections: summary.corrections, vocabulary: summary.vocabulary }));
    } catch (err) { setError(err.message || 'A review activity could not be prepared. Please try again.'); }
    finally { setLoading(false); }
  };

  const checkAnswer = () => {
    if (!activity || !answer || feedback) return;
    const correct = answer.normalize('NFC').trim().toLocaleLowerCase() === activity.expectedAnswer.normalize('NFC').trim().toLocaleLowerCase();
    setFeedback({ correct });
    onReviewComplete?.(activity.topic);
  };

  return <div className="flex-1 min-h-0 overflow-y-auto"><main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
    <header className="rounded-2xl border border-teal-400/20 bg-teal-950/20 p-5 text-center"><p className="text-xs font-semibold uppercase tracking-widest text-teal-300">Session Complete</p><h1 className="mt-1 text-2xl font-bold text-white">Nice work practicing!</h1><p className="mt-2 text-sm text-slate-300"><span dir="auto">{config.targetLanguage}</span> · {config.level} · {scenarioLabel}</p></header>
    {summary.fallback && <p role="status" className="rounded-lg border border-amber-400/20 bg-amber-950/20 p-3 text-sm text-amber-100">We couldn’t generate the full AI summary right now. Your session stats and learning notes are still available.</p>}
    <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"><h2 className="mb-1 text-sm font-semibold text-teal-300">Overview</h2><p className="text-sm leading-relaxed text-slate-200">{summary.overview}</p></section>
    <div className="grid gap-3 sm:grid-cols-2"><PointList title="What You Did Well" items={summary.strengths} color="text-teal-300"/><PointList title="Keep Practicing" items={summary.improvements} color="text-sky-300"/></div>
    {!!summary.corrections?.length && <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"><h2 className="mb-3 text-sm font-semibold text-amber-200">Corrections</h2><div className="space-y-2">{summary.corrections.map((item, i) => <CorrectionCard key={`${i}-${item.original}`} correction={item}/>)}</div></section>}
    {!!summary.vocabulary?.length && <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"><h2 className="mb-2 text-sm font-semibold text-teal-300">Useful Vocabulary</h2><VocabularyList items={summary.vocabulary}/></section>}

    <section className="rounded-xl border border-teal-400/20 bg-slate-900/50 p-4">
      <h2 className="mb-2 text-sm font-semibold text-teal-300">What to Practice Next</h2>
      {insights.length ? <><ul className="mb-3 space-y-2">{insights.map((item, i) => <li key={`${i}-${item.topic}`}><button type="button" disabled={loading || !!activity} onClick={() => startReview('weak-area', item)} className="w-full rounded-lg bg-slate-800 p-3 text-left hover:bg-slate-700 disabled:opacity-40"><p className="text-sm font-medium text-white">{item.topic}</p><p className="mt-1 text-xs text-slate-400">{item.reason}</p><span className="mt-2 inline-block text-xs font-semibold text-teal-300">Practice this topic</span></button></li>)}</ul>
        <div className="grid gap-2 sm:grid-cols-3">
          <button type="button" disabled={loading || !!activity || !summary.corrections?.length} onClick={() => startReview('mistakes', 'grammar')} className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-40">Review mistakes</button>
          <button type="button" disabled={loading || !!activity || !summary.vocabulary?.length} onClick={() => startReview('vocabulary', 'vocabulary')} className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-40">Practice vocabulary</button>
          <button type="button" disabled={loading || !!activity} onClick={() => startReview('weak-area')} className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-40">Practice a suggested area</button>
        </div>
      </> : <p className="text-sm text-slate-400">No specific review area stood out in this session. Keep practicing at your own pace.</p>}
      {loading && <p role="status" className="mt-3 text-sm text-teal-200">Preparing a short activity…</p>}{error && <p role="alert" className="mt-3 text-sm text-amber-200">{error}</p>}
      {activity && <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-teal-300">{activity.topic} · {activity.activityType.replaceAll('_', ' ')}</p><p className="mt-2 text-sm text-slate-300">{activity.instruction}</p><p dir="auto" className="mt-3 text-base font-medium text-white">{activity.question}</p>
        <div className="mt-3 space-y-2">{activity.options.map((option) => <label key={option} dir="auto" className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-600 p-3 text-sm text-slate-200 has-[:checked]:border-teal-400 has-[:checked]:bg-teal-950/40"><input type="radio" name="review-answer" value={option} checked={answer === option} disabled={!!feedback} onChange={() => setAnswer(option)}/>{option}</label>)}</div>
        {!feedback ? <button type="button" disabled={!answer} onClick={checkAnswer} className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Check answer</button> : <div role="status" className={`mt-3 rounded-lg p-3 text-sm ${feedback.correct ? 'bg-teal-950/50 text-teal-100' : 'bg-amber-950/40 text-amber-100'}`}><p className="font-semibold">{feedback.correct ? 'That’s right. Nice work.' : 'Almost. Keep going!'}</p>{!feedback.correct && <p dir="auto" className="mt-1">Answer: {activity.expectedAnswer}</p>}<p className="mt-1">{activity.explanation}</p></div>}
        {feedback && <button type="button" onClick={onPracticeAgain} className="mt-3 w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white">Start New Practice</button>}
      </div>}
    </section>

    <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"><h2 className="mb-3 text-sm font-semibold text-slate-100">Session Stats</h2><dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><dt className="text-slate-400">Messages</dt><dd className="font-semibold text-white">{metrics.learnerMessages}</dd></div><div><dt className="text-slate-400">Corrections</dt><dd className="font-semibold text-white">{metrics.correctionCount}</dd></div><div><dt className="text-slate-400">Vocabulary</dt><dd className="font-semibold text-white">{metrics.vocabularyCount}</dd></div><div><dt className="text-slate-400">Duration</dt><dd className="font-semibold text-white">{formatDuration(metrics.durationSeconds)}</dd></div></dl></section>
    <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"><h2 className="mb-3 text-sm font-semibold text-teal-300">Your Progress on This Device</h2><dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><dt className="text-slate-400">Sessions</dt><dd className="font-semibold text-white">{progress.sessionsCompleted}</dd></div><div><dt className="text-slate-400">Practice messages</dt><dd className="font-semibold text-white">{progress.totalPracticeMessages}</dd></div><div><dt className="text-slate-400">Corrections reviewed</dt><dd className="font-semibold text-white">{progress.totalCorrections}</dd></div><div><dt className="text-slate-400">Vocabulary learned</dt><dd className="font-semibold text-white">{progress.totalVocabulary}</dd></div><div><dt className="text-slate-400">Review activities</dt><dd className="font-semibold text-white">{progress.reviewActivitiesCompleted || 0}</dd></div><div><dt className="text-slate-400">Topics practiced</dt><dd className="font-semibold text-white">{progress.topicsPracticed?.length || 0}</dd></div></dl><p className="mt-3 text-xs text-slate-500">Progress stays in this browser. Conversations are not saved.</p></section>
    <footer className="flex flex-col gap-3 pb-2 sm:flex-row"><button type="button" onClick={onPracticeAgain} className="flex-1 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white transition hover:bg-teal-500">Practice Again</button><button type="button" onClick={onChangeSettings} className="flex-1 rounded-xl border border-slate-600 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-700">Change Settings</button></footer>
  </main></div>;
}
