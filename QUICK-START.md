# 🚀 QUICK START GUIDE

## Option 1: Easy Setup (Recommended)

### 1. Install XAMPP (if you don't have MySQL)
- Download: https://www.apachefriends.org/
- Install and start Apache + MySQL

### 2. Create Database
- Open http://localhost/phpmyadmin
- Click "New" → Create database named `tutor_system`
- Click "Import" → Select `database-schema.sql` → Go

### 3. Update Config
- Open `config.js`
- Change password to your MySQL password (usually empty for XAMPP)

### 4. Start Server
- Double-click `start-server.bat`
- Or run: `npm start`

### 5. Open Website
- Go to: http://localhost:3000
- Register and login!

---

## Option 2: Manual Setup

### 1. Install MySQL
- Download from: https://dev.mysql.com/downloads/mysql/

### 2. Create Database
```sql
CREATE DATABASE tutor_system;
USE tutor_system;
```
Then run the `database-schema.sql` file

### 3. Update Config
- Edit `config.js` with your MySQL password

### 4. Start Server
```bash
npm start
```

---

## 🎯 What You Get:

✅ **Complete Online Tutor System**
- Student and Teacher registration
- Secure login with password hashing
- MySQL database storage
- Beautiful responsive design
- Dashboard for both user types

✅ **Database Tables:**
- users (main user data)
- students (student-specific info)
- teachers (teacher-specific info)
- subjects (available subjects)
- sessions (tutoring sessions)
- messages (communication)
- payments (payment records)

✅ **API Endpoints:**
- POST /api/register
- POST /api/login
- GET /api/profile/:userId
- PUT /api/update-password/:userId

## 🔧 Troubleshooting:

**Database Connection Error:**
- Make sure MySQL is running
- Check password in `config.js`
- Verify database `tutor_system` exists

**Port 3000 in use:**
- Change port in `config.js`
- Or stop other services using port 3000

**CORS Issues:**
- Server is configured for localhost
- Check browser console for errors

## 📱 Test the System:

1. **Register as Student:**
   - Go to http://localhost:3000
   - Click "Register here"
   - Choose "Register as Student"
   - Fill form and submit

2. **Register as Teacher:**
   - Click "Register here"
   - Choose "Register as Teacher"
   - Fill form and submit

3. **Login:**
   - Use your email/password
   - Select user type
   - Access dashboard

4. **Check Database:**
   - Open phpMyAdmin
   - View `tutor_system` database
   - See your registered users in `users` table

## 🎉 You're Done!

Your online tutor system is now running with a real MySQL database!

