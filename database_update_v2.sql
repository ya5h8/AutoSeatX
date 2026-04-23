-- Create table for dynamic feedback questions
CREATE TABLE IF NOT EXISTS feedback_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'rating', -- 'rating' or 'text'
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add JSON column to feedback table for dynamic responses
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS responses JSON AFTER exam_id;

-- Insert default questions
INSERT INTO feedback_questions (label, type) VALUES 
('Clear Instructions', 'rating'),
('Seat Comfort', 'rating'),
('Invigilation Quality', 'rating'),
('Hall Environment', 'rating'),
('Check-in Process', 'rating');
