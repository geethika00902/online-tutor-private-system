const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const config = require('./config');

// Database connection
const db = mysql.createConnection(config.database);

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL database');
});

async function insertSampleData() {
    try {
        console.log('🚀 Inserting sample data...');

        // Sample Students Data
        const students = [
            {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@email.com',
                password: 'password123',
                phone: '555-0101',
                grade: '10'
            },
            {
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.johnson@email.com',
                password: 'password123',
                phone: '555-0102',
                grade: '12'
            },
            {
                firstName: 'Michael',
                lastName: 'Brown',
                email: 'michael.brown@email.com',
                password: 'password123',
                phone: '555-0103',
                grade: '9'
            }
        ];

        // Sample Teachers Data
        const teachers = [
            {
                firstName: 'Dr. Emily',
                lastName: 'Davis',
                email: 'emily.davis@email.com',
                password: 'password123',
                phone: '555-0201',
                subject: 'mathematics',
                experience: '6-10'
            },
            {
                firstName: 'Prof. Robert',
                lastName: 'Wilson',
                email: 'robert.wilson@email.com',
                password: 'password123',
                phone: '555-0202',
                subject: 'science',
                experience: '10+'
            },
            {
                firstName: 'Ms. Lisa',
                lastName: 'Garcia',
                email: 'lisa.garcia@email.com',
                password: 'password123',
                phone: '555-0203',
                subject: 'english',
                experience: '2-5'
            }
        ];

        // Insert Students
        console.log('📚 Inserting students...');
        for (const student of students) {
            // Hash password
            const hashedPassword = await bcrypt.hash(student.password, 10);

            // Insert into users table
            const insertUserQuery = `
                INSERT INTO users (first_name, last_name, email, password, phone, user_type) 
                VALUES (?, ?, ?, ?, ?, 'student')
            `;
            const [userResult] = await db.promise().execute(
                insertUserQuery, 
                [student.firstName, student.lastName, student.email, hashedPassword, student.phone]
            );

            const userId = userResult.insertId;

            // Insert into students table
            const insertStudentQuery = `
                INSERT INTO students (user_id, grade_level) 
                VALUES (?, ?)
            `;
            await db.promise().execute(insertStudentQuery, [userId, student.grade]);

            console.log(`✅ Student inserted: ${student.firstName} ${student.lastName} (Grade ${student.grade})`);
        }

        // Insert Teachers
        console.log('👨‍🏫 Inserting teachers...');
        for (const teacher of teachers) {
            // Hash password
            const hashedPassword = await bcrypt.hash(teacher.password, 10);

            // Insert into users table
            const insertUserQuery = `
                INSERT INTO users (first_name, last_name, email, password, phone, user_type) 
                VALUES (?, ?, ?, ?, ?, 'teacher')
            `;
            const [userResult] = await db.promise().execute(
                insertUserQuery, 
                [teacher.firstName, teacher.lastName, teacher.email, hashedPassword, teacher.phone]
            );

            const userId = userResult.insertId;

            // Insert into teachers table
            const insertTeacherQuery = `
                INSERT INTO teachers (user_id, subject_specialization, years_experience) 
                VALUES (?, ?, ?)
            `;
            await db.promise().execute(insertTeacherQuery, [userId, teacher.subject, teacher.experience]);

            console.log(`✅ Teacher inserted: ${teacher.firstName} ${teacher.lastName} (${teacher.subject})`);
        }

        console.log('\n🎉 Sample data insertion completed!');
        console.log('\n📋 Login Credentials:');
        console.log('\n👨‍🎓 Students:');
        students.forEach(student => {
            console.log(`   Email: ${student.email} | Password: ${student.password} | Grade: ${student.grade}`);
        });
        
        console.log('\n👨‍🏫 Teachers:');
        teachers.forEach(teacher => {
            console.log(`   Email: ${teacher.email} | Password: ${teacher.password} | Subject: ${teacher.subject}`);
        });

        console.log('\n🌐 You can now test the system at: http://localhost:3000');

    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
    } finally {
        db.end();
    }
}

// Run the script
insertSampleData();

