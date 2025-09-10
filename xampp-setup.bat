@echo off
echo ========================================
echo   XAMPP Setup for Online Tutor System
echo ========================================
echo.

echo Step 1: Starting XAMPP services...
echo Please make sure XAMPP is installed and running
echo.

echo Step 2: Opening phpMyAdmin...
echo This will open http://localhost/phpmyadmin in your browser
echo.
start http://localhost/phpmyadmin

echo.
echo Step 3: Database Setup Instructions:
echo 1. Click "New" in phpMyAdmin
echo 2. Enter database name: tutor_system
echo 3. Click "Create"
echo 4. Click "Import" tab
echo 5. Choose file: database-schema.sql
echo 6. Click "Go"
echo.

echo Step 4: Starting the server...
echo Press Ctrl+C to stop the server
echo.

npm start

