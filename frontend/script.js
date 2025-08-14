let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let userName = '';
let quizTimer;
let timeRemaining = 300; // 5 minutes
let quizStartTime;

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showStartScreen() {
    showScreen('start-screen');
    document.getElementById('user-name').value = '';
    document.getElementById('name-error').textContent = '';
    resetTimer();
}

function validateName() {
    const name = document.getElementById('user-name').value.trim();
    const errorElement = document.getElementById('name-error');
    
    if (!name) {
        errorElement.textContent = 'Please enter your name';
        return false;
    }
    if (name.length < 2) {
        errorElement.textContent = 'Name must be at least 2 characters';
        return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        errorElement.textContent = 'Name can only contain letters and spaces';
        return false;
    }
    
    errorElement.textContent = '';
    return true;
}

async function startQuiz() {
    if (!validateName()) return;
    
    userName = document.getElementById('user-name').value.trim();
    
    try {
        showLoadingState();
        const response = await fetch('/api/questions');
        
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        
        currentQuestions = await response.json();
        currentQuestionIndex = 0;
        userAnswers = {};
        quizStartTime = Date.now();
        
        showScreen('quiz-screen');
        startTimer();
        displayQuestion();
    } catch (error) {
        showError('Failed to load questions. Please check your connection and try again.');
    }
}

function showLoadingState() {
    // Could add a loading spinner here
}

function showError(message) {
    alert(message); // In production, use a proper modal
}

function startTimer() {
    timeRemaining = 300; // Reset to 5 minutes
    updateTimerDisplay();
    
    quizTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(quizTimer);
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('timer-display');
    if (timerElement) {
        timerElement.textContent = display;
        
        // Change color when time is running low
        if (timeRemaining <= 60) {
            timerElement.style.color = '#e53e3e';
        } else if (timeRemaining <= 120) {
            timerElement.style.color = '#f6ad55';
        }
    }
}

function resetTimer() {
    if (quizTimer) {
        clearInterval(quizTimer);
    }
    timeRemaining = 300;
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    
    // Update progress bar
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('question-counter').textContent = 
        `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
    
    // Display question and options
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('option-a').textContent = `A. ${question.option_a}`;
    document.getElementById('option-b').textContent = `B. ${question.option_b}`;
    document.getElementById('option-c').textContent = `C. ${question.option_c}`;
    document.getElementById('option-d').textContent = `D. ${question.option_d}`;
    
    // Reset option styles
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Update next button
    const nextBtn = document.getElementById('next-btn');
    const nextText = document.getElementById('next-text');
    
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextText.textContent = 'Submit Quiz';
        nextBtn.innerHTML = '<span>Submit Quiz</span><i class="fas fa-check"></i>';
    } else {
        nextText.textContent = 'Next Question';
        nextBtn.innerHTML = '<span>Next Question</span><i class="fas fa-arrow-right"></i>';
    }
    
    nextBtn.disabled = true;
}

function selectAnswer(answer) {
    const question = currentQuestions[currentQuestionIndex];
    userAnswers[question.id] = answer;
    
    // Update UI
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    document.getElementById(`option-${answer}`).classList.add('selected');
    
    document.getElementById('next-btn').disabled = false;
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        displayQuestion();
    } else {
        submitQuiz();
    }
}

async function submitQuiz() {
    clearInterval(quizTimer);
    
    try {
        const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
        
        const response = await fetch('/api/submit-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userName: userName,
                answers: userAnswers,
                timeTaken: timeTaken
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit quiz');
        }
        
        const result = await response.json();
        displayResults(result, timeTaken);
    } catch (error) {
        showError('Failed to submit quiz. Please try again.');
    }
}

function displayResults(result, timeTaken) {
    const percentage = Math.round((result.score / result.total) * 100);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    
    // Update trophy icon based on performance
    const trophyIcon = document.getElementById('result-trophy');
    if (percentage >= 80) {
        trophyIcon.style.color = '#f6ad55'; // Gold
    } else if (percentage >= 60) {
        trophyIcon.style.color = '#a0aec0'; // Silver
    } else {
        trophyIcon.style.color = '#d69e2e'; // Bronze
    }
    
    // Display score
    document.getElementById('score-display').innerHTML = `
        <h3>Congratulations, ${userName}!</h3>
        <div style="font-size: 2rem; font-weight: 700; color: #667eea; margin: 1rem 0;">
            ${result.score}/${result.total}
        </div>
        <div style="font-size: 1.2rem; color: #4a5568;">
            ${percentage}% Correct
        </div>
    `;
    
    // Display detailed stats
    document.getElementById('result-stats').innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${percentage}%</div>
            <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${minutes}:${seconds.toString().padStart(2, '0')}</div>
            <div class="stat-label">Time Taken</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${result.score}</div>
            <div class="stat-label">Correct</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${result.total - result.score}</div>
            <div class="stat-label">Incorrect</div>
        </div>
    `;
    
    showScreen('result-screen');
}

async function showLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        
        const leaderboard = await response.json();
        displayLeaderboard(leaderboard);
        showScreen('leaderboard-screen');
    } catch (error) {
        showError('Failed to load leaderboard.');
    }
}

function displayLeaderboard(leaderboard) {
    if (!leaderboard.length) {
        document.getElementById('leaderboard-list').innerHTML = 
            '<div style="text-align: center; color: #718096; padding: 2rem;">No results yet! Be the first to take the quiz.</div>';
        return;
    }
    
    const leaderboardHtml = leaderboard.map((entry, index) => {
        const percentage = Math.round((entry.score / entry.total_questions) * 100);
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        const percentageClass = percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : percentage >= 40 ? 'average' : 'poor';
        
        return `
            <div class="leaderboard-item">
                <div class="rank ${rankClass}">#${index + 1}</div>
                <div class="user-name">${entry.user_name}</div>
                <div class="score">${entry.score}/${entry.total_questions}</div>
                <div class="percentage ${percentageClass}">${percentage}%</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('leaderboard-list').innerHTML = leaderboardHtml;
}

function filterLeaderboard(filter) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // In a real app, you'd filter by date here
    showLeaderboard();
}

function restartQuiz() {
    resetTimer();
    showStartScreen();
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (document.getElementById('quiz-screen').classList.contains('active')) {
        if (e.key >= '1' && e.key <= '4') {
            const options = ['a', 'b', 'c', 'd'];
            selectAnswer(options[parseInt(e.key) - 1]);
        } else if (e.key === 'Enter' && !document.getElementById('next-btn').disabled) {
            nextQuestion();
        }
    }
});

// Add input validation on typing
document.getElementById('user-name').addEventListener('input', validateName);