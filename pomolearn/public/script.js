// script.js

// --- DOM Elements ---
const topicInputArea = document.getElementById('topic-input-area');
const topicInput = document.getElementById('topic-input');
const startLearningBtn = document.getElementById('start-learning-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');

const learningArea = document.getElementById('learning-area');
const currentTopicDisplay = document.getElementById('current-topic');
const timerDisplay = document.getElementById('timer-display');
const cycleInfoDisplay = document.getElementById('cycle-info');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const contentDisplay = document.getElementById('content-display');

// Add references for the skip buttons (ensure these IDs match your HTML)
const skipToBreakBtn = document.getElementById('skip-to-break-btn');
const skipBreakBtn = document.getElementById('skip-break-btn');

const quizArea = document.getElementById('quiz-area');
const quizLoading = document.getElementById('quiz-loading');
const quizError = document.getElementById('quiz-error');
const quizForm = document.getElementById('quiz-form');
const submitQuizBtn = document.getElementById('submit-quiz-btn');

const resultsArea = document.getElementById('results-area');
const scoreDisplay = document.getElementById('score-display');
const resultsDetails = document.getElementById('results-details');
const restartLearningBtn = document.getElementById('restart-learning-btn');

// --- State Variables ---
let currentTopic = '';
let cyclesContent = [];
let mcqs = [];
let currentCycle = 1;
const totalCycles = 4;
const workDuration = 25 * 60; // 25 minutes
const breakDuration = 5 * 60; // 5 minutes
let timerInterval = null;     // <<< Holds the interval ID
let isTimerRunning = false;   // <<< Tracks if timer is active
let isBreakTime = false;      // <<< Tracks work vs break phase
let timeRemaining = workDuration;
let userAnswers = {};

// --- API Base URL ---
const API_BASE_URL = window.location.origin;

// --- Utility Functions ---
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
function showElement(element) { if (element) element.classList.remove('hidden'); }
function hideElement(element) { if (element) element.classList.add('hidden'); }
function displayError(element, message) { if (!element) return; element.textContent = `Error: ${message}`; showElement(element); }
function clearError(element) { if (!element) return; element.textContent = ''; hideElement(element); }
function renderMarkdown(markdownText) { /* ... Keep improved version from your code ... */
    if (!markdownText) return ''; let html = markdownText; html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>'); html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>'); html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); html = html.replace(/([^*]|^)\*(?!\*)([^*]+)\*(?![*])/g, '$1<em>$2</em>'); html = html.replace(/([^_]|^)_(?!_)([^_]+)_(?![_])/g, '$1<em>$2</em>'); html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>'); html = html.replace(/<\/li>\s*<li>/g, '</li>\n<li>'); html = html.replace(/(?:<li>.*<\/li>\s*)+/g, (match) => { if (!match.trim().startsWith('<ul>')) { return `<ul>\n${match.trim()}\n</ul>`; } return match; }); html = html.trim(); html = html.split(/\n\s*\n/).map(p => `<p>${p.trim()}</p>`).join(''); html = html.replace(/<p>(.*?)<\/p>/g, (match, pContent) => { let processedContent = pContent.replace(/\n/g, '<br>'); processedContent = processedContent.replace(/<li><br>/g, '<li>'); processedContent = processedContent.replace(/<\/h2><br>/g, '</h2>'); processedContent = processedContent.replace(/<ul><br>/g, '<ul>'); processedContent = processedContent.replace(/<br><\/ul>/g, '</ul>'); return `<p>${processedContent}</p>`; }); html = html.replace(/<p>\s*<\/p>/g, ''); html = html.replace(/<p>\s*(<(?:ul|h2)>.*?<\/(?:ul|h2)>)\s*<\/p>/g, '$1'); return html;
}

