-- MAHI_7 Quizzy Database Schema
CREATE DATABASE IF NOT EXISTS mahi_quizzy;
USE mahi_quizzy;

-- Questions table
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer CHAR(1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz results table
CREATE TABLE quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    time_taken INT DEFAULT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_score (score DESC),
    INDEX idx_completed_at (completed_at DESC)
);

-- Sample questions
INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'c'),
('Which programming language is known as the "language of the web"?', 'Python', 'JavaScript', 'Java', 'C++', 'b'),
('What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language', 'a'),
('Which database is being used in this application?', 'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'c'),
('What is the full form of API?', 'Application Programming Interface', 'Advanced Programming Interface', 'Application Process Interface', 'Automated Programming Interface', 'a');