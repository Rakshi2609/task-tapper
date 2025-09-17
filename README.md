# Task Tapper

Collaborative task management with recurring tasks, daily email summaries, and a real‑time world chat.

## Overview

This monorepo contains a Node/Express + MongoDB backend and a React (Vite) frontend. It supports:

- Create/assign one‑time or recurring tasks (Daily/Weekly/Monthly)
- Mark tasks complete; recurring tasks auto‑generate the next instance (skip Sundays)
- Track user stats (assigned, completed, not started)
- Rich task details and per‑task updates/comments
- World chat via WebSockets (Socket.io) with persistence
- Daily summary emails (Gmail + Nodemailer), with de‑duplication

## Tech Stack

- Backend: Node.js, Express 5, MongoDB (Mongoose), Socket.io, Nodemailer, dotenv
- Frontend: React 19, Vite, Tailwind CSS, Zustand, Axios, React Router, Recharts
- Realtime: Socket.io (server + client)
- Deploy targets: Vercel (frontend), any Node host for backend

## Folder Structure

```
backend/
  server.js                 # Express app + Socket.io + routes
  taskScheduler.js          # (if used later) scheduling entry
  config/connectDB.js       # MongoDB connection with retry
  controllers/              # auth, team (tasks), etc.
  models/                   # User, Team (tasks), recurring, updates, chat
  routes/                   # /api/auth, /api/function, /api/chat, /api/recurring-*
  socket/worldChat.js       # Socket.io world chat wiring
  utils/                    # email summaries, mail sender, etc.
client/
  src/                      # React app
  vite.config.js            # Vite config
  vercel.json               # Vercel routing for frontend
```

## Prerequisites

- Node.js 18+ recommended
- MongoDB connection string (Atlas or self‑hosted)
- Gmail account App Password (for daily summary emails)

## Environment Variables

Create a `.env` file in `backend/` with at least:

- MONGO_URI=... (required)
- MONGO_DB_NAME=... (optional if not embedded in URI)
- MONGO_MAX_RETRIES=3 (optional)
- MONGO_RETRY_DELAY_MS=3000 (optional)
- PORT=5000 (optional; default 5000)
- EMAIL=your_gmail_address@example.com
- APP_PASSWORD=your_gmail_app_password
- TWILIO_SID=... (optional, if SMS used later)
- TWILIO_AUTH_TOKEN=... (optional)

Frontend environment (create `client/.env`):

- VITE_APP_API_URL=https://your-backend-host.tld (used in production builds)

Notes:
- In development, the frontend calls `http://localhost:5000` directly and ignores `VITE_APP_API_URL`.
- Ensure CORS origins in `backend/server.js` include your frontend origin.

## Install & Run

From the repo root, open two terminals.

Backend (port 5000 by default):

```powershell
cd backend
npm install
npm run dev
```

Frontend (Vite dev server on 5173):

```powershell
cd client
npm install
npm run dev
```

Open http://localhost:5173.

## API Summary

Base URL in dev: http://localhost:5000

- Auth (`/api/auth`)
  - POST /login { email }
  - POST /signup { email, username }
  - POST /user-detail { email, phoneNumber, role }
  - GET /profile/:email
  - GET /tasks/:email
  - GET /assignedByMe?email=me@example.com

- Tasks (`/api/function`)
  - POST /createtask { createdBy, taskName, taskDescription, assignedTo, assignedName, taskFrequency, dueDate, priority }
  - POST /updatetask { taskId, email }   // marks complete, may create next recurring instance
  - POST /deletetask { taskId }
  - GET  /email                          // returns all user emails
  - GET  /tasks/:taskId                  // single task by id
  - POST /tasks/:taskId/updates          // { updateText, updatedBy, updateType? }
  - GET  /tasks/:taskId/updates          // list updates for task

- Recurring Tasks (`/api`)
  - GET  /recurring-tasks
  - POST /recurring-tasks
  - GET  /recurring-tasks/:id
  - DELETE /recurring-tasks/:id
  - PUT  /recurring-tasks/complete/:id   // { completedDate? }
  - POST /recurring-tasks/:taskId/updates  // { updateText, updatedBy, updateType? }
  - GET  /recurring-tasks/:taskId/updates
  - DELETE /recurring-tasks/updates/:updateId

- Health/cron
  - GET /api/ping                        // triggers daily summary check after 6 PM server time

## World Chat (Socket.io)

- Server CORS allows: https://task-tapper-blush.vercel.app and http://localhost:5173
- Events:
  - On connect: server emits `world-chat-init` with last 50 messages
  - Client emits `world-chat-message` { userId, message }
  - Server broadcasts `world-chat-message` with persisted message

## Frontend Configuration

In dev, the client targets:
- Auth API: http://localhost:5000/api/auth
- Task API: http://localhost:5000/api/function
- Recurring API: http://localhost:5000/api

In production, set `VITE_APP_API_URL` to your backend base (e.g., https://api.example.com) and the client will call `${VITE_APP_API_URL}/api/*` accordingly.

## Daily Email Summaries

- Triggered via GET `/api/ping` (e.g., by a GitHub Action/cron)
- Skips sending before 18:00 server local time
- One email per user per day, tracked in `SummaryStatus`
- Uses Gmail account specified by `EMAIL` and `APP_PASSWORD`

## Development Tips

- Socket.io and Express CORS origins must match your frontend origin(s)
- When changing backend port, update client dev URLs if you overrode defaults
- Mongo connection includes retry and helpful diagnostics (DNS/SRV, auth)

## Scripts

Backend (`backend/package.json`):
- npm run dev — start with nodemon
- npm start — start with node

Frontend (`client/package.json`):
- npm run dev — Vite dev server (5173)
- npm run build — production build
- npm run preview — preview local build
- npm run lint — ESLint

## Deployment

- Frontend: deploy `client` to Vercel (uses `vercel.json`), set environment `VITE_APP_API_URL`
- Backend: deploy Node server to a host (Render/Heroku/VPS). Ensure env vars are set and CORS origins include your deployed frontend URL

## License

This project is provided as‑is by the authors. Add a proper license if you plan to open source.
