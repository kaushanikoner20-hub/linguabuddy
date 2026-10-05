# LinguaBuddy 🗣️💬

A patient AI language-practice partner designed for real conversational practice.

## Overview

LinguaBuddy is an open-source project building a supportive companion for language learners. Rather than treating AI as a generic chatbot, LinguaBuddy is designed to adapt to the learner's target language, proficiency level, and chosen scenario to deliver natural conversation, gentle corrections, and structured explanations.

---

## Current Project Status: Stage 4 — Universal Language Learning Intelligence

> LinguaBuddy is a **language-agnostic** practice partner. The learner's target language and level are sent to the backend as plain data and passed to Gemma 4, which performs the language-aware conversation, gentle corrections, vocabulary suggestions and level adaptation. There is no per-language grammar code in the app.
>
> The learner picks the **Language** and **Level** in selectors at the top of the app. Those selections are the source of truth and are sent with every chat request. Not yet implemented: scenario selector, session summary, progress tracking.

---

## Tech Stack

### Frontend
- **React** (v18+), **Vite**, **JavaScript**, **Tailwind CSS**, **Lucide React**

### Backend
- **Node.js**, **Express**, **JavaScript**

### AI
- **Model:** Google Gemma 4 (`gemma-4-26b-a4b-it`)
- **SDK:** Official `@google/genai` (server-side only; the API key never reaches the browser)

---

## Feature Roadmap & Status

| Feature                            | Status        | Description                                          |
| ---------------------------------- | ------------- | ---------------------------------------------------- |
| **Project Foundation & Docs**      | ✅ Implemented | Base structure, docs, scripts, build config          |
| **Backend Health Check**           | ✅ Implemented | `GET /api/health` endpoint                           |
| **Gemma 4 AI Service Integration** | ✅ Implemented | Server-side `@google/genai`, `POST /api/chat`        |
| **Interactive Chat Experience**    | ✅ Implemented | Multi-turn chat UI, loading/error states, New Conversation |
| **Gentle Corrections, Vocabulary, Adaptive Level** | ✅ Implemented | Gemma returns optional correction/vocabulary; any target language |
| **Language & Level Selectors**     | ✅ Implemented | Choose the target language and level; sent to Gemma on every request |
| **Scenario Selector**              | ⏳ Planned     | Choose a conversation scenario                       |
| **Session Summary & Progress**     | ⏳ Planned     | Vocabulary review & progress tracking                |

---

## Multilingual Design

- **Supported by architecture:** any target language Gemma can handle (for example English, Japanese, Korean, Spanish, French, German, Hindi, Bengali, Italian, Portuguese, Mandarin Chinese). The language is data (`targetLanguage`), not application logic.
- **Actually tested:** only the languages listed in `docs/AI_DESIGN.md` under "Testing log". Support for other languages is expected but has not been individually tested.
- **Choosing a language:** use the Language and Level selectors. No language is assumed: you choose one before chatting. Changing the language starts a new conversation; changing the level applies from the next message.
- **Adding a language:** add one line to `client/src/config/languages.js`.

---

## Project Structure

```
linguabuddy/
├── client/              # React + Vite frontend
│   └── src/
│       ├── components/  # ChatWindow, MessageBubble, ChatInput, CorrectionCard, VocabularyList,
│       │                #   LanguageSelector, LevelSelector
│       ├── config/      # languages.js (supported languages + levels)
│       ├── services/    # chatApi.js (calls /api/chat)
│       ├── App.jsx      # conversation state
│       ├── main.jsx
│       └── index.css
│
├── server/              # Node.js + Express backend
│   └── src/
│       ├── services/    # gemmaService.js (Gemma 4 integration)
│       ├── routes/      # chat.js (POST /api/chat)
│       ├── prompts/     # languagePartner.js (system instruction)
│       ├── utils/       # conversation.js, learnerContext.js, gemmaResponse.js + tests
│       └── index.js     # Express server entrypoint
│
├── docs/                # PRD, ARCHITECTURE, WORKFLOW, AI_DESIGN, API
├── README.md
├── LICENSE
├── .gitignore
└── package.json
```

---

## Local Development Setup

### Prerequisites
- **Node.js** (v18.0 or higher), **npm** (v9.0 or higher)
- A Google Gemini API key (free from Google AI Studio)

### Installation

1. Clone the repository:

```
git clone https://github.com/kaushanikoner20-hub/linguabuddy.git
cd linguabuddy
```

2. Install root, client and server dependencies:

```
npm run setup
```

3. Set up environment configuration and add your own key to `server/.env` (this file is git-ignored; never commit it):

```
cp server/.env.example server/.env
```

4. Start the client and server together:

```
npm run dev
```

  - Client: `http://localhost:5173`
  - Server: `http://localhost:5000`

5. Verify the health check:

```
curl http://localhost:5000/api/health
```

6. Run the backend unit tests:

```
npm run test:server
```

7. With the server running (and your key set), run the end-to-end smoke test:

```
npm run test:smoke
```

8. Review Gemma's behaviour in several languages:

```
npm run test:languages
```

---

## License

This project is open-source under the [MIT License](LICENSE).