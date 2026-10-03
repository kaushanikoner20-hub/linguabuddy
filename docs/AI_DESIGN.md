# LinguaBuddy - AI Integration Design

> **Note:** Gemma integration is *not* part of Stage 1 and will be built in a future stage.

## 1. Overview
Google Gemma 4 is intended to serve as a core product component for LinguaBuddy rather than a decorative chatbot. The AI acts as a patient, encouraging, and adaptive conversation partner specifically tuned for language learners.

## 2. Configuration & Specifications

- **Selected Model:** `gemma-4-26b-a4b-it`
- **Official SDK:** `@google/genai`
- **Access Method:** Google Gemini API (Server-Side invocation only)

## 3. Core AI Responsibilities

1. **Natural Conversation:** Engage in natural, context-aware dialogue matching selected practice scenarios.
2. **Gentle Correction:** Provide soft, encouraging feedback when the user makes grammatical, lexical, or structural mistakes.
3. **Short Explanations:** Offer concise, easy-to-understand explanations for corrections without overwhelming the learner.
4. **Vocabulary Suggestions:** Recommend useful alternative phrasing and context-appropriate vocabulary words.
5. **Adaptive Difficulty:** Automatically align sentence complexity and vocabulary level with the user's selected proficiency level.
6. **Session Summary:** Synthesize conversational highlights into actionable learning feedback at session conclusion.

## 4. Prompt Engineering Strategy (Planned)

The backend prompt architecture will enforce strict system instructions:
- **Tone:** Empathetic, supportive, non-critical, patient.
- **Language Level Control:** Restrict vocabulary complexity to match user level.
- **Output Schema:** Standardized JSON formatting separating:
  - `response`: Conversational message in target language.
  - `corrections`: Array of gentle corrections (if any).
  - `explanation`: Short learning note in user's native language.
  - `suggestedVocab`: Key vocabulary terms introduced in the response.

## 5. Security & Key Management
- The Gemini API Key (`GEMINI_API_KEY`) resides exclusively in server environment files (`.env`).
- Client applications never communicate directly with Google Gemini endpoints.
