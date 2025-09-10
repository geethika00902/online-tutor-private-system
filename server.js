const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors({
    origin: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.static('.'));

// Database connection
const db = mysql.createConnection(config.database);

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL database');
    // Ensure teachers.location column exists (manual migration safeguard)
    const alterQuery = "ALTER TABLE teachers ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL";
    db.query(alterQuery, (e) => {
        if (e && e.code !== 'ER_DUP_FIELDNAME') {
            console.warn('Could not ensure teachers.location column:', e.message);
        }
    });
});

// API Routes

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, userType, grade, subject, experience } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !phone || !userType) {
            return res.status(400).json({ success: false, message: 'All required fields must be filled' });
        }

        // Check if email already exists
        const checkEmailQuery = 'SELECT id FROM users WHERE email = ?';
        const [existingUsers] = await db.promise().execute(checkEmailQuery, [email]);
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into users table
        const insertUserQuery = `
            INSERT INTO users (first_name, last_name, email, password, phone, user_type) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [userResult] = await db.promise().execute(
            insertUserQuery, 
            [firstName, lastName, email, hashedPassword, phone, userType]
        );

        const userId = userResult.insertId;

        // Insert into specific user type table
        if (userType === 'student' && grade) {
            const insertStudentQuery = `
                INSERT INTO students (user_id, grade_level) 
                VALUES (?, ?)
            `;
            await db.promise().execute(insertStudentQuery, [userId, grade]);
        } else if (userType === 'teacher' && subject && experience) {
            const insertTeacherQuery = `
                INSERT INTO teachers (user_id, subject_specialization, years_experience) 
                VALUES (?, ?, ?)
            `;
            await db.promise().execute(insertTeacherQuery, [userId, subject, experience]);
        }

        res.json({ 
            success: true, 
            message: 'Registration successful',
            user: { id: userId, firstName, lastName, email, userType }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Helper: get user type and mapped student/teacher ids
async function getUserContext(userId) {
    const getUserTypeQuery = 'SELECT id, user_type FROM users WHERE id = ?';
    const [users] = await db.promise().execute(getUserTypeQuery, [userId]);
    if (users.length === 0) {
        return null;
    }
    const user = users[0];
    if (user.user_type === 'student') {
        const [rows] = await db.promise().execute('SELECT id as student_id FROM students WHERE user_id = ?', [userId]);
        return { userType: 'student', studentId: rows.length ? rows[0].student_id : null };
    } else if (user.user_type === 'teacher') {
        const [rows] = await db.promise().execute('SELECT id as teacher_id FROM teachers WHERE user_id = ?', [userId]);
        return { userType: 'teacher', teacherId: rows.length ? rows[0].teacher_id : null };
    }
    return { userType: user.user_type };
}

// Helper: find subject id by name (fallback creates if not found)
async function ensureSubjectIdByName(subjectName) {
    if (!subjectName) return null;
    const [found] = await db.promise().execute('SELECT id FROM subjects WHERE LOWER(name) = LOWER(?) LIMIT 1', [subjectName]);
    if (found.length) return found[0].id;
    const [inserted] = await db.promise().execute('INSERT INTO subjects (name, description) VALUES (?, ?)', [subjectName, `${subjectName} subject`]);
    return inserted.insertId;
}

// Book a session
app.post('/api/book-session', async (req, res) => {
    try {
        const { studentUserId, teacherUserId, subjectName, subjectId, sessionDate, startTime, endTime } = req.body;
        if (!studentUserId || !teacherUserId || !sessionDate || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Map user ids to student/teacher table ids
        const studentCtx = await getUserContext(studentUserId);
        const teacherCtx = await getUserContext(teacherUserId);
        if (!studentCtx || studentCtx.userType !== 'student' || !studentCtx.studentId) {
            return res.status(400).json({ success: false, message: 'Invalid student user' });
        }
        if (!teacherCtx || teacherCtx.userType !== 'teacher' || !teacherCtx.teacherId) {
            return res.status(400).json({ success: false, message: 'Invalid teacher user' });
        }

        // Determine subject id
        let resolvedSubjectId = subjectId || null;
        if (!resolvedSubjectId && subjectName) {
            resolvedSubjectId = await ensureSubjectIdByName(subjectName);
        }
        if (!resolvedSubjectId) {
            return res.status(400).json({ success: false, message: 'Subject is required' });
        }

        // Calculate duration in minutes
        const start = new Date(`${sessionDate}T${startTime}:00`);
        const end = new Date(`${sessionDate}T${endTime}:00`);
        const durationMinutes = Math.max(0, Math.round((end - start) / 60000));
        if (durationMinutes <= 0) {
            return res.status(400).json({ success: false, message: 'End time must be after start time' });
        }

        // Enforce policy: max daily booking minutes per student
        if (config.policy && config.policy.maxDailyBookingMinutes > 0) {
            const [[sumRow]] = await db.promise().query(
                `SELECT COALESCE(SUM(duration_minutes),0) AS total FROM sessions 
                 WHERE student_id = ? AND session_date = ? AND status IN ('scheduled','in_progress','completed')`,
                [studentCtx.studentId, sessionDate]
            );
            const alreadyMinutes = sumRow.total || 0;
            if (alreadyMinutes + durationMinutes > config.policy.maxDailyBookingMinutes) {
                return res.status(400).json({ success: false, message: 'Exceeds daily booking limit' });
            }
        }

        // Insert session
        const insertSessionQuery = `
            INSERT INTO sessions (student_id, teacher_id, subject_id, session_date, start_time, end_time, duration_minutes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `;
        const [result] = await db.promise().execute(insertSessionQuery, [
            studentCtx.studentId,
            teacherCtx.teacherId,
            resolvedSubjectId,
            sessionDate,
            startTime,
            endTime,
            durationMinutes
        ]);

        const sessionId = result.insertId;

        // Notify teacher via message
        const notifyText = `New session booking request for ${sessionDate} ${startTime}-${endTime}. Please accept to confirm.`;
        await db.promise().execute(
            `INSERT INTO messages (sender_id, receiver_id, session_id, message_text, message_type) VALUES (?, ?, ?, ?, 'text')`,
            [studentUserId, teacherUserId, sessionId, notifyText]
        );

        res.json({ success: true, message: 'Session booked successfully', sessionId });
    } catch (error) {
        console.error('Book session error:', error);
        res.status(500).json({ success: false, message: 'Failed to book session' });
    }
});

// Accept a session (teacher)
app.put('/api/sessions/:sessionId/accept', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { teacherUserId } = req.body;
        if (!teacherUserId) return res.status(400).json({ success: false, message: 'Missing teacher id' });
        const teacherCtx = await getUserContext(teacherUserId);
        if (!teacherCtx || teacherCtx.userType !== 'teacher' || !teacherCtx.teacherId) {
            return res.status(400).json({ success: false, message: 'Invalid teacher user' });
        }
        const [rows] = await db.promise().execute('SELECT id, teacher_id, status FROM sessions WHERE id = ?', [sessionId]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Session not found' });
        const session = rows[0];
        if (session.teacher_id !== teacherCtx.teacherId) return res.status(403).json({ success: false, message: 'Not authorized to accept' });
        if (session.status !== 'scheduled') return res.status(400).json({ success: false, message: 'Session not in scheduled state' });
        await db.promise().execute("UPDATE sessions SET status = 'in_progress' WHERE id = ?", [sessionId]);
        res.json({ success: true, message: 'Session accepted' });
    } catch (error) {
        console.error('Accept session error:', error);
        res.status(500).json({ success: false, message: 'Failed to accept session' });
    }
});

// Complete a session (teacher)
app.put('/api/sessions/:sessionId/complete', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { teacherUserId } = req.body;
        if (!teacherUserId) return res.status(400).json({ success: false, message: 'Missing teacher id' });
        const teacherCtx = await getUserContext(teacherUserId);
        if (!teacherCtx || teacherCtx.userType !== 'teacher' || !teacherCtx.teacherId) {
            return res.status(400).json({ success: false, message: 'Invalid teacher user' });
        }
        const [rows] = await db.promise().execute('SELECT id, teacher_id, status FROM sessions WHERE id = ?', [sessionId]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Session not found' });
        const session = rows[0];
        if (session.teacher_id !== teacherCtx.teacherId) return res.status(403).json({ success: false, message: 'Not authorized to complete' });
        if (session.status !== 'in_progress') return res.status(400).json({ success: false, message: 'Session not in progress' });
        await db.promise().execute("UPDATE sessions SET status = 'completed' WHERE id = ?", [sessionId]);
        res.json({ success: true, message: 'Session completed' });
    } catch (error) {
        console.error('Complete session error:', error);
        res.status(500).json({ success: false, message: 'Failed to complete session' });
    }
});

// Cancel/Delete a session (student can cancel own scheduled session; teacher can cancel their scheduled session)
app.delete('/api/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userId } = req.body; // caller's users.id
        if (!userId) return res.status(400).json({ success: false, message: 'Missing user id' });

        const ctx = await getUserContext(userId);
        if (!ctx) return res.status(404).json({ success: false, message: 'User not found' });

        const [rows] = await db.promise().execute('SELECT id, student_id, teacher_id, status FROM sessions WHERE id = ?', [sessionId]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Session not found' });
        const session = rows[0];

        // Only scheduled sessions can be cancelled
        if (session.status !== 'scheduled') {
            return res.status(400).json({ success: false, message: 'Only scheduled sessions can be cancelled' });
        }

        // Permission check
        const isStudentOwner = ctx.userType === 'student' && ctx.studentId === session.student_id;
        const isTeacherOwner = ctx.userType === 'teacher' && ctx.teacherId === session.teacher_id;
        if (!isStudentOwner && !isTeacherOwner) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this session' });
        }

        // Enforce policy: cannot cancel within lock window
        if (config.policy && config.policy.cancelLockMinutes > 0) {
            const [[row]] = await db.promise().query('SELECT session_date, start_time FROM sessions WHERE id = ?', [sessionId]);
            if (row) {
                const start = new Date(`${row.session_date.toISOString().slice(0,10)}T${row.start_time}`);
                const minutesUntilStart = Math.round((start - new Date()) / 60000);
                if (minutesUntilStart <= config.policy.cancelLockMinutes) {
                    return res.status(400).json({ success: false, message: 'Cannot cancel within 24 hours of session start' });
                }
            }
        }

        // Soft-delete by marking cancelled
        await db.promise().execute("UPDATE sessions SET status = 'cancelled' WHERE id = ?", [sessionId]);
        res.json({ success: true, message: 'Session cancelled' });
    } catch (error) {
        console.error('Cancel session error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel session' });
    }
});

// Rate a session (student rates teacher)
app.put('/api/sessions/:sessionId/rate', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { studentUserId, rating } = req.body;
        if (!studentUserId || !rating) return res.status(400).json({ success: false, message: 'Missing fields' });
        const studentCtx = await getUserContext(studentUserId);
        if (!studentCtx || studentCtx.userType !== 'student' || !studentCtx.studentId) {
            return res.status(400).json({ success: false, message: 'Invalid student user' });
        }
        const [rows] = await db.promise().execute('SELECT id, student_id, teacher_id, status FROM sessions WHERE id = ?', [sessionId]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Session not found' });
        const session = rows[0];
        if (session.student_id !== studentCtx.studentId) return res.status(403).json({ success: false, message: 'Not authorized to rate' });
        if (session.status !== 'completed') return res.status(400).json({ success: false, message: 'Can rate only completed sessions' });
        await db.promise().execute('UPDATE sessions SET student_rating = ? WHERE id = ?', [rating, sessionId]);
        // Update teacher aggregate rating
        const [agg] = await db.promise().execute('SELECT AVG(student_rating) as avg_rating, COUNT(student_rating) as total FROM sessions WHERE teacher_id = ? AND student_rating IS NOT NULL', [session.teacher_id]);
        const avg = agg[0].avg_rating || 0;
        const total = agg[0].total || 0;
        await db.promise().execute('UPDATE teachers SET rating = ?, total_ratings = ? WHERE id = ?', [avg, total, session.teacher_id]);
        res.json({ success: true, message: 'Rating submitted' });
    } catch (error) {
        console.error('Rate session error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit rating' });
    }
});

// List sessions for a user
app.get('/api/sessions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const ctx = await getUserContext(userId);
        if (!ctx) return res.status(404).json({ success: false, message: 'User not found' });

        let query = '';
        let params = [];
        if (ctx.userType === 'student') {
            query = `
                SELECT s.*, 
                       uT.first_name AS teacher_first_name, uT.last_name AS teacher_last_name,
                       sub.name AS subject_name
                FROM sessions s
                JOIN teachers t ON s.teacher_id = t.id
                JOIN users uT ON t.user_id = uT.id
                JOIN students st ON s.student_id = st.id
                JOIN subjects sub ON s.subject_id = sub.id
                WHERE s.student_id = ?
                ORDER BY s.session_date DESC, s.start_time DESC
            `;
            params = [ctx.studentId];
        } else if (ctx.userType === 'teacher') {
            query = `
                SELECT s.*, 
                       uS.first_name AS student_first_name, uS.last_name AS student_last_name,
                       sub.name AS subject_name
                FROM sessions s
                JOIN students st ON s.student_id = st.id
                JOIN users uS ON st.user_id = uS.id
                JOIN teachers t ON s.teacher_id = t.id
                JOIN subjects sub ON s.subject_id = sub.id
                WHERE s.teacher_id = ?
                ORDER BY s.session_date DESC, s.start_time DESC
            `;
            params = [ctx.teacherId];
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported user type' });
        }

        const [rows] = await db.promise().execute(query, params);
        res.json({ success: true, sessions: rows });
    } catch (error) {
        console.error('List sessions error:', error);
        res.status(500).json({ success: false, message: 'Failed to get sessions' });
    }
});

// Sessions summary for overview cards
app.get('/api/sessions-summary/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const ctx = await getUserContext(userId);
        if (!ctx) return res.status(404).json({ success: false, message: 'User not found' });

        if (ctx.userType === 'student') {
            const [[tot]] = await db.promise().query('SELECT COUNT(*) AS total FROM sessions WHERE student_id = ?', [ctx.studentId]);
            const [[hours]] = await db.promise().query("SELECT COALESCE(SUM(duration_minutes),0) AS minutes FROM sessions WHERE student_id = ? AND status = 'completed'", [ctx.studentId]);
            res.json({ success: true, totalSessions: tot.total || 0, hoursCompleted: Math.round((hours.minutes || 0) / 60) });
        } else if (ctx.userType === 'teacher') {
            const [[tot]] = await db.promise().query('SELECT COUNT(*) AS total FROM sessions WHERE teacher_id = ?', [ctx.teacherId]);
            const [[hours]] = await db.promise().query("SELECT COALESCE(SUM(duration_minutes),0) AS minutes FROM sessions WHERE teacher_id = ? AND status = 'completed'", [ctx.teacherId]);
            res.json({ success: true, totalSessions: tot.total || 0, hoursCompleted: Math.round((hours.minutes || 0) / 60) });
        } else {
            res.status(400).json({ success: false, message: 'Unsupported user type' });
        }
    } catch (error) {
        console.error('Sessions summary error:', error);
        res.status(500).json({ success: false, message: 'Failed to get summary' });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        // Validate required fields
        if (!email || !password || !userType) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Get user from database
        const getUserQuery = `
            SELECT u.*, 
                   s.grade_level as grade,
                   t.subject_specialization as subject,
                   t.years_experience as experience
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN teachers t ON u.id = t.user_id
            WHERE u.email = ? AND u.user_type = ? AND u.is_active = 1
        `;
        const [users] = await db.promise().execute(getUserQuery, [email, userType]);

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Remove password from response
        delete user.password;

        res.json({ 
            success: true, 
            message: 'Login successful',
            user: user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Get user profile
app.get('/api/profile/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const getUserQuery = `
            SELECT u.*, 
                   s.grade_level as grade,
                   t.subject_specialization as subject,
                   t.years_experience as experience,
                   t.rating as rating,
                   t.total_ratings as total_ratings,
                   t.location as location
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN teachers t ON u.id = t.user_id
            WHERE u.id = ? AND u.is_active = 1
        `;
        const [users] = await db.promise().execute(getUserQuery, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];
        delete user.password;

        res.json({ success: true, user: user });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
});

// Get all teachers (for student directory)
app.get('/api/teachers', async (req, res) => {
    try {
        const getTeachersQuery = `
            SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
                   t.subject_specialization as subject,
                   t.years_experience as experience,
                   t.bio,
                   t.hourly_rate,
                   t.rating,
                   t.total_ratings,
                   t.location
            FROM users u
            JOIN teachers t ON u.id = t.user_id
            WHERE u.is_active = 1
            ORDER BY t.rating DESC, u.first_name ASC
        `;
        const [teachers] = await db.promise().execute(getTeachersQuery);

        res.json({ success: true, teachers: teachers });

    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ success: false, message: 'Failed to get teachers' });
    }
});

// Send message
app.post('/api/send-message', async (req, res) => {
    try {
        const { senderId, receiverId, messageText } = req.body;

        if (!senderId || !receiverId || !messageText) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const insertMessageQuery = `
            INSERT INTO messages (sender_id, receiver_id, message_text, message_type) 
            VALUES (?, ?, ?, 'text')
        `;
        await db.promise().execute(insertMessageQuery, [senderId, receiverId, messageText]);

        res.json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Get messages between two users
app.get('/api/messages/:userId/:otherUserId', async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;

        const getMessagesQuery = `
            SELECT m.*, 
                   sender.first_name as sender_first_name,
                   sender.last_name as sender_last_name,
                   receiver.first_name as receiver_first_name,
                   receiver.last_name as receiver_last_name
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            JOIN users receiver ON m.receiver_id = receiver.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;
        const [messages] = await db.promise().execute(getMessagesQuery, [userId, otherUserId, otherUserId, userId]);

        res.json({ success: true, messages: messages });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Failed to get messages' });
    }
});

