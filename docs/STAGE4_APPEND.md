# Text to add to existing docs (language & level selectors)

## Add to `docs/AI_DESIGN.md`

### Selected language is the source of truth
The learner's Language and Level selectors are sent with every request and inserted into Gemma's system instruction. The AI never changes the target language from what the learner types; if the learner asks for another language it points them to the selector and continues in the selected language. Changing the language in the UI starts a new conversation so histories are never mixed. Changing the level keeps the conversation and applies from the next message.

## Add to `docs/WORKFLOW.md`

- Language and level selectors: implemented (add a language by adding one line to `client/src/config/languages.js`).
- Scenario selector: next.