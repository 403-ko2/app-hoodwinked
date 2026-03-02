# Hoodwinked Study Guide (From Our Build Session)

This file is a personal study guide that documents what we built and why, based on our working session.

## 1) What We Built Together (Conversation Summary)

We moved from a partial prototype to a working full flow:

1. Clarified product goal from `agent-instructions.agent.md`:
   - select persona
   - rewrite text in persona voice
   - copy output
   - view history

2. Backend foundation:
   - verified DB connection/migrations/seeds
   - added API routes: personas, rewrite, history, delete history

3. LLM integration:
   - switched from OpenAI implementation to Gemini API
   - added env-based model and output token controls

4. Frontend architecture improvements:
   - separated network requests into `frontend/services/api.ts`
   - wired personas/rewrite/history to backend API

5. History features:
   - list entries with persona image, input, output, timestamp
   - expand/collapse preview
   - delete entry
   - copy output

6. Rewrite UX upgrades:
   - conversation-style output area above input
   - keeps prior messages per persona
   - loads persona history from backend
   - copy output in conversation
   - auto-growing input with max height

7. Theme support:
   - app-wide light/dark toggle in top-right tab header
   - theme-aware styles across tabs/components

---

## 2) Go Backend Breakdown (What + Why)

### `Winked/backend/main.go`

This is the app's entrypoint and route layer.

What it does:
- loads env (`godotenv`)
- connects database
- runs migrations
- runs seeders
- starts Gin server
- defines all HTTP routes

Why this matters:
- Keeps startup workflow deterministic: DB always ready before serving traffic.
- API contract is centralized and easy to inspect.

Key route patterns:
- `GET /personas` -> read list of personas for selection screen
- `POST /rewrite` -> core feature orchestration:
  - validate request
  - fetch persona and active prompt
  - call Gemini service
  - store transform/history
  - return transformed text
- `GET /history` -> query history, preload relations, return flattened response
- `DELETE /history/:id` -> delete one history item

Important implementation details:
- CORS middleware allows cross-origin frontend calls.
- `SetTrustedProxies` set to loopback for safer local setup.
- Uses defensive errors (`400`, `404`, `500`, `502`, etc).

---

### `Winked/backend/database/connection.go`

What it does:
- builds Postgres DSN from env vars
- opens GORM connection
- stores it in global `database.DB`
- enables `uuid-ossp` extension

Why:
- Standard centralized DB setup used everywhere else.
- Extension support helps UUID workflows.

---

### `Winked/backend/database/migrations/migration001.go`

What it does:
- runs `AutoMigrate()` for models

Why:
- ensures tables exist and evolve with models during dev.

---

### `Winked/backend/database/seeds/*.go`

What they do:
- create starter personas and prompts if personas table is empty

Why:
- app is usable immediately on first run without manual inserts.

---

### `Winked/backend/models/models.go`

Data model summary:
- `Persona` -> catalog of selectable personas
- `Prompt` -> instruction template tied to a persona
- `Transform` -> one rewrite event (input/output + references)
- `History` -> index/table used for history tab display and deletion

Why this split:
- prompt logic is separated from persona identity
- transform stores concrete request/response data
- history supports UX-focused listing/deleting independent of transforms

Notable choice:
- `History.ID` is integer autoincrement to match your current SQL table.

---

### `Winked/backend/services/gemini.go` (Gemini client)

What it does:
- reads:
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL` (default `gemini-2.5-flash`)
  - `GEMINI_MAX_OUTPUT_TOKENS` (default `1500`)
- builds request payload with system + user instruction
- calls Gemini `generateContent`
- parses/returns rewritten text

Why this service layer exists:
- separates external API integration from route handlers
- makes `main.go` cleaner and easier to reason about
- easier to test/swap providers in future

---

## 3) Frontend React/TypeScript Breakdown (What + Why)

### Routing and app shell

- `frontend/app/_layout.tsx`
  - wraps app with providers:
    - `AppThemeProvider`
    - `PersonaProvider`
    - React Navigation `ThemeProvider`
  - controls status bar style by theme

- `frontend/app/(tabs)/_layout.tsx`
  - defines tabs: Personas, Rewrite, History
  - adds top-right sun/moon toggle

Why:
- central provider pattern keeps shared state in one place.

---

### Contexts

- `frontend/context/PersonaContext.tsx`
  - stores selected persona globally
  - lets tabs share selected persona

- `frontend/context/ThemeContext.tsx`
  - stores current light/dark mode
  - exposes `toggleTheme()`

Why:
- avoids prop-drilling across route boundaries.

---

### API layer

- `frontend/services/api.ts`

What it does:
- defines request/response types
- centralizes fetch logic:
  - `getPersonas()`
  - `rewriteText()`
  - `getHistory()`
  - `deleteHistoryEntry()`
- maps persona names to image URLs
- normalizes network errors

Why:
- separation of concerns:
  - screens handle UI/state
  - service file handles network concerns

---

### Personas tab

- `frontend/app/(tabs)/index.tsx`
- `frontend/components/PersonaList.tsx`
- `frontend/components/personaCard.tsx`

What it does:
- fetches personas from backend
- renders cards (theme-aware)
- on select:
  - store persona in context
  - navigate to rewrite tab

Why:
- clear flow from data loading -> rendering -> user intent.

---

### Rewrite tab

- `frontend/app/(tabs)/rewrite.tsx`

What it does:
- conversation UI: previous messages above input
- loads persona-specific history from backend
- allows local clear-view reset (UI only)
- sends rewrite request to backend
- appends new chat entries
- auto-scrolls to newest message
- copy button per output bubble
- auto-growing input field (compact -> expands -> max cap)

Why:
- mirrors familiar chat UX patterns and keeps prior context visible.

---

### History tab

- `frontend/app/(tabs)/history.tsx`

What it does:
- fetches history on focus
- pull-to-refresh
- expandable input/output previews
- output copy
- delete per entry

Why:
- clean audit trail of rewrite events and quick content reuse.

---

## 4) Key Design Patterns You’re Using (And Why)

1. **Service Layer (Backend + Frontend)**
   - backend `services/gemini.go`
   - frontend `services/api.ts`
   - Why: isolate volatile integration logic from UI/routes.

2. **Context for Shared State**
   - persona/theme contexts
   - Why: cross-screen state without prop-drilling.

3. **Type-first Frontend**
   - typed API response/request models
   - Why: catches shape mistakes early and documents contracts.

4. **Defensive Error Handling**
   - explicit API status checks and user-facing messages
   - Why: faster debugging and clearer UX.

5. **Progressive UX**
   - preview + expand, copy, auto-grow input, chat history
   - Why: balances clarity and compactness.

---

## 5) Suggested Study Path (Practical)

If you want to improve fastest, study in this order:

1. `backend/main.go` route flow end-to-end
2. `backend/services/gemini.go` external API integration pattern
3. `frontend/services/api.ts` API boundary typing + errors
4. `rewrite.tsx` state management and async UI updates
5. `history.tsx` list rendering + optimistic-ish deletion flow
6. `ThemeContext` and layout providers

---

## 6) Optional Exercises

1. Add tests for `POST /rewrite` handler using mocked service output.
2. Add pagination to history endpoint and infinite scroll in History tab.
3. Persist theme selection (currently resets on app restart).
4. Add tests around the Gemini service response parsing.
5. Add auth/user ownership to history rows.

---

If you want, I can create a second version of this guide focused purely on interview-style explanations ("how to explain this architecture in 2 minutes").