// --- Button State and Visibility ---
function updateButtonStates() {
    if (!startPauseBtn || !skipToBreakBtn || !skipBreakBtn) return; // Check if elements exist

    // Start/Pause/Resume Button
    if (isTimerRunning) {
        startPauseBtn.textContent = 'Pause';
        startPauseBtn.classList.add('paused');
    } else {
        startPauseBtn.classList.remove('paused');
        // Determine appropriate text when timer is stopped
        if (timeRemaining <= 0 && currentCycle > totalCycles) {
            startPauseBtn.textContent = 'Session Done'; // Indicate completion
        } else if (timeRemaining > 0 && timeRemaining < (isBreakTime ? breakDuration : workDuration)) {
            startPauseBtn.textContent = 'Resume';
        } else if (!isBreakTime) {
            startPauseBtn.textContent = `Start Cycle ${currentCycle}`;
        } else {
            // If break is ready to start or paused during break
            startPauseBtn.textContent = `Start Break`; // Consistent text
        }
    }

    // Skip Buttons Visibility
    hideElement(skipToBreakBtn);
    hideElement(skipBreakBtn);
    if (isTimerRunning) { // Only show skip buttons if timer is running
        if (!isBreakTime && currentCycle <= totalCycles) {
            showElement(skipToBreakBtn); // Show during work
        } else if (isBreakTime) {
            showElement(skipBreakBtn);  // Show during break
        }
    }
}

// --- Core Logic Functions ---

function updateTimerDisplay() {
    if (timerDisplay) timerDisplay.textContent = formatTime(timeRemaining);
}

function updateCycleInfo() {
    if (!cycleInfoDisplay) return;
    let status = '';
    if (currentCycle > totalCycles && !isBreakTime) { // Check if session truly ended
        status = "Session Complete!";
    } else {
        status = isBreakTime ? `Break Time` : `Work Time`;
        status = `Cycle ${currentCycle > totalCycles ? totalCycles : currentCycle}/${totalCycles} - ${status}`; // Prevent showing Cycle 5
    }
    cycleInfoDisplay.textContent = status;

    if (isBreakTime) {
        learningArea?.classList.add('break-time');
    } else {
        learningArea?.classList.remove('break-time');
    }
    updateButtonStates(); // Update buttons whenever cycle info changes
}

function displayCurrentCycleContent() {
    if (!contentDisplay) return;
    if (!isBreakTime && currentCycle <= totalCycles && cyclesContent.length > 0) {
        const markdown = cyclesContent[currentCycle - 1];
        contentDisplay.innerHTML = renderMarkdown(markdown);
    } else if (isBreakTime) {
        contentDisplay.innerHTML = "<p>Take a 5-minute break! Stretch, relax, look away from the screen.</p>";
    } else if (currentCycle > totalCycles) {
        contentDisplay.innerHTML = "<p>Session complete. Preparing quiz...</p>";
    }
    else {
        contentDisplay.innerHTML = "<p>Click the Start button to begin.</p>";
    }
    contentDisplay.scrollTop = 0;
}

// --- TIMER START ---
function startTimer() {
    if (isTimerRunning || cyclesContent.length === 0) {
        console.log("Start timer prevented: Already running or no content.");
        return;
    }
    // Prevent starting if session is already fully complete
    if (currentCycle > totalCycles && !isBreakTime) {
        console.log("Start timer prevented: Session already completed.");
        return;
    }


    // Display content right before starting a work timer
    if (!isBreakTime) {
        displayCurrentCycleContent();
    }

    isTimerRunning = true; // <<< SET STATE
    updateButtonStates(); // Update button text to 'Pause', handle skip buttons

    console.log(`TIMER STARTED: Cycle ${currentCycle}, ${isBreakTime ? 'Break' : 'Work'}, Remaining: ${timeRemaining}s`);

    // Clear residual interval (safety)
    if (timerInterval) { clearInterval(timerInterval); }

    // --- The Core Interval ---
    timerInterval = setInterval(() => {
        if (!isTimerRunning) { // Safety check within interval
            clearInterval(timerInterval);
            timerInterval = null;
            console.warn("Interval running but isTimerRunning is false. Clearing interval.");
            return;
        }

        timeRemaining--;
        updateTimerDisplay();
        // console.log("Tick:", timeRemaining); // DEBUG: Uncomment for countdown log

        if (timeRemaining < 0) {
            console.log("Time ended, calling handleCycleCompletion.");
            handleCycleCompletion(); // <<< Transition to next phase
        }
    }, 1000);
}

