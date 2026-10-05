# LinguaBuddy - API Specification

## Implemented Endpoints

### `GET /api/health`

- **Response `200 OK`:** `{ "status": "ok", "service": "LinguaBuddy API" }`

### `POST /api/chat`

Sends the learner's newest message (plus settings and recent history) to Gemma 4 and returns a conversational reply with optional learning help. The server stores nothing.

- **Request Body:**
  ```json
  {
    "message": "昨日、映画を見ます。",
    "targetLanguage": "Japanese",
    "level": "beginner",
    "conversationHistory": [
      { "role": "user", "content": "こんにちは！" },
      { "role": "assistant", "content": "こんにちは！お元気ですか？" }
    ]
  }
  ```
  - `message` (string, required): non-empty, max 2000 characters, any Unicode.
  - `targetLanguage` (string, **required**): the language the learner selected in the UI. Any language name in any script (`"Japanese"`, `"日本語"`, `"Português (Brasil)"`). Treated as data and passed to Gemma; cleaned and limited to 40 characters. It is the source of truth: the AI never changes it based on what the learner types.
  - `level` (optional): `beginner` | `intermediate` | `advanced`, from the level selector. A missing or invalid value is treated as `beginner`.
  - `conversationHistory` (array, optional): earlier messages, oldest first, `{ role: "user" | "assistant", content }`. Invalid items are ignored; the most recent 12 are used.
  - There is **no default language**. A request without `targetLanguage` is rejected with `400`.

- **Response `200 OK`:**
  ```json
  {
    "reply": "それは楽しそうですね！何を見ましたか？",
    "translation": "That sounds fun! What did you watch?",
    "tip": "You can answer: 映画を見ました。 (I watched a movie.)",
    "correction": {
      "original": "昨日、映画を見ます。",
      "corrected": "昨日、映画を見ました。",
      "explanation": "「昨日」は過去のことなので、「見ました」が自然です。"
    },
    "vocabulary": [
      { "word": "楽しい", "meaning": "fun / enjoyable", "example": "映画は楽しかったです。" }
    ],
    "difficulty": "beginner"
  }
  ```
  - `translation` is the English translation of the reply and `tip` is a short English hint on how to answer. Both are `null` when not needed (always given for beginners; usually omitted for advanced learners or when the target language is English). English is the guidance language for now (`SUPPORT_LANGUAGE` in `server/src/prompts/languagePartner.js`).
  - `correction` is `null` when no meaningful correction is needed.
  - `vocabulary` is an array of 0-3 items (`word` and `example` in the target language, `meaning` a short gloss).
  - `difficulty` is `beginner`, `intermediate` or `advanced`.
  - Malformed optional parts from Gemma are dropped instead of causing errors.
- **Errors** (`{ "error": "<friendly message>" }`, never stack traces or keys):
  - `400` - message missing, empty, or too long, or `targetLanguage` missing.
  - `500` - AI service not configured, Gemma failed, or Gemma returned no usable reply.

## Planned (Not Implemented Yet)

- `scenario` request field and selector.
- `POST /api/session-summary`: end-of-session summary, key vocabulary, strengths and areas to practice.