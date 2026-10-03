# LinguaBuddy - AI Integration Design

## 1. Overview
Google Gemma 4 is integrated into LinguaBuddy as a core conversational partner. The backend communicates with Google Gemma 4 server-side to generate natural, patient language-practice responses.

## 2. Configuration & Specifications

- **Selected Model:** `gemma-4-26b-a4b-it` (Configurable via `GEMMA_MODEL` environment variable)
- **Official SDK:** `@google/genai`
- **Access Method:** Google Gemini API (Server-Side invocation only)

## 3. Basic System Instruction (Stage 2)

```text
You are LinguaBuddy, a patient and encouraging language-practice partner.

Help a learner practice a target language through natural conversation.

Be supportive and non-judgmental.

Keep responses concise.

Do not overwhelm the learner with grammar explanations yet.

For this stage, focus primarily on having a natural conversation.
```

Stored in: `server/src/prompts/languagePartner.js`

## 4. Request & Response Flow

1. **Client Submission:** React client sends `POST /api/chat` with `{ "message": "..." }`.
2. **Route Validation:** `server/src/routes/chat.js` validates non-empty message.
3. **Gemma Service Invocation:** `generateConversationResponse()` calls `@google/genai` `ai.models.generateContent({ model: "gemma-4-26b-a4b-it", contents: userMessage, config: { systemInstruction } })`.
4. **Response Return:** Generated reply text returned to client: `{ "reply": "..." }`.

## 5. Security Approach
- `GEMINI_API_KEY` is loaded server-side via `dotenv`.
- Client applications never access Google API endpoints directly.
- `.env` files are ignored by `.gitignore`.
