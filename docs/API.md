# LinguaBuddy - API Specification

This document details the planned REST API endpoints for LinguaBuddy.

---

## Implemented Endpoints (Stage 1)

### `GET /api/health`

Checks the server operational status.

- **Status:** Implemented (Stage 1)
- **Method:** `GET`
- **Path:** `/api/health`
- **Request Headers:** None
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "service": "LinguaBuddy API"
  }
  ```

---

## Planned Endpoints (Not Implemented in Stage 1)

### `POST /api/chat`

Sends user conversation turn and receives AI response with gentle corrections.

- **Status:** Planned (Stage 2+)
- **Method:** `POST`
- **Path:** `/api/chat`
- **Request Body:**
  ```json
  {
    "targetLanguage": "Spanish",
    "proficiencyLevel": "A2",
    "scenario": "Ordering Coffee",
    "message": "Quiero una café por favor.",
    "conversationHistory": []
  }
  ```
- **Response `200 OK` (Planned Structure):**
  ```json
  {
    "response": "¡Claro! ¿Qué tipo de café prefieres, con leche o solo?",
    "corrections": [
      {
        "original": "una café",
        "corrected": "un café",
        "explanation": "'Café' is masculine in Spanish, so we use 'un' instead of 'una'."
      }
    ],
    "suggestedVocab": ["con leche", "solo"]
  }
  ```

---

### `POST /api/session-summary`

Generates end-of-session summary and review notes.

- **Status:** Planned (Stage 2+)
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
