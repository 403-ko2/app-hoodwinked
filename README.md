# Hoodwinked

Hoodwinked is a persona-based rewrite app. A user selects a persona, types a message, and the backend rewrites it in that persona's voice using the Gemini API.

This repo contains:

- A Go backend (`Winked/backend`) with Gin + GORM + PostgreSQL
- A React Native / Expo frontend (`Winked/frontend`) with tabs for Personas, Rewrite, and History

## Features

- Persona selection from backend data
- Rewrite text with persona prompt instructions
- Copy rewritten output from Rewrite and History screens
- History tab with:
  - persona image/name
  - input/output preview with expand/collapse
  - timestamp
  - delete entry
- Conversation-style rewrite UI with scrollable prior messages per persona
- Load existing persona history into Rewrite screen
- Light/Dark mode toggle from top-right tab header

## Repository Structure

- `Winked/backend/main.go` - API routes and app bootstrap
- `Winked/backend/database/` - DB connection, migration, seed logic
- `Winked/backend/models/` - GORM models and table mappings
- `Winked/backend/services/gemini.go` - Gemini API client/service
- `Winked/frontend/app/` - Expo Router layouts and tabs
- `Winked/frontend/services/api.ts` - frontend API layer (network calls)
- `Winked/frontend/context/` - app-level state (persona + theme)
- `Winked/frontend/components/` - reusable UI components

## How The App Works

1. Frontend loads personas from `GET /personas`.
2. User selects persona and opens Rewrite tab.
3. User submits text to `POST /rewrite`.
4. Backend:
   - validates request
   - loads persona + enabled prompt
   - calls Gemini service
   - saves `transform` row
   - saves `history` row pointing to transform
5. Frontend displays output in conversation UI and History tab can load entries from `GET /history`.

## API Endpoints

- `GET /`
  - health/status response
- `GET /personas`
  - returns personas
- `POST /rewrite`
  - request: `{ "text": "...", "personaID": "uuid" }`
  - response includes transformed text + IDs
- `GET /history?limit=100&personaID=<uuid>`
  - returns history rows with persona + input/output + createdAt
- `DELETE /history/:id`
  - deletes one history entry

## Database Tables

Main tables used by the app:

- `personas`
- `prompts`
- `transform`
- `history`

Backend migrations use GORM AutoMigrate in:

- `Winked/backend/database/migrations/migration001.go`

## Prerequisites

- Node.js 18+ and Yarn
- Go 1.25+
- PostgreSQL running locally
- Xcode/iOS Simulator for iOS testing (optional)
- Gemini API key

## Setup And Run (Fresh Clone)

### 1) Clone and install frontend dependencies

```bash
git clone <repo-url>
cd app-hoodwinked/Winked
yarn install
```

### 2) Backend environment

Create backend env file:

```bash
cd backend
cp .env.example .env
```

Set values in `Winked/backend/.env`:

- `GEMINI_API_KEY=...`
- `GEMINI_MODEL=gemini-2.5-flash` (or preferred Gemini model)
- `GEMINI_MAX_OUTPUT_TOKENS=1500`
- `DB_HOST=localhost`
- `DB_PORT=5432` (or your port)
- `DB_USER=...`
- `DB_PASSWORD=...`
- `DB_NAME=...` (your DB name)
- `DB_SSLMODE=disable`
- `PORT=3000` (or recommended local default)

### 3) Create local database

Create DB once:

```bash
createdb hoodwinked
```

If using a different DB name, keep `.env` in sync.

### 4) Run backend

From `Winked/backend`:

```bash
go run .
```

On startup, backend will:

- connect DB
- run migrations
- seed personas/prompts if personas table is empty

### 5) Configure frontend API URL

Frontend defaults to:

- `http://localhost:8081`

If needed, override with Expo public env:

- `EXPO_PUBLIC_API_BASE_URL=http://localhost:3001`

### 6) Run frontend

From `Winked`:

```bash
yarn start
```

Other scripts:

- `yarn ios`
- `yarn android`
- `yarn web`
- `yarn lint`

## Default Local Ports

- Frontend Expo dev server: `8081` (Metro)
- Backend API server: `3001` (from backend `.env` `PORT`)

## Running On Device vs Simulator

- iOS Simulator/Web can usually use `localhost`.
- Physical phone cannot use your computer's `localhost`; use your LAN IP:
  - example: `http://192.168.1.50:3001`
  - set this in `EXPO_PUBLIC_API_BASE_URL`.

## Common Troubleshooting

- **"Cannot reach API..."**
  - backend not running
  - wrong port
  - wrong `EXPO_PUBLIC_API_BASE_URL`
- **Port already in use**
  - stop old process and restart
- **DB does not exist**
  - create DB (`createdb <name>`) or fix `DB_NAME`
- **Rewrite truncation**
  - increase `GEMINI_MAX_OUTPUT_TOKENS`
- **Expo asset errors (`icon.png`/`splash.png`)**
  - ensure assets referenced in `Winked/app.json` exist at those paths

## Notes

- Backend Gemini integration lives in `Winked/backend/services/gemini.go`.
- `.env` files should never be committed.
