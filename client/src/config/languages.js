// Single source of truth for the options in the selectors.
// To support another language, add ONE line to SUPPORTED_LANGUAGES. No other code changes.
//   value: the language name sent to the backend and inserted into Gemma's prompt
//   label: what the learner sees (native name helps recognise it)
export const SUPPORTED_LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Japanese', label: 'Japanese (日本語)' },
  { value: 'Korean', label: 'Korean (한국어)' },
  { value: 'Spanish', label: 'Spanish (Español)' },
  { value: 'French', label: 'French (Français)' },
  { value: 'German', label: 'German (Deutsch)' },
  { value: 'Hindi', label: 'Hindi (हिन्दी)' },
  { value: 'Bengali', label: 'Bengali (বাংলা)' },
  { value: 'Italian', label: 'Italian (Italiano)' },
  { value: 'Portuguese', label: 'Portuguese (Português)' },
  { value: 'Mandarin Chinese', label: 'Mandarin Chinese (中文)' },
];

export const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// The level selector starts here. (There is deliberately NO default language:
// the learner must choose one, so no language is ever silently assumed.)
export const INITIAL_LEVEL = 'beginner';