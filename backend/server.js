const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// API Routes
app.get('/api/questions', (req, res) => {
    const query = 'SELECT id, question, option_a, option_b, option_c, option_d FROM questions ORDER BY RAND() LIMIT 5';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error fetching questions:', err);
            return res.status(500).json({ 
                error: 'Failed to fetch questions',
                message: 'Please try again later'
            });
        }
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                error: 'No questions available',
                message: 'Please contact administrator'
            });
        }
        
        res.json(results);
    });
});

// Get quiz statistics
app.get('/api/stats', (req, res) => {
    const statsQuery = `
        SELECT 
            COUNT(*) as total_attempts,
            AVG(score) as average_score,
            MAX(score) as highest_score,
            COUNT(DISTINCT user_name) as unique_users
        FROM quiz_results
    `;
    
    db.query(statsQuery, (err, results) => {
        if (err) {
            console.error('Database error fetching stats:', err);
            return res.status(500).json({ error: 'Failed to fetch statistics' });
        }
        
        res.json(results[0] || {});
    });
});

app.post('/api/submit-quiz', (req, res) => {
    const { userName, answers, timeTaken } = req.body;
    
    // Validation
    if (!userName || typeof userName !== 'string' || userName.trim().length < 2) {
        return res.status(400).json({ 
            error: 'Invalid user name',
            message: 'Name must be at least 2 characters long'
        });
    }
    
    if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ 
            error: 'Invalid answers format',
            message: 'Answers must be provided'
        });
    }
    
    const questionIds = Object.keys(answers);
    if (questionIds.length === 0) {
        return res.status(400).json({ 
            error: 'No answers provided',
            message: 'Please answer at least one question'
        });
    }
    
    // Sanitize inputs
    const sanitizedName = userName.trim().substring(0, 100);
    const questionIdsStr = questionIds.map(id => parseInt(id)).filter(id => !isNaN(id)).join(',');
    
    if (!questionIdsStr) {
        return res.status(400).json({ 
            error: 'Invalid question IDs',
            message: 'Invalid quiz data'
        });
    }
    
    // Get correct answers
    const query = `SELECT id, correct_answer FROM questions WHERE id IN (${questionIdsStr})`;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error fetching correct answers:', err);
            return res.status(500).json({ 
                error: 'Failed to process quiz',
                message: 'Please try again'
            });
        }
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                error: 'Questions not found',
                message: 'Invalid quiz data'
            });
        }
        
        let score = 0;
        const correctAnswers = {};
        
        results.forEach(question => {
            correctAnswers[question.id] = question.correct_answer;
            if (answers[question.id] === question.correct_answer) {
                score++;
            }
        });
        
        // Save result with time taken
        const insertQuery = `
            INSERT INTO quiz_results (user_name, score, total_questions, time_taken) 
            VALUES (?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [sanitizedName, score, results.length, timeTaken || null], (err, insertResult) => {
            if (err) {
                console.error('Database error saving result:', err);
                return res.status(500).json({ 
                    error: 'Failed to save result',
                    message: 'Your score was calculated but not saved'
                });
            }
            
            res.json({ 
                score, 
                total: results.length,
                percentage: Math.round((score / results.length) * 100),
                timeTaken: timeTaken,
                resultId: insertResult.insertId
            });
        });
    });
});

app.get('/api/leaderboard', (req, res) => {
    const query = 'SELECT user_name, score, total_questions, completed_at FROM quiz_results ORDER BY score DESC, completed_at ASC LIMIT 10';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`MAHI_7 Quizzy server running on http://localhost:${PORT}`);
});