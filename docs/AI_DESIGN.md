# LinguaBuddy - AI Integration Design

Gemma is called server-side through `@google/genai`; the API key stays in the server environment.

## 1. Overview
Google Gemma 4 serves as LinguaBuddy's patient, encouraging, and adaptive conversation partner. Each request includes the learner's selected target language, proficiency level, practice scenario, recent turns, and current message.

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
6. **Scenario Role-Play:** Keep the conversation relevant to the selected scenario using contextual guidance, not separate scenario engines.
7. **Session Summary:** On learner request, summarize a bounded conversation excerpt and the actual recorded corrections/vocabulary. Do not call the model after each message for summary work.
8. **Learning Insights:** The same summary request may identify at most three evidence-based next-practice topics. Do not describe a persistent weakness from one small mistake; use supportive, session-specific language.
9. **Targeted Review:** Only after the learner chooses a review action, generate one structured multiple-choice correction, fill-in-the-blank, or vocabulary activity. Include the selected language, level, scenario, topic, and sanitized session records.

## 4. Prompt Engineering Strategy

The backend prompt architecture provides system instructions:
- **Tone:** Empathetic, supportive, non-critical, patient.
- **Language Level Control:** Restrict vocabulary complexity to match user level.
- **Session Context:** Include target language, learner level, selected scenario, recent conversation history and current message. Scenario guidance shapes the role-play without separate scenario engines.
- **Summary Context:** On End Session, pass target language, level, scenario, recent turns, and session correction/vocabulary records. Ask for concise evidence-based overview, strengths, and practice suggestions.
- **Review Context:** On explicit learner action only, pass target language, level, scenario, chosen insight, and bounded corrections/vocabulary. Validate the activity structure and require three distinct options with an answer that matches one option.
- **Output Schema:** Standardized JSON formatting separating:
  - `reply`: Conversational message in target language.
  - `translation` and `tip`: Optional learner guidance in English.
  - `correction`: Optional gentle correction with explanation.
  - `vocabulary`: Up to three relevant words or phrases.
  - `difficulty`: The level used for the response.

## 5. Verification Notes

- Automated server tests cover language handling, conversation history, structured Gemma responses, and configured scenario IDs.
- Summary parsing is bounded and validated. Only correction and vocabulary items already present in the completed session are returned; malformed or unavailable AI summaries fall back to a local summary.
- Review activity parsing rejects malformed output, unsupported activity types, duplicate/empty options, or answers absent from the choices. The activity is generated on demand; answer comparison is deterministic and language-agnostic.
- The summary endpoint was exercised with empty, malformed-history, invalid-configuration, and one-message requests. The provider was unreachable here, so the one-message case returned its local fallback; live AI-written summaries remain unverified.
- The five Stage 5 language/scenario combinations reached the server, but the Google API calls failed with a network `fetch failed` error in this environment. Live Gemma language behavior remains unverified here.
- The client production build could not complete because the execution sandbox denied Vite access to a parent directory while loading its config.

## 6. Security & Key Management
- The Gemini API Key (`GEMINI_API_KEY`) resides exclusively in server environment files (`.env`).
- Client applications never communicate directly with Google Gemini endpoints.
