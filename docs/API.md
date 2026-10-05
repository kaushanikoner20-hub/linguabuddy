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
    "scenario": "travel",
    "conversationHistory": [
      { "role": "user", "content": "こんにちは！" },
      { "role": "assistant", "content": "こんにちは！お元気ですか？" }
    ]
  }
  ```
  - `message` (string, required): non-empty, max 2000 characters, any Unicode.
  - `targetLanguage` (string, **required**): the language the learner selected in the UI. Any language name in any script (`"Japanese"`, `"日本語"`, `"Português (Brasil)"`). Treated as data and passed to Gemma; cleaned and limited to 40 characters. It is the source of truth: the AI never changes it based on what the learner types.
  - `level` (required): `beginner` | `intermediate` | `advanced`, from the level selector.
  - `scenario` (required): one of `free-conversation`, `travel`, `restaurant`, `job-interview`, `daily-life`, or `shopping`. The server maps this ID to contextual guidance for Gemma.
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
  - `400` - message missing, empty, or too long; target language missing; or invalid level/scenario.
  - `500` - AI service not configured, Gemma failed, or Gemma returned no usable reply.

### `POST /api/session-summary`

Requests one end-of-session summary using the same server-side Gemma model. The server stores no session data. If the conversation is empty, the key is unavailable, the provider times out/fails, or the model output is malformed, the API returns a factual local fallback with `fallback: true`.

- **Request Body:**
  ```json
  {
    "targetLanguage": "Japanese",
    "level": "beginner",
    "scenario": "travel",
    "conversationHistory": [
      { "role": "user", "content": "駅はどこですか？" },
      { "role": "assistant", "content": "駅はまっすぐ行ったところです。" }
    ],
    "corrections": [],
    "vocabulary": []
  }
  ```
  - `targetLanguage`, `level`, and `scenario` use the same values and validation as `POST /api/chat`.
  - `conversationHistory` is optional; malformed entries are ignored and only the latest 12 valid turns are considered.
  - `corrections` and `vocabulary` are optional session records. The server sanitizes these and never accepts new corrections/vocabulary from the summary model.

- **Response `200 OK`:**
  ```json
  {
    "overview": "You practiced asking for directions.",
    "strengths": ["You formed a clear question."],
    "improvements": ["Try adding a polite closing."],
    "corrections": [],
    "vocabulary": [],
    "fallback": false
  }
  ```
  `fallback` is true when a local summary was used. Session message/correction/vocabulary counts and duration are computed in the browser and are not sent to analytics.

- **Errors:** invalid configuration returns `400`. Provider/parse failures return the local fallback instead of exposing provider details.

### `POST /api/review-activity`

Generates one short multiple-choice activity only after the learner selects a review action. Uses the existing Gemma model and the active Stage 5 configuration; no activity or learner profile is persisted.

- **Request Body:** `targetLanguage`, `level`, and `scenario` use the same validation as `/api/chat`; `mode` is `mistakes`, `vocabulary`, or `weak-area`; `insight` contains a short `category`, `topic`, and `reason`; `corrections` and `vocabulary` are bounded optional session records.
- **Response `200 OK`:** `{ "activityType": "fill_blank", "topic": "...", "instruction": "...", "question": "...", "options": ["...", "...", "..."], "expectedAnswer": "...", "explanation": "..." }`.
- **Validation:** the server accepts only correction practice, fill-in-the-blank, or vocabulary activity types, three distinct non-empty options, and an expected answer that exactly matches an option. Malformed output produces a safe `503` response.
- **Answer checking:** the client checks the selected option deterministically and shows the explanation; no language-specific validator or additional model call is made.

## Privacy

Only aggregate review counts and up to 20 short topic labels are added to browser localStorage. Conversations and activity answers are temporary. No accounts, database, remote analytics, or learner profiling are added.
