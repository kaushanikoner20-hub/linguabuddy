const PROGRESS_KEY = 'linguabuddy.progress.v1';

const emptyProgress = () => ({
  sessionsCompleted: 0,
  totalPracticeMessages: 0,
  totalCorrections: 0,
  totalVocabulary: 0,
  reviewActivitiesCompleted: 0,
  topicsPracticed: [],
});

export function collectSessionLearning(messages) {
  const corrections = [];
  const vocabulary = [];
  const seenVocabulary = new Set();

  for (const message of Array.isArray(messages) ? messages : []) {
    if (message?.role !== 'assistant') continue;
    const correction = message.correction;
    if (correction && typeof correction.original === 'string' && typeof correction.corrected === 'string') {
      corrections.push({
        original: correction.original,
        corrected: correction.corrected,
        explanation: typeof correction.explanation === 'string' ? correction.explanation : '',
      });
    }

    for (const item of Array.isArray(message.vocabulary) ? message.vocabulary : []) {
      if (typeof item?.word !== 'string' || typeof item?.meaning !== 'string') continue;
      const key = item.word.trim().toLocaleLowerCase();
      if (!key || seenVocabulary.has(key)) continue;
      seenVocabulary.add(key);
      vocabulary.push({
        word: item.word,
        meaning: item.meaning,
        example: typeof item.example === 'string' ? item.example : '',
      });
    }
  }

  return { corrections: corrections.slice(-20), vocabulary: vocabulary.slice(0, 20) };
}

export function getSessionMetrics(messages, startedAt, endedAt = Date.now()) {
  const list = Array.isArray(messages) ? messages : [];
  const learning = collectSessionLearning(list);
  return {
    learnerMessages: list.filter((message) => message?.role === 'user').length,
    correctionCount: list.filter((message) => message?.role === 'assistant' && message.correction?.original && message.correction?.corrected).length,
    vocabularyCount: learning.vocabulary.length,
    durationSeconds: Number.isFinite(startedAt) ? Math.max(0, Math.floor((endedAt - startedAt) / 1000)) : 0,
    ...learning,
  };
}

export function makeFallbackSummary({ config, scenarioLabel, metrics }) {
  const scenario = scenarioLabel || config?.scenario || 'conversation practice';
  const hasPractice = metrics.learnerMessages > 0;
  return {
    overview: hasPractice
      ? `You practiced ${scenario.toLowerCase()} in ${metrics.learnerMessages} learner message${metrics.learnerMessages === 1 ? '' : 's'}.`
      : `You finished setting up a ${scenario.toLowerCase()} session. Send a message next time to begin practicing.`,
    strengths: hasPractice ? ['You made time to practice in your target language.'] : [],
    improvements: metrics.correctionCount
      ? ['Review the corrections below and try the improved forms in another message.']
      : hasPractice
        ? ['Keep practicing by adding details to your answers.']
        : [],
    corrections: metrics.corrections,
    vocabulary: metrics.vocabulary,
    insights: [
      ...(metrics.corrections.length ? [{ category: 'grammar', topic: 'Review your recent corrections', reason: 'These forms were corrected during this session, so they may be useful to revisit.', priority: 'medium' }] : []),
      ...(metrics.vocabulary.length ? [{ category: 'vocabulary', topic: 'Practice session vocabulary', reason: 'These words came up during this session and are ready for another practice round.', priority: 'medium' }] : []),
    ].slice(0, 3),
    fallback: true,
  };
}

function normalizeProgress(value) {
  const base = emptyProgress();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return base;
  for (const key of Object.keys(base)) {
    if (key === 'topicsPracticed') {
      base.topicsPracticed = Array.isArray(value[key]) ? [...new Set(value[key].filter((topic) => typeof topic === 'string' && topic.trim()).map((topic) => topic.trim().slice(0, 100)))].slice(0, 20) : [];
      continue;
    }
    const number = Number(value[key]);
    base[key] = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  }
  return base;
}

export function readLocalProgress(storage) {
  try {
    const source = storage || globalThis.localStorage;
    return normalizeProgress(JSON.parse(source.getItem(PROGRESS_KEY) || 'null'));
  } catch {
    return emptyProgress();
  }
}

export function addSessionToProgress(progress, metrics) {
  const current = normalizeProgress(progress);
  return {
    ...current,
    sessionsCompleted: current.sessionsCompleted + 1,
    totalPracticeMessages: current.totalPracticeMessages + metrics.learnerMessages,
    totalCorrections: current.totalCorrections + metrics.correctionCount,
    totalVocabulary: current.totalVocabulary + metrics.vocabularyCount,
  };
}

export function addReviewActivityToProgress(progress, topic) {
  const current = normalizeProgress(progress);
  const cleanTopic = typeof topic === 'string' ? topic.trim().slice(0, 100) : '';
  return {
    ...current,
    reviewActivitiesCompleted: current.reviewActivitiesCompleted + 1,
    topicsPracticed: cleanTopic ? [cleanTopic, ...current.topicsPracticed.filter((item) => item.toLocaleLowerCase() !== cleanTopic.toLocaleLowerCase())].slice(0, 20) : current.topicsPracticed,
  };
}

export function saveLocalProgress(progress, storage) {
  try {
    const destination = storage || globalThis.localStorage;
    destination.setItem(PROGRESS_KEY, JSON.stringify(normalizeProgress(progress)));
    return true;
  } catch {
    return false;
  }
}

export function formatDuration(seconds) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const remainder = Math.max(0, seconds) % 60;
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
}