// Get all messages for a user
app.get('/api/user-messages/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const getUserMessagesQuery = `
            SELECT m.*, 
                   sender.first_name as sender_first_name,
                   sender.last_name as sender_last_name,
                   receiver.first_name as receiver_first_name,
                   receiver.last_name as receiver_last_name
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            JOIN users receiver ON m.receiver_id = receiver.id
            WHERE m.sender_id = ? OR m.receiver_id = ?
            ORDER BY m.created_at DESC
        `;
        const [messages] = await db.promise().execute(getUserMessagesQuery, [userId, userId]);

        res.json({ success: true, messages: messages });

    } catch (error) {
        console.error('Get user messages error:', error);
        res.status(500).json({ success: false, message: 'Failed to get messages' });
    }
});

// Update password
app.put('/api/update-password/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
        await db.promise().execute(updatePasswordQuery, [hashedPassword, userId]);

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update password' });
    }
});

// Update teacher location
app.put('/api/update-location/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { location } = req.body;
        if (!location || !location.trim()) {
            return res.status(400).json({ success: false, message: 'Location is required' });
        }
        // Ensure user is a teacher
        const [rows] = await db.promise().execute('SELECT id FROM teachers WHERE user_id = ?', [userId]);
        if (!rows.length) {
            return res.status(400).json({ success: false, message: 'Only teachers can set location' });
        }
        await db.promise().execute('UPDATE teachers SET location = ? WHERE user_id = ?', [location.trim(), userId]);
        res.json({ success: true, message: 'Location updated' });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ success: false, message: 'Failed to update location' });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${config.database.database}@${config.database.host}`);
});
