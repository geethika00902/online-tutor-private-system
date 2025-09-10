-- Online Private Tutor System Database Schema
-- This file contains the SQL schema for the database

-- Create database
CREATE DATABASE IF NOT EXISTS tutor_system;
USE tutor_system;

-- Users table (for both students and teachers)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    user_type ENUM('student', 'teacher') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Students table (extends users table)
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(100),
    emergency_contact VARCHAR(20),
    learning_goals TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Teachers table (extends users table)
CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject_specialization VARCHAR(50) NOT NULL,
    years_experience VARCHAR(20) NOT NULL,
    education_level VARCHAR(50),
    certifications TEXT,
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    availability_schedule JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subjects table
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    grade_levels JSON,
    is_active BOOLEAN DEFAULT TRUE
);

-- Sessions table (for tutoring sessions)
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    session_notes TEXT,
    student_rating INT CHECK (student_rating >= 1 AND student_rating <= 5),
    teacher_rating INT CHECK (teacher_rating >= 1 AND teacher_rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Messages table (for communication between students and teachers)
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    session_id INT,
    message_text TEXT NOT NULL,
    message_type ENUM('text', 'file', 'image') DEFAULT 'text',
    file_path VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('credit_card', 'paypal', 'bank_transfer', 'cash') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Insert sample subjects
INSERT INTO subjects (name, description, grade_levels) VALUES
('Mathematics', 'Basic to advanced mathematics including algebra, geometry, calculus', '["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "college"]'),
('Science', 'General science, physics, chemistry, biology', '["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "college"]'),
('English', 'Reading, writing, grammar, literature', '["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "college"]'),
('History', 'World history, US history, social studies', '["6", "7", "8", "9", "10", "11", "12", "college"]'),
('Physics', 'Advanced physics concepts and problem solving', '["9", "10", "11", "12", "college"]'),
('Chemistry', 'Chemical reactions, organic chemistry, lab work', '["9", "10", "11", "12", "college"]'),
('Biology', 'Life sciences, anatomy, genetics', '["6", "7", "8", "9", "10", "11", "12", "college"]'),
('Computer Science', 'Programming, algorithms, data structures', '["6", "7", "8", "9", "10", "11", "12", "college"]'),
('Art', 'Drawing, painting, digital art, art history', '["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "college"]'),
('Music', 'Music theory, instrument lessons, composition', '["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "college"]');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
