# LinguaBuddy 🗣️💬

A patient AI language-practice partner designed for real conversational practice.

## Overview

LinguaBuddy is an open-source project building a supportive companion for language learners. Rather than treating AI as a generic chatbot, LinguaBuddy is designed to adapt to the learner's target language, proficiency level, and chosen scenario to deliver natural conversation, gentle corrections, and structured explanations.

---

## Current Project Status: Stage 3 — Core Conversation Engine

> Stages 1-3 give you a working multi-turn chat with Google Gemma 4: the React client keeps the conversation, sends recent history to the Express backend, and the backend calls Gemma server-side. Corrections, language/level selection, vocabulary and summaries are **not yet implemented**.

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
| **Language / Level / Scenario Setup** | ⏳ Planned  | Choose target language, proficiency and scenario     |
| **Gentle Language Corrections**    | ⏳ Planned     | Real-time grammar & phrasing feedback                |
| **Session Summary & Progress**     | ⏳ Planned     | Vocabulary review & progress tracking                |

---

## Project Structure

```
linguabuddy/
├── client/              # React + Vite frontend
│   └── src/
│       ├── components/  # ChatWindow, MessageBubble, ChatInput
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
│       ├── utils/       # conversation.js (history handling) + tests
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

---

## License

This project is open-source under the [MIT License](LICENSE).