# LinguaBuddy - User Practice Workflow

This document describes the current no-login practice flow. Session summaries remain planned.

## End-to-End Practice Workflow

```
 1. Open LinguaBuddy Client Application
    │
 2. Select Target Language
    │
 3. Select Proficiency Level (Beginner, Intermediate, or Advanced)
    │
 4. Select Practice Scenario (e.g., Ordering Coffee, Weekend Plans)
    │
 5. Start Practice Session (no login or personal details)
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
12. Learner starts a new conversation; current language, level and scenario are retained
```

## Detailed Step Description

1. **Open LinguaBuddy:** User navigates to the React web interface.
2. **Select Target Language:** User chooses the language they wish to practice.
3. **Select Proficiency Level:** User sets their experience level to adapt AI difficulty and vocabulary.
4. **Select Scenario:** User chooses a realistic situational topic.
5. **Start Practice:** A fresh chat opens with the selected settings visible.
6. **Send Message:** User types or submits conversational input.
7. **Backend Processing:** Backend attaches scenario context, partner rules, and past message turns.
8. **AI Execution:** `@google/genai` calls model `gemma-4-26b-a4b-it` server-side.
9. **AI Generation:** Model returns structured feedback (conversational reply + optional gentle correction + explanation).
10. **Frontend Display:** UI presents AI reply clearly, emphasizing learning points.
11. **Conversation Loop:** Smooth multi-turn practice session.
12. **New Conversation:** The chat history clears and the selected language, level, and scenario stay in place. Changing any setting clears the conversation before the next message.
