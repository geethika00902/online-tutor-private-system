# Online Private Tutor System

A Node.js + MySQL web app for students to book sessions with teachers.

## Prerequisites

- Node.js 18+
- MySQL 8+ (or MariaDB)
- Port 3001 open on the host

## Quick Start (Local)

```bash
npm install
copy .env.example .env   # Windows PowerShell: copy .env.example .env
# Edit .env if needed
npm start
# App: http://localhost:3001
```

## Configuration via Environment Variables

Configuration is loaded in `config.js` using `dotenv` and `process.env` with sensible defaults.

Supported variables:

- DB_HOST (default: localhost)
- DB_USER (default: root)
- DB_PASSWORD (default: "")
- DB_NAME (default: tutor_system)
- DB_PORT (default: 3306)
- PORT or SERVER_PORT (default: 3001)
- POLICY_CANCEL_LOCK_MINUTES (default: 1440)
- POLICY_MAX_DAILY_BOOKING_MINUTES (default: 360)

See `.env.example` for a ready-to-copy template.

## Database Setup

1) Create DB and tables

```sql
-- In MySQL shell or phpMyAdmin
CREATE DATABASE IF NOT EXISTS tutor_system;
USE tutor_system;
SOURCE database-schema.sql;
```

2) (Optional) Seed sample data

```bash
node insert-sample-data.js
```

## Run Scripts

- Start: `npm start`
- Dev (auto-restart): `npm run dev`
- Test: `npm test` (placeholder; passes for CI)

## Deploy

### Local (XAMPP/MySQL)
- Ensure MySQL is running and `.env` matches credentials.
- Start with `npm start` and visit `http://localhost:3001`.

### Render / Railway (Cloud)
- Push this repo to GitHub.
- Create a Web Service.
- Build command: `npm ci`
- Start command: `node server.js`
- Set env vars: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, PORT.
- Attach managed MySQL (or use external) and update env vars accordingly.

### VPS (Ubuntu) with pm2
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pm2
git clone <your-repo>
cd online-tutor-private-system
npm ci
cp .env.example .env && nano .env
pm2 start server.js --name tutor
pm2 save
# (optional) Put Nginx in front and proxy to port 3001
```

## Features (brief)
- Student/Teacher auth and profiles
- Find teachers (with location)
- Book / Accept / Complete / Cancel sessions
- Student rating updates teacher’s avg
- Dashboard stats: total sessions and completed hours

## API (brief)
- POST `/api/register`, POST `/api/login`
- GET `/api/profile/:userId`
- GET `/api/teachers`
- POST `/api/book-session`
- GET `/api/sessions/:userId`
- GET `/api/sessions-summary/:userId`
- PUT `/api/sessions/:sessionId/accept`
- PUT `/api/sessions/:sessionId/complete`
- PUT `/api/sessions/:sessionId/rate`
- DELETE `/api/sessions/:sessionId`
- POST `/api/send-message`, GET `/api/messages/:userId/:otherUserId`, GET `/api/user-messages/:userId`
- PUT `/api/update-location/:userId`

## Project Management (Issues & Milestones)
- Create issues for: validation, pagination, rate limits, UI polish, tests.
- Milestones idea:
  - M1: MVP auth + booking flow
  - M2: Messaging + teacher directory polish
  - M3: CI, tests, deployment hardening

## Notes
- Ensure MySQL is running; set `.env` accordingly.
- For public deployment, prefer hosted MySQL and use env vars.
