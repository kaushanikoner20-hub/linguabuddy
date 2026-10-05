# LinguaBuddy - Architecture Specification

## 1. System Architecture Diagram

```
User
  │
  ▼
React Frontend (Vite, Tailwind CSS, Lucide React)
  │   conversation messages live in React state
  ▼  HTTP / REST API  (POST /api/chat: message, targetLanguage, level, scenario, recent history)
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
- **Current structure (Stage 3):**
  - `App.jsx` - owns one session configuration (`targetLanguage`, `level`, `scenario`) and conversation state; changing a setting clears history, while New Conversation keeps the settings.
  - `components/ChatWindow.jsx` - message list, "thinking" indicator, friendly error box.
  - `components/MessageBubble.jsx` - one user or LinguaBuddy message; shows optional learning info.
  - `components/CorrectionCard.jsx` / `components/VocabularyList.jsx` - gentle correction and vocabulary UI (shown only when present; `dir="auto"` for any script).
  - `pages/Onboarding.jsx` - requires the learner to choose language, level, and scenario before entering chat; no login or personal information is requested.
  - `components/LanguageSelector.jsx`, `LevelSelector.jsx`, `ScenarioSelector.jsx` - selectors backed by `config/languages.js`.
  - `config/languages.js` - the language, level, and scenario lists.
  - `components/ChatInput.jsx` - text input, Send button, Enter-to-send.
  - `services/chatApi.js` - the only place that calls `/api/chat`; converts failures into safe messages.
- **Conversation state:** an array of `{ role: "user" | "assistant", content }` held in React state only. Each request sends the new message plus the last 12 earlier messages.
- **Later stages:** session summary and lightweight progress.

### Backend (`/server`)
- **Technology:** Node.js, Express, JavaScript.
- **Responsibilities:**
  - Expose `GET /api/health` and `POST /api/chat`.
  - Validate requests, handle errors without leaking internals, apply CORS policy.
  - `utils/learnerContext.js` cleans target language data and validates scenario IDs. The level and scenario are required; there is no server-side default language.
  - `utils/gemmaResponse.js` safely parses Gemma's structured output (`reply`, `correction`, `vocabulary`, `difficulty`) and never crashes on missing or malformed optional parts.
  - `utils/conversation.js` sanitizes the client-sent history (valid roles, non-empty text, last 12 messages, starts with a user turn) and builds Gemma `contents`.
  - Securely use server-side environment variables (`GEMINI_API_KEY`).
  - **No persistence:** no database, sessions or server-side memory.

### Gemma Service (`/server/src/services/gemmaService.js`)
- **Technology:** `@google/genai`.
- **Language-agnostic by design:** `prompts/languagePartner.js` builds one system instruction with target language, level, and scenario context. There is no per-language grammar code; Gemma decides which concepts matter (particles, honorifics, gender agreement, ...).
- **Responsibilities:** call Gemma (`gemma-4-26b-a4b-it` by default, overridable with `GEMMA_MODEL`) with the system instruction from `prompts/languagePartner.js` and the multi-turn `contents`; return the reply text; throw on empty or failed responses.

### Environment Variables & Security
- **Strict Isolation:** `GEMINI_API_KEY` must **NEVER** be exposed to the client or checked into source control.
- All calls to the Gemini API originate from the server-side Express runtime.
- Configuration is loaded via `.env` files using `dotenv`; `.env` is git-ignored.

### Documentation (`/docs`)
- Authoritative reference for requirements, architecture, workflow, AI design, and API contracts.
