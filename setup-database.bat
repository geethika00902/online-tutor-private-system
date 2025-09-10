@echo off
echo ========================================
echo   Online Tutor System - Database Setup
echo ========================================
echo.

echo Step 1: Starting MySQL service...
net start mysql
echo.

echo Step 2: Creating database and tables...
echo Please enter your MySQL root password when prompted:
echo.

mysql -u root -p < database-schema.sql

echo.
echo Step 3: Database setup complete!
echo.
echo Step 4: Starting the server...
echo Press Ctrl+C to stop the server
echo.

npm start

