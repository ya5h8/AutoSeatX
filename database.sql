-- AutoSeatX Database Schema
-- Updated: 2026-04-10 (Multi-Tenancy Support)

CREATE DATABASE IF NOT EXISTS exam_seating;
USE exam_seating;

-- 1. Admin Table
-- Stores administrator credentials and college info
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    college_name VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Credentials for existing data
INSERT INTO admin (college_name, email, password)
VALUES ('Default College', 'admin@gmail.com', '$2b$10$lP/La5NzZev9VaikqeK7futjaMgTdLmxd.lvwXvamW.YENpRC5Np.')
ON DUPLICATE KEY UPDATE email=email;


-- 2. Student Datasets
CREATE TABLE IF NOT EXISTS student_datasets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    dataset_name VARCHAR(100) NOT NULL,
    total_students INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
);


-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    branch VARCHAR(50),
    year INT,
    dataset_id INT,
    UNIQUE KEY unique_student_per_dataset (roll_no, dataset_id),
    FOREIGN KEY (dataset_id) REFERENCES student_datasets(id) ON DELETE CASCADE
);


-- 4. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    room_no VARCHAR(50) NOT NULL,
    total_rows INT NOT NULL,
    total_columns INT NOT NULL,
    capacity INT NOT NULL,
    door_side VARCHAR(50) DEFAULT 'Left',
    floor_no INT NOT NULL DEFAULT 1,
    is_occupied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_room_per_college (room_no, admin_id),
    FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
);


-- 5. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    exam_type VARCHAR(50),
    exam_date DATE,
    start_time TIME,
    end_time TIME,
    dataset_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE,
    FOREIGN KEY (dataset_id) REFERENCES student_datasets(id) ON DELETE SET NULL
);


-- 6. Seating Allocations Table
CREATE TABLE IF NOT EXISTS seating_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT,
    room_id INT,
    roll_no VARCHAR(50),
    seat_row INT,
    seat_column INT,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);


-- 7. Feedback Questions Table
CREATE TABLE IF NOT EXISTS feedback_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'rating',
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
);


-- 8. Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(50) NOT NULL,
    exam_id INT NOT NULL,
    responses JSON,
    clear_instructions INT NOT NULL DEFAULT 3,
    seat_comfort INT NOT NULL DEFAULT 3,
    invigilation INT NOT NULL DEFAULT 3,
    hall_environment INT NOT NULL DEFAULT 3,
    checkin_process INT NOT NULL DEFAULT 3,
    student_year VARCHAR(50) DEFAULT 'Unknown Year',
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_feedback (roll_no, exam_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);


-- Default Feedback Questions for ID 1
INSERT INTO feedback_questions (admin_id, label, type) VALUES 
(1, 'Clear Instructions', 'rating'),
(1, 'Seat Comfort', 'rating'),
(1, 'Invigilation Quality', 'rating'),
(1, 'Hall Environment', 'rating'),
(1, 'Check-in Process', 'rating');
