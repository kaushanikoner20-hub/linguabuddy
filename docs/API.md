# LinguaBuddy - API Specification

This document describes the REST API of LinguaBuddy.

---

## Implemented Endpoints

### `GET /api/health`

Checks the server operational status.

- **Status:** Implemented (Stage 1)
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "service": "LinguaBuddy API"
  }
  ```

---

### `POST /api/chat`

Sends the learner's newest message, plus recent conversation history, to Gemma 4 and returns the reply. The server stores nothing: the client sends the history with every request.

- **Status:** Implemented (Stage 3 - multi-turn conversation)
- **Request Body:**
  ```json
  {
    "message": "My name is Kaushani.",
    "conversationHistory": [
      { "role": "user", "content": "Hello!" },
      { "role": "assistant", "content": "Hi! How are you today?" }
    ]
  }
  ```
  - `message` (string, required): non-empty, max 2000 characters.
  - `conversationHistory` (array, optional): earlier messages, oldest first. Each item is `{ "role": "user" | "assistant", "content": string }`. Invalid items are ignored, and only the most recent 12 messages are used.
- **Response `200 OK`:**
  ```json
  {
    "reply": "Nice to meet you, Kaushani! What made you interested in learning English?"
  }
  ```
- **Errors** (`{ "error": "<friendly message>" }`, never stack traces or keys):
  - `400` - message missing, empty, or too long.
  - `500` - AI service not configured, or the Gemma request failed.

---

## Planned Endpoints (Not Implemented Yet)

### Planned `POST /api/chat` extensions (later stages)

Language, level and scenario settings and structured corrections are planned:

```json
{
  "targetLanguage": "Spanish",
  "proficiencyLevel": "A2",
  "scenario": "Ordering Coffee"
}
```

with `corrections` and `suggestedVocab` added to the response. None of these fields are read by the server today.

### `POST /api/session-summary`

Generates an end-of-session summary and review notes.

- **Status:** Planned
- **Method:** `POST`
- **Path:** `/api/session-summary`
- **Request Body:**
  ```json
  {
    "sessionId": "session-123",
    "conversationHistory": []
  }
  ```
- **Response `200 OK` (Planned Structure):**
  ```json
  {
    "summary": "Great session! You practiced ordering coffee and asking about options.",
    "keyVocabulary": [
      { "word": "un café", "meaning": "a coffee" },
      { "word": "con leche", "meaning": "with milk" }
    ],
    "strengths": ["Clear sentence structure", "Good polite phrasing"],
    "areasToPractice": ["Gender agreement with articles"]
  }
  ```