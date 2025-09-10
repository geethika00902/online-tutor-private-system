# 🚀 XAMPP Setup Guide for Online Tutor System

## Step 1: Download and Install XAMPP

1. **Go to**: https://www.apachefriends.org/
2. **Click "Download"** (free, ~150MB)
3. **Run installer** as Administrator
4. **Select**: MySQL and Apache (checked by default)
5. **Install** to default location (`C:\xampp`)

## Step 2: Start XAMPP Services

1. **Open XAMPP Control Panel**
2. **Click "Start"** next to **MySQL**
3. **Click "Start"** next to **Apache** (optional)
4. **Green status** means services are running

## Step 3: Create Database

1. **Open browser** → http://localhost/phpmyadmin
2. **Click "New"** in left sidebar
3. **Enter name**: `tutor_system`
4. **Click "Create"**

## Step 4: Import Database Schema

1. **Click on** `tutor_system` database
2. **Click "Import"** tab
3. **Click "Choose File"**
4. **Select** `database-schema.sql` from project folder
5. **Click "Go"**

## Step 5: Start Your Application

1. **Double-click** `xampp-setup.bat`
2. **Or run**: `npm start`
3. **Open**: http://localhost:3000

## ✅ XAMPP Configuration

Your `config.js` is already configured for XAMPP:
- **Host**: localhost
- **User**: root
- **Password**: (empty - XAMPP default)
- **Database**: tutor_system
- **Port**: 3306

## 🎯 Test Your System

1. **Register** as a student or teacher
2. **Login** with your credentials
3. **Check database** in phpMyAdmin to see your data

## 🔧 Troubleshooting

**XAMPP won't start:**
- Run as Administrator
- Check if port 80/3306 is in use
- Restart your computer

**phpMyAdmin not working:**
- Make sure Apache is running
- Try http://127.0.0.1/phpmyadmin

**Database connection failed:**
- Verify MySQL is running in XAMPP
- Check database name is `tutor_system`
- Make sure you imported the schema

## 🎉 You're Ready!

Your online tutor system is now running with XAMPP MySQL database!

