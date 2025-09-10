# Online Private Tutor System

A Node.js + MySQL web app for students to book sessions with teachers.

## Prerequisites

- Node.js 18+
- MySQL 8+ (or MariaDB)
- Port 3001 open on the host

## Configure

App config is in `config.js`.

```
module.exports = {
	database: {
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'tutor_system',
		port: 3306
	},
	server: { port: 3001 },
	policy: {
		cancelLockMinutes: 1440,           // cannot cancel within 24h
		maxDailyBookingMinutes: 360        // 6h per day limit (0 to disable)
	}
};
```

Environment variables (optional override) you may set on hosting providers:

- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
- PORT

If you use env vars, adapt `config.js` to read from `process.env` or keep file-based config as is.

## Database

1) Create DB and tables

```
mysql -u root -p
CREATE DATABASE tutor_system;
USE tutor_system;
SOURCE database-schema.sql;
```

2) (Optional) Add sample data using your own script or phpMyAdmin.

## Install & Run (local)

```
npm install
node server.js
# App: http://localhost:3001
```

## Deploy

### Render / Railway
- Push this repo to GitHub
- Create a Web Service
- Build command: `npm install`
- Start command: `node server.js`
- Add a managed MySQL (or external MySQL) and set DB env vars accordingly
- Expose port 3001

### VPS (Ubuntu)
```
# Node & pm2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pm2

# App
git clone <your-repo>
cd online-tutor-private-system
npm ci
pm2 start server.js --name tutor
pm2 save

# (optional) Nginx reverse proxy to port 3001
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

## Notes
- Ensure MySQL is running and `config.js` matches your credentials
- For public deployment, use a hosted MySQL (e.g., PlanetScale, Aiven) and update config

