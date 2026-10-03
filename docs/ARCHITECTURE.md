# LinguaBuddy - Architecture Specification

## 1. System Architecture Diagram

```
User
  │
  ▼
React Frontend (Vite, Tailwind CSS, Lucide React)
  │
  ▼  HTTP / REST API (POST /api/chat)
Express Backend (Node.js)
  │
  ▼  Official SDK (@google/genai)
Gemma Service (server/src/services/gemmaService.js)
  │
  ▼  Google Gemini API
Google Gemma 4 (gemma-4-26b-a4b-it)
```

## 2. Component Responsibilities

### Frontend (`/client`)
- **Technology:** React, Vite, JavaScript, Tailwind CSS, Lucide React.
- **Responsibilities:**
  - Render user interface components (language practice UI, test input, status indicators).
  - Communicate exclusively with Express backend REST endpoints (`/api/health`, `/api/chat`).
  - **Security Rule:** Never imports or accesses `@google/genai` or API keys.

### Backend (`/server`)
- **Technology:** Node.js, Express, JavaScript.
- **Responsibilities:**
  - Expose API routes (`GET /api/health`, `POST /api/chat`).
  - Validate request payload (`message`) and handle HTTP errors gracefully.
  - Coordinate system prompt injection (`server/src/prompts/languagePartner.js`).
  - Load and protect server-side environment variables (`GEMINI_API_KEY`, `GEMMA_MODEL`).

### Gemma Service (`server/src/services/gemmaService.js`)
- **Technology:** `@google/genai` (Official Google Gen AI SDK v2.27+).
- **Responsibilities:**
  - Encapsulate interaction logic with Google Gemini API for model `gemma-4-26b-a4b-it`.
  - Pass system instruction from `languagePartner.js`.
  - Extract and return generated conversation text.

### Environment Variables & Security
- **Strict Isolation:** `GEMINI_API_KEY` resides strictly in `server/.env`.
- `server/.env` and root `.env` are explicitly ignored in `.gitignore`.
- All requests to Google Gemini endpoints originate strictly from server side.
