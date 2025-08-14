# MAHI_7 Quizzy - 3-Tier Quiz Application

A complete 3-tier architecture quiz application built with Node.js and MySQL.

## Architecture Overview

### 1. Presentation Tier (Frontend)
- **HTML**: User interface structure
- **CSS**: Styling and responsive design
- **JavaScript**: Client-side logic and API communication

### 2. Logic Tier (Backend)
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **API Endpoints**: RESTful services for quiz operations

### 3. Data Tier (Database)
- **MySQL**: Relational database
- **Tables**: Questions and quiz results storage

## Setup Instructions

### Prerequisites
- Node.js installed
- MySQL server running
- MySQL client (phpMyAdmin, MySQL Workbench, or command line)

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd MAHI_7_Quizzy
   npm install
   ```

2. **Setup Database**
   - Create MySQL database using `database/schema.sql`
   - Update database credentials in `backend/config/database.js`

3. **Run Application**
   ```bash
   npm start
   ```

4. **Access Application**
   - Open browser: `http://localhost:3000`

## API Endpoints

- `GET /api/questions` - Fetch random quiz questions
- `POST /api/submit-quiz` - Submit quiz answers
- `GET /api/leaderboard` - Get top scores

## Features

- Interactive quiz interface
- Real-time scoring
- Leaderboard system
- Responsive design
- MySQL data persistence

## Database Schema

### Questions Table
- id, question, option_a, option_b, option_c, option_d, correct_answer

### Quiz Results Table
- id, user_name, score, total_questions, completed_at