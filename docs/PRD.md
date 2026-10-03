# LinguaBuddy - Product Requirements Document (PRD)

## 1. Product Overview
**Product Name:** LinguaBuddy  
**Tagline:** A patient, supportive AI language-practice partner for real conversation.

## 2. Problem Statement
Language learners often struggle to transition from vocabulary apps to real-world conversations due to fear of making mistakes, lack of accessible practice partners, and anxiousness during real-time interactions. Existing AI chatbots can feel transactional, overly rigid, or robotic, lacking the empathy and structural guidance required for effective language acquisition.

## 3. Target User
- **Primary Persona:** A real friend learning a new language who needs a supportive, low-pressure environment to practice speaking and writing.
- **Target Language:** `[TARGET LANGUAGE TO BE CONFIRMED]`
- **Current Proficiency Level:** `[PROFICIENCY LEVEL TO BE CONFIRMED - e.g., Beginner (A2) / Intermediate (B1)]`
- **User Goals:** Build conversational confidence, receive immediate yet friendly corrections, expand vocabulary, and practice realistic scenarios.

## 4. Product Goal
To provide a friendly, patient, and context-aware AI partner powered by Google Gemma 4 that helps language learners practice naturally while receiving gentle corrections, explanations, and lightweight session summaries.

## 5. User Stories
- **As a learner**, I want to choose a target language and proficiency level so that the AI adjusts its complexity to my skills.
- **As a learner**, I want to select a practice scenario (e.g., ordering food, discussing hobbies) so that conversation feels realistic and relevant.
- **As a learner**, I want to receive gentle corrections when I make grammatical or vocabulary errors without interrupting the flow of conversation.
- **As a learner**, I want brief explanations for why a correction was made so I can learn from my mistakes.
- **As a learner**, I want a session summary at the end of practice to review key vocabulary and areas for improvement.

## 6. Scope & Features

### MVP Features (Planned for Future Stages)
- Language and proficiency selector.
- Practice scenario selection.
- Natural AI conversation powered by Google Gemma 4.
- Gentle inline language correction and short explanations.
- End-of-session summary and vocabulary key takeaways.
- Lightweight practice progress tracking.

### Out-of-Scope Features (Explicitly Excluded)
- User authentication / User accounts.
- Database storage (PostgreSQL, MongoDB, etc.).
- Vector databases / RAG implementations.
- Voice / Audio AI input & synthesis.
- Payment processing or monetization.
- Multi-user chat rooms or social network integration.
- Complex gamification or leaderboards.

## 7. Success Criteria
- **User Confidence:** The learner feels comfortable making mistakes during practice sessions.
- **Correction Quality:** AI corrections are helpful, gentle, non-judgmental, and clear.
- **Performance:** Fast response time and seamless interaction between frontend and backend.
- **Security:** API keys and sensitive AI instructions strictly maintained server-side.
