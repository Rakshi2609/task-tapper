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

## What This App Does
Task Tapper is a collaborative platform for teams and communities to manage tasks efficiently. It allows users to:
- Create and assign one-time or recurring tasks
- Track progress and completion status
- Communicate in real-time via world chat
- Receive daily email summaries of tasks
- Manage teams, departments, and communities
- Add comments and updates to tasks for better collaboration

It is designed for productivity, transparency, and seamless communication in any organization.

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

## Example .env Files
#### backend/.env
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
EMAIL=your_gmail_address@example.com
APP_PASSWORD=your_gmail_app_password
PORT=5000
```
#### client/.env
```
VITE_APP_API_URL=http://localhost:5000
```

## Pros of Task Tapper
- **Automated Recurring Tasks:** Never miss a deadline with auto-generated tasks and reminders.
- **Daily Email Summaries:** Stay updated with a summary of your tasks every day.
- **Real-Time Chat:** Collaborate instantly with your team or community.
- **Flexible Structure:** Supports teams, departments, and communities for scalable management.
- **User-Friendly Interface:** Modern React frontend for a smooth experience.
- **Secure & Private:** Authentication and role-based access for data protection.
- **Easy Deployment:** Ready for Vercel (frontend) and any Node host (backend).
- **Open API:** Easily integrate with other tools or automate workflows.


- TWILIO_SID=... (optional, if SMS used later)



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
  - GET  /tasks/:taskId/updates          // list updates for task

  - GET  /recurring-tasks
  - POST /recurring-tasks
  - GET  /recurring-tasks/:id
  - DELETE /recurring-tasks/:id
  - POST /recurring-tasks/:taskId/updates  // { updateText, updatedBy, updateType? }
  - GET  /recurring-tasks/:taskId/updates

- Health/cron
  - GET /api/ping                        // triggers daily summary check after 6 PM server time


- Events:
  - On connect: server emits `world-chat-init` with last 50 messages
  - Client emits `world-chat-message` { userId, message }
  - Server broadcasts `world-chat-message` with persisted message

In dev, the client targets:

In production, set `VITE_APP_API_URL` to your backend base (e.g., https://api.example.com) and the client will call `${VITE_APP_API_URL}/api/*` accordingly.

## Development Tips


## Scripts

Backend (`backend/package.json`):

Frontend (`client/package.json`):

## Deployment


## Git Setup

If you are committing for the first time and see an error about unknown author identity, configure your Git user name and email:

```sh
# Set your name and email globally
 git config --global user.name "Your Name"
 git config --global user.email "your@email.com"
```

Replace with your actual name and email. You can omit `--global` to set these only for this repository.

## License

This project is provided as‑is by the authors. Add a proper license if you plan to open source.