// --- TIMER PAUSE ---
function pauseTimer() {
    if (!isTimerRunning) return; // Only pause if running

    clearInterval(timerInterval); // <<< STOP THE INTERVAL
    timerInterval = null;         // Clear the interval ID
    isTimerRunning = false;      // <<< SET STATE
    updateButtonStates();         // Update button text to 'Resume', hide skip buttons
    console.log("TIMER PAUSED");
}

// --- TIMER TOGGLE (START/PAUSE/RESUME) ---
function handleTimerToggle() {
    if (cyclesContent.length === 0 && !currentTopic) {
        displayError(errorMessage, "Please enter a topic and start the session first.");
        return;
    }

    if (isTimerRunning) {
        pauseTimer();
    } else {
        // Prevent starting if session is fully over
        if (currentCycle > totalCycles && !isBreakTime && timeRemaining <= 0) {
            console.log("Toggle prevented: Session ended.");
            return;
        }
        // If time is 0, handleCycleCompletion should have set the next state.
        // Pressing Start/Resume should just kick off the timer for that state.
        startTimer();
    }
}

// --- CYCLE TRANSITION LOGIC --- (Handles automatic progression)
function handleCycleCompletion() {
    // Stop the timer that just finished
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false; // Mark as stopped until next phase starts (manually or auto for break)
    console.log(`HANDLE COMPLETION: Ended Cycle ${currentCycle} ${isBreakTime ? 'Break' : 'Work'}`);

    if (isBreakTime) {
        // === Break Finished ===
        isBreakTime = false;      // <<< SET STATE for next phase
        currentCycle++;           // Move to next cycle number
        console.log(`Moving to Work Cycle ${currentCycle}`);

        if (currentCycle > totalCycles) {
            // ALL CYCLES DONE -> Quiz Time
            console.log("All cycles and final break finished. Generating quiz...");
            timeRemaining = 0; // Ensure time is 0
            updateTimerDisplay();
            updateCycleInfo();    // Show "Session Complete!"
            hideElement(learningArea);
            generateAndDisplayQuiz(); // Trigger quiz generation
        } else {
            // Setup for the NEXT Work Cycle
            timeRemaining = workDuration; // Reset timer duration
            updateCycleInfo();            // Update display (Cycle X/4 - Work Time)
            updateTimerDisplay();         // Show 25:00
            displayCurrentCycleContent(); // Show content for Cycle X
            // Don't show alert if manually skipped? Maybe okay for now.
            alert(`Break finished! Ready for Cycle ${currentCycle}. Click 'Start Cycle ${currentCycle}' to begin.`);
            // DO NOT auto-start work timer, wait for user click via handleTimerToggle
        }
    } else {
        // === Work Cycle Finished ===
        // Check if it was the *last* work cycle
        if (currentCycle >= totalCycles) {
            // LAST WORK CYCLE DONE -> Go straight to Quiz
            console.log("Final work cycle finished. Generating quiz...");
            timeRemaining = 0; // Ensure time is 0
            updateTimerDisplay();
            updateCycleInfo();    // Show "Session Complete!" status (or similar)
            hideElement(learningArea);
            generateAndDisplayQuiz(); // Trigger quiz generation
        } else {
            // Start the Break automatically
            isBreakTime = true;           // <<< SET STATE for next phase (Break)
            timeRemaining = breakDuration;// Reset timer duration for break
            console.log(`Starting Break after Cycle ${currentCycle}`);
            updateCycleInfo();            // Update display (Cycle X/4 - Break Time)
            updateTimerDisplay();         // Show 05:00
            displayCurrentCycleContent(); // Show break message
            alert(`Cycle ${currentCycle} complete! Time for a 5-minute break. Break timer starts now.`);
            startTimer();                 // <<< Auto-start the break timer
        }
    }
    // Ensure buttons reflect the new state after transition
    updateButtonStates();
}

