# LinguaBuddy - Architecture Specification

## 1. System Architecture Diagram

```
User
  │
  ▼
React Frontend (Vite, Tailwind CSS, Lucide React)
  │   current session lives in React state; aggregate progress/topic labels are stored in browser localStorage
  ▼  HTTP / REST API  (chat, session summary, on-demand review activity)
Express Backend (Node.js)
  │   validates input, trims history, builds the language-aware prompt,
  │   parses Gemma's structured reply

  ▼  Official SDK (@google/genai)
Gemma Service (Server-Side)
  │
  ▼  Google Gemini API
Google Gemma 4 (gemma-4-26b-a4b-it)
```

## 2. Component Responsibilities

### Frontend (`/client`)
- **Technology:** React, Vite, JavaScript, Tailwind CSS, Lucide React.
- **Current structure (Stage 6):**
  - `App.jsx` - owns one session configuration (`targetLanguage`, `level`, `scenario`), temporary conversation/session metrics, and end-session flow.
  - `components/ChatWindow.jsx` - message list, "thinking" indicator, friendly error box.
  - `components/MessageBubble.jsx` - one user or LinguaBuddy message; shows optional learning info.
  - `components/CorrectionCard.jsx` / `components/VocabularyList.jsx` - gentle correction and vocabulary UI (shown only when present; `dir="auto"` for any script).
  - `pages/Onboarding.jsx` - requires the learner to choose language, level, and scenario before entering chat; no login or personal information is requested.
  - `pages/SessionSummaryReview.jsx` - renders the completed summary, review recommendations, and one optional activity.
  - `utils/session.js` - derives session stats, provides offline summary fallback, and stores aggregate local progress plus topic labels. No messages are stored there.
  - `components/LanguageSelector.jsx`, `LevelSelector.jsx`, `ScenarioSelector.jsx` - selectors backed by `config/languages.js`.
  - `config/languages.js` - the language, level, and scenario lists.
  - `components/ChatInput.jsx` - text input, Send button, Enter-to-send.
  - `services/chatApi.js` - calls the chat, summary, and review endpoints; converts failures into safe messages.
- **Session lifecycle:** starting or restarting practice begins a clean temporary session. End Session sends bounded recent turns and learning records to the summary endpoint. New Conversation clears temporary state and keeps configuration.
- **Review:** only after learner action, the client requests one structured activity using the same language/level/scenario configuration and the selected session insight.
- **Progress storage:** localStorage contains aggregate session/review counts and up to 20 short topic labels. It contains no raw conversation, identity, or analytics data.
- **Later stages:** no later-stage features are included in this architecture yet.

### Backend (`/server`)
- **Technology:** Node.js, Express, JavaScript.
- **Responsibilities:**
  - Expose `GET /api/health`, `POST /api/chat`, `POST /api/session-summary`, and `POST /api/review-activity`.
  - Validate requests, handle errors without leaking internals, apply CORS policy.
  - `utils/learnerContext.js` cleans target language data and validates scenario IDs. The level and scenario are required; there is no server-side default language.
  - `utils/gemmaResponse.js` safely parses Gemma's structured output (`reply`, `correction`, `vocabulary`, `difficulty`) and never crashes on missing or malformed optional parts.
  - `utils/conversation.js` sanitizes the client-sent history (valid roles, non-empty text, last 12 messages, starts with a user turn) and builds Gemma `contents`.
  - Securely use server-side environment variables (`GEMINI_API_KEY`).
  - **No server persistence:** no database, accounts, or server-side session memory.

### Gemma Service (`/server/src/services/gemmaService.js`)
- **Technology:** `@google/genai`.
- **Language-agnostic by design:** `prompts/languagePartner.js` builds one system instruction with target language, level, and scenario context. There is no per-language grammar code; Gemma decides which concepts matter (particles, honorifics, gender agreement, ...).
- **Responsibilities:** use the existing Gemma model for chat and a single on-demand summary after End Session. Summary output is validated; failures return a local summary built from session data.
- The summary may include up to three validated, evidence-based learning insights. A separate review-generation request occurs only after the learner picks a topic or review mode. Activities are validated server-side; answers are checked deterministically in the client.

### Environment Variables & Security
- **Strict Isolation:** `GEMINI_API_KEY` must **NEVER** be exposed to the client or checked into source control.
- All calls to the Gemini API originate from the server-side Express runtime.
- Configuration is loaded via `.env` files using `dotenv`; `.env` is git-ignored.

### Documentation (`/docs`)
- Authoritative reference for requirements, architecture, workflow, AI design, and API contracts.
