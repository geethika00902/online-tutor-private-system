# Database Setup Instructions

## Prerequisites
1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Choose the LTS version

2. **Install MySQL** (if not already installed)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP: https://www.apachefriends.org/

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Set Up MySQL Database

### Option A: Using MySQL Command Line
1. Open MySQL command line or MySQL Workbench
2. Run the following commands:

```sql
CREATE DATABASE tutor_system;
USE tutor_system;
```

3. Copy and paste the contents of `database-schema.sql` into your MySQL client and execute it.

### Option B: Using phpMyAdmin (if using XAMPP)
1. Start XAMPP and open phpMyAdmin (http://localhost/phpmyadmin)
2. Create a new database called `tutor_system`
3. Import the `database-schema.sql` file

## Step 3: Configure Database Connection
1. Open `config.js`
2. Update the database configuration:
```javascript
database: {
    host: 'localhost',
    user: 'root',                    // Your MySQL username
    password: 'your_password_here',  // Your MySQL password
    database: 'tutor_system',
    port: 3306
}
```

## Step 4: Start the Server
```bash
npm start
```

The server will start on http://localhost:3000

## Step 5: Test the System
1. Open your browser and go to http://localhost:3000
2. Register a new account
3. Login with your credentials
4. Check the database to see your data

## Troubleshooting

### Database Connection Issues
- Make sure MySQL is running
- Check your username and password in `config.js`
- Verify the database `tutor_system` exists

### Port Already in Use
- Change the port in `config.js` if 3000 is already in use
- Or stop the process using port 3000

### CORS Issues
- The server is configured to allow CORS for localhost
- If you have issues, check the CORS settings in `server.js`

## Database Tables Created
- `users` - Main user information
- `students` - Student-specific data
- `teachers` - Teacher-specific data
- `subjects` - Available subjects
- `sessions` - Tutoring sessions
- `messages` - User communications
- `payments` - Payment records

## API Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/update-password/:userId` - Update password