// --- Manual Skip Handlers ---
function handleSkipToBreak() {
    if (!isTimerRunning || isBreakTime) {
        console.warn("Skip to break ignored: Timer not running or already in break.");
        return;
    }
    if (window.confirm("Finish work cycle early and start break?")) {
        console.log("Manually skipping to break...");
        // Stop current timer, set time to 0, call completion logic
        // clearInterval(timerInterval); // handleCycleCompletion does this
        // timerInterval = null;
        // isTimerRunning = false; // handleCycleCompletion does this
        timeRemaining = 0; // Set time to 0
        // isBreakTime remains false, so handleCycleCompletion enters the "Work Cycle Finished" block
        handleCycleCompletion();
    }
}

function handleSkipBreak() {
    if (!isTimerRunning || !isBreakTime) {
        console.warn("Skip break ignored: Timer not running or not in break.");
        return;
    }
    if (window.confirm("Skip break and start next cycle?")) {
        console.log("Manually skipping break...");
        // Stop current timer, set time to 0, call completion logic
        // clearInterval(timerInterval); // handleCycleCompletion does this
        // timerInterval = null;
        // isTimerRunning = false; // handleCycleCompletion does this
        timeRemaining = 0;
        // isBreakTime remains true, so handleCycleCompletion enters the "Break Finished" block
        handleCycleCompletion();
    }
}

// --- RESET FUNCTION ---
function resetTimerState(fullReset = true) {
    console.log(`RESETTING STATE: Full reset = ${fullReset}`);
    // Stop any running timer FIRST
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    // Reset all state variables
    isTimerRunning = false;
    isBreakTime = false;
    currentCycle = 1;
    timeRemaining = workDuration; // Reset to initial work duration

    // Update displays
    updateTimerDisplay(); // Show 25:00
    updateCycleInfo();    // Show Cycle 1/4 - Work Time (also updates buttons)

    // Explicitly hide skip buttons (updateCycleInfo also does this based on state)
    hideElement(skipToBreakBtn);
    hideElement(skipBreakBtn);

    if (fullReset) {
        // Reset topic, content, quiz, UI visibility
        if (contentDisplay) contentDisplay.innerHTML = '<p>Enter a topic above to begin.</p>';
        hideElement(learningArea);
        hideElement(quizArea);
        hideElement(resultsArea);
        showElement(topicInputArea);
        if (topicInput) topicInput.value = '';
        currentTopic = '';
        cyclesContent = [];
        mcqs = [];
        userAnswers = {};
        clearError(errorMessage);
        clearError(quizError);
        if (currentTopicDisplay) currentTopicDisplay.textContent = '';
        if (startPauseBtn) startPauseBtn.textContent = 'Start Cycle 1'; // Set initial button text
        startPauseBtn?.classList.remove('paused');

    } else {
        // Partial reset (e.g., before quiz)
        // Ensure timer is stopped visually
        if (startPauseBtn) startPauseBtn.textContent = 'Start'; // Or maybe 'Quiz Ready'?
        startPauseBtn?.classList.remove('paused');
        if (contentDisplay) {
            contentDisplay.innerHTML = "<p>Pomodoro session complete. Preparing quiz...</p>";
        }
        // Ensure cycle info reflects completion if needed
        updateCycleInfo();
    }
}

