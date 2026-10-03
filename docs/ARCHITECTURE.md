# LinguaBuddy - Architecture Specification

## 1. System Architecture Diagram

```
User
  │
  ▼
React Frontend (Vite, Tailwind CSS, Lucide React)
  │
  ▼  HTTP / REST API
Express Backend (Node.js)
  │
  ▼  Official SDK (@google/genai)
Gemma Service (Server-Side)
  │
  ▼  Google Gemini API
Google Gemma 4 (gemma-4-26b-a4b-it)
```

## 2. Component Responsibilities

### Frontend (`/client`)
- **Technology:** React, Vite, JavaScript, Tailwind CSS, Lucide React.
- **Responsibilities:**
  - Render user interface components (language selection, chat view, session summary).
  - Manage client-side application state (active screen, message history draft, selected settings).
  - Communicate with backend REST endpoints (`/api/health`, `/api/chat`, `/api/session-summary`).
  - Provide accessible, clean, and friendly user interactions.

### Backend (`/server`)
- **Technology:** Node.js, Express, JavaScript.
- **Responsibilities:**
  - Expose API endpoints for health checks and future conversation features.
  - Manage request validation, error handling, and CORS policy.
  - Coordinate system prompts and conversation context formatting before delegating to the Gemma Service.
  - Securely store and use server-side environment variables (`GEMINI_API_KEY`).

### Gemma Service (`/server/src/services/`)
- **Technology:** `@google/genai` (Google Official Gemini SDK).
- **Responsibilities:**
  - Encapsulate interaction logic with Google Gemini API for model `gemma-4-26b-a4b-it`.
  - Format user messages and system instructions for conversational, correction, and summary tasks.
  - Handle API response parsing, rate limits, and fallback logic.

### Environment Variables & Security
- **Strict Isolation:** `GEMINI_API_KEY` must **NEVER** be exposed to the client or checked into source control.
- All calls to the Gemini API originate strictly from the server-side Express runtime.
- Configuration is loaded via standard `.env` files using `dotenv`.

### Documentation (`/docs`)
- Maintains authoritative reference for requirements, architecture, workflow, AI design, and API contracts.
