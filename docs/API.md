# LinguaBuddy - API Specification

This document details the REST API endpoints for LinguaBuddy.

---

## Implemented Endpoints

### `GET /api/health`

Checks the server operational status.

- **Status:** Implemented (Stage 1)
- **Method:** `GET`
- **Path:** `/api/health`
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "service": "LinguaBuddy API"
  }
  ```

---

### `POST /api/chat`

Sends user conversation message to Google Gemma 4 and receives AI partner reply.

- **Status:** Implemented (Stage 2)
- **Method:** `POST`
- **Path:** `/api/chat`
- **Request Body:**
  ```json
  {
    "message": "Hello! I want to practice English."
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "reply": "Hello! I would love to practice English with you. What would you like to talk about today?"
  }
  ```
- **Response `400 Bad Request`:**
  ```json
  {
    "error": "Message is required and cannot be empty."
  }
  ```
- **Response `500 Internal Server Error`:**
  ```json
  {
    "error": "API Configuration Error: GEMINI_API_KEY is missing or invalid in server environment."
  }
  ```

---

## Planned Endpoints (Not Implemented Yet)

### `POST /api/session-summary`

Generates end-of-session summary and review notes.

- **Status:** Planned (Future Stage)
- **Method:** `POST`
- **Path:** `/api/session-summary`