// --- FETCH CONTENT ---
async function fetchContentFromServer(topic) {
    clearError(errorMessage);
    showElement(loadingIndicator);
    hideElement(errorMessage);
    if (startLearningBtn) startLearningBtn.disabled = true;
    try {
        // ... (fetch call as before) ...
        const response = await fetch(`${API_BASE_URL}/api/generate-content`, { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ topic }), });
        if (!response.ok) { const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' })); throw new Error(errorData.error || `HTTP error! status: ${response.status}`); }
        const data = await response.json();
        if (!data.cycles || !Array.isArray(data.cycles) || data.cycles.length !== totalCycles || data.cycles.some(c => typeof c !== 'string')) { console.error("Invalid content structure received:", data); throw new Error("Invalid or incomplete content received from the server."); }

        cyclesContent = data.cycles;
        currentTopic = topic;
        if (currentTopicDisplay) currentTopicDisplay.textContent = `Learning: ${currentTopic}`;

        hideElement(topicInputArea);
        showElement(learningArea);

        // Call resetTimerState to set up initial Cycle 1 state correctly
        resetTimerState(false); // Use partial reset to keep topic/content loaded

        // Explicitly ensure Cycle 1 setup after reset
        currentCycle = 1;
        isBreakTime = false;
        timeRemaining = workDuration;
        updateCycleInfo(); // Show Cycle 1 - Work, updates button text
        updateTimerDisplay(); // Show 25:00
        contentDisplay.innerHTML = '<p>Content loaded. Click "Start Cycle 1" to begin.</p>';
        // startPauseBtn.textContent = 'Start Cycle 1'; // updateCycleInfo handles this via updateButtonStates

        console.log("Learning content loaded successfully.");

    } catch (error) {
        console.error("Failed to fetch content:", error);
        displayError(errorMessage, `Failed to load content. ${error.message}`);
        resetTimerState(true); // Full reset on fetch error
    } finally {
        hideElement(loadingIndicator);
        if (startLearningBtn) startLearningBtn.disabled = false;
    }
}

