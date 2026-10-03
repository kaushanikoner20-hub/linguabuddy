# LinguaBuddy 🗣️💬

A patient AI language-practice partner designed for real conversational practice.

## Overview
LinguaBuddy is an open-source project building a supportive companion for language learners. Rather than treating AI as a generic chatbot, LinguaBuddy adapts to the learner's target language, proficiency level, and chosen scenario to deliver natural conversation, gentle corrections, and structured explanations.

---

## Current Project Status: Stage 1 — Project Foundation
> ⚠️ **Notice:** Stage 1 establishes the baseline project architecture, client foundation, Express backend server, and documentation. AI conversation features and Google Gemma integration are planned for future stages and are **not yet implemented**.

---

## Tech Stack

### Frontend
- **React** (v18+)
- **Vite**
- **JavaScript**
- **Tailwind CSS**
- **Lucide React**

### Backend
- **Node.js**
- **Express**
- **JavaScript**

### Planned AI Integration (Future Stages)
- **Model:** Google Gemma 4 (`gemma-4-26b-a4b-it`)
- **SDK:** Official `@google/genai`

---

## Feature Roadmap & Status

| Feature | Status | Description |
| :--- | :--- | :--- |
| **Project Foundation & Docs** | ✅ Implemented | Base structure, docs, scripts, build config |
| **Backend Health Check** | ✅ Implemented | `GET /api/health` endpoint live |
| **Frontend Placeholder UI** | ✅ Implemented | React client landing layout |
| **Gemma 4 AI Service Integration** | ⏳ Planned | Server-side `@google/genai` integration |
| **Interactive Chat Experience** | ⏳ Planned | Multi-turn language conversation interface |
| **Gentle Language Corrections** | ⏳ Planned | Real-time grammar & phrasing feedback |
| **Session Summary & Progress** | ⏳ Planned | Vocabulary review & progress tracking |

---

## Project Structure

```
linguabuddy/
├── client/              # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── services/    # Client API services
│       ├── hooks/       # Custom React hooks
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── server/              # Node.js + Express backend
│   └── src/
│       ├── services/    # Server services (Gemma integration place)
│       ├── routes/      # Express API routes
│       ├── prompts/     # System prompts & templates
│       ├── middleware/  # Express middlewares
│       └── index.js     # Express server entrypoint
│
├── docs/                # Architecture & PRD documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── WORKFLOW.md
│   ├── AI_DESIGN.md
│   └── API.md
│
├── README.md
├── LICENSE
├── .gitignore
└── package.json
```

---

## Local Development Setup

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/linguabuddy.git
   cd linguabuddy
   ```

2. Install root and package dependencies:
   ```bash
   npm run setup
   ```

3. Set up environment configuration:
   ```bash
   cp server/.env.example server/.env
   ```

4. Start development servers:
   ```bash
   # Start client & server concurrently
   npm run dev
   ```
   - Client will run on `http://localhost:5173`
   - Server will run on `http://localhost:5000`

5. Verify health check:
   ```bash
   curl http://localhost:5000/api/health
   ```

---

## License
This project is open-source under the [MIT License](LICENSE).
