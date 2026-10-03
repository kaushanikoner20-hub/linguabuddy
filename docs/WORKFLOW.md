# LinguaBuddy - User Practice Workflow

> **Note:** This document describes the *planned future user workflow*. Feature implementation begins in subsequent project stages.

## End-to-End Practice Workflow

```
 1. Open LinguaBuddy Client Application
    │
 2. Select Target Language
    │
 3. Select Proficiency Level (e.g., A1, A2, B1, B2)
    │
 4. Select Practice Scenario (e.g., Ordering Coffee, Weekend Plans)
    │
 5. Start Practice Session
    │
 6. User Sends a Message
    │
 7. Express Backend Prepares Context & System Prompt
    │
 8. Server Calls Gemma Service -> Google Gemini API (gemma-4-26b-a4b-it)
    │
 9. Gemma Generates Partner Response + Gentle Corrections + Explanation
    │
10. Frontend Renders AI Response & Highlighted Corrections
    │
11. Continue Conversation (Repeat steps 6-10)
    │
12. User Ends Session -> Backend Generates Session Summary & Vocabulary
```

## Detailed Step Description

1. **Open LinguaBuddy:** User navigates to the React web interface.
2. **Select Target Language:** User chooses the language they wish to practice.
3. **Select Proficiency Level:** User sets their experience level to adapt AI difficulty and vocabulary.
4. **Select Scenario:** User chooses a realistic situational topic.
5. **Start Practice:** Initial greeting and scenario background are initialized.
6. **Send Message:** User types or submits conversational input.
7. **Backend Processing:** Backend attaches scenario context, partner rules, and past message turns.
8. **AI Execution:** `@google/genai` calls model `gemma-4-26b-a4b-it` server-side.
9. **AI Generation:** Model returns structured feedback (conversational reply + optional gentle correction + explanation).
10. **Frontend Display:** UI presents AI reply clearly, emphasizing learning points.
11. **Conversation Loop:** Smooth multi-turn practice session.
12. **Session Summary:** User reviews key vocabulary, strengths, and practice highlights.