// --- Quiz Generation, Rendering, Submission, Results ---
// [ Keep generateAndDisplayQuiz, renderQuiz, handleQuizSubmit, displayResults functions as previously corrected ]
async function generateAndDisplayQuiz() { /* ... Keep implementation ... */
    showElement(quizArea); hideElement(quizForm); hideElement(submitQuizBtn); hideElement(quizError); showElement(quizLoading); try { console.log("Sending content for quiz..."); const response = await fetch(`${API_BASE_URL}/api/generate-quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: cyclesContent }) }); if (!response.ok) { const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' })); throw new Error(errorData.error || `HTTP error! status: ${response.status}`); } const data = await response.json(); if (!data.mcqs || !Array.isArray(data.mcqs) || data.mcqs.length === 0 || !data.mcqs[0].question || !data.mcqs[0].options || !Array.isArray(data.mcqs[0].options) || data.mcqs[0].options.length === 0 || !data.mcqs[0].correctAnswer || !data.mcqs[0].id) { console.error("Invalid MCQ structure:", data); throw new Error("Invalid quiz data received."); } mcqs = data.mcqs; console.log(`Received ${mcqs.length} MCQs.`); renderQuiz(); hideElement(quizLoading); showElement(quizForm); showElement(submitQuizBtn); } catch (error) { console.error("Failed quiz generation:", error); displayError(quizError, `Failed quiz. ${error.message}`); hideElement(quizLoading); }
}
function renderQuiz() { /* ... Keep implementation ... */
    if (!quizForm) return; quizForm.innerHTML = ''; mcqs.forEach((mcq, index) => { const questionDiv = document.createElement('div'); questionDiv.classList.add('mcq'); questionDiv.id = mcq.id; const questionText = document.createElement('p'); questionText.innerHTML = `<strong>${index + 1}. ${mcq.question}</strong>`; questionDiv.appendChild(questionText); const optionsList = document.createElement('div'); optionsList.classList.add('options'); let shuffledOptions = [...mcq.options]; for (let i = shuffledOptions.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]]; } shuffledOptions.forEach((option) => { const label = document.createElement('label'); const radio = document.createElement('input'); radio.type = 'radio'; radio.name = mcq.id; radio.value = option; radio.required = true; label.appendChild(radio); label.appendChild(document.createTextNode(` ${option}`)); optionsList.appendChild(label); optionsList.appendChild(document.createElement('br')); }); questionDiv.appendChild(optionsList); quizForm.appendChild(questionDiv); });
}
function handleQuizSubmit(event) { /* ... Keep implementation ... */
    console.log("Submit Quiz Button Clicked. Processing answers..."); // Log button click

    userAnswers = {};
    let score = 0;
    let allAnswered = true;

    // Check if mcqs array is populated
    if (!mcqs || mcqs.length === 0) {
        console.error("Cannot submit quiz: No MCQs loaded.");
        displayError(quizError, "Cannot submit quiz, questions not loaded."); // Show error to user
        return;
    }

    mcqs.forEach(mcq => {
        // Ensure quizForm exists before querying
        const selectedOptionInput = quizForm ? quizForm.querySelector(`input[name="${mcq.id}"]:checked`) : null;
        if (selectedOptionInput) {
            userAnswers[mcq.id] = selectedOptionInput.value;
            // Trim both answers for comparison
            if (selectedOptionInput.value.trim() === mcq.correctAnswer.trim()) {
                score++;
            }
        } else {
            userAnswers[mcq.id] = null; // Mark as unanswered
            allAnswered = false;
        }
    });

    if (!allAnswered) {
        alert("Please answer all questions before submitting.");
        return; // Stop submission if not all questions are answered
    }

    console.log("User Answers:", userAnswers);
    console.log("Final Score:", score);

    displayResults(score); // Call existing display results function
}
function displayResults(score) { /* ... Keep implementation ... */
    hideElement(quizArea); showElement(resultsArea); if (scoreDisplay) scoreDisplay.textContent = `Your Score: ${score} / ${mcqs.length}`; if (!resultsDetails) return; resultsDetails.innerHTML = ''; mcqs.forEach((mcq, index) => { const resultItem = document.createElement('div'); resultItem.classList.add('result-item'); const questionP = document.createElement('p'); questionP.innerHTML = `<strong>${index + 1}. ${mcq.question}</strong>`; resultItem.appendChild(questionP); const userAnswer = userAnswers[mcq.id]; const userAnswerP = document.createElement('p'); const isCorrect = userAnswer !== null && userAnswer.trim() === mcq.correctAnswer.trim(); userAnswerP.innerHTML = `Your answer: <span class="user-answer">${userAnswer !== null ? userAnswer : 'Not answered'}</span>`; resultItem.appendChild(userAnswerP); if (isCorrect) { resultItem.classList.add('correct'); } else { resultItem.classList.add('incorrect'); const correctAnswerP = document.createElement('p'); correctAnswerP.innerHTML = `Correct answer: <span class="correct-answer-text">${mcq.correctAnswer}</span>`; resultItem.appendChild(correctAnswerP); if (userAnswer === null) { userAnswerP.innerHTML = `Your answer: <span class="user-answer incorrect">Not answered</span>`; } } resultsDetails.appendChild(resultItem); });
}

// --- Event Listeners ---
// Ensure elements exist before adding listeners
startLearningBtn?.addEventListener('click', () => {
    const topic = topicInput?.value.trim();
    if (topic) { fetchContentFromServer(topic); } else { displayError(errorMessage, "Please enter a topic."); }
});
topicInput?.addEventListener('keyup', (event) => { if (event.key === 'Enter') { startLearningBtn?.click(); } });
startPauseBtn?.addEventListener('click', handleTimerToggle);
resetBtn?.addEventListener('click', () => { if (confirm("Reset session?")) { resetTimerState(true); } });
submitQuizBtn?.addEventListener('click', handleQuizSubmit);
restartLearningBtn?.addEventListener('click', () => { resetTimerState(true); });

// Manual Skip Listeners (Re-enabled)
skipToBreakBtn?.addEventListener('click', handleSkipToBreak);
skipBreakBtn?.addEventListener('click', handleSkipBreak);


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing Pomolearn.");
    resetTimerState(true); // Ensure clean state on load
});