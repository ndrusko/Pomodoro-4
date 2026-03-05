// --- STATE VARIJABLE ---
let focusTime = 25 * 60;
let breakTime = 5 * 60;
let timeLeft = focusTime;
let isRunning = false;
let isFocusMode = true;
let timerInterval = null;

let dailyGoal = 4;
let completedPomodoros = 0;
let soundType = 'none';

// --- ELEMENTI ---
const timeDisplay = document.getElementById('time-display');
const modeText = document.getElementById('mode-text');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

const animIcon = document.getElementById('anim-icon');
const animTrack = document.getElementById('anim-track');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');

// --- AUDIO CONTEXT ZA ZVUKOVE OTKUCAVANJA (Bez eksternih datoteka!) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function playTickSound() {
    if (soundType === 'none') return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    
    if (soundType === 'tick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    } else if (soundType === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (soundType === 'wood') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
    } else if (soundType === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.setValueAtTime(0, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    }
}

// --- TIMER LOGIKA ---
function updateDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timeDisplay.textContent = `${m}:${s}`;
    
    // Vizualni progress
    const totalTime = isFocusMode ? focusTime : breakTime;
    const percent = ((totalTime - timeLeft) / totalTime) * 100;
    updateAnimation(percent);
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
            playTickSound();
        } else {
            handleSessionEnd();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
}

function resetTimer() {
    pauseTimer();
    timeLeft = isFocusMode ? focusTime : breakTime;
    updateDisplay();
}

function handleSessionEnd() {
    pauseTimer();
    // Odsviraj alarm za kraj
    if(audioCtx) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start(); osc.stop(audioCtx.currentTime + 1);
    }

    if (isFocusMode) {
        completedPomodoros++;
        updateGoalProgress();
        isFocusMode = false;
        timeLeft = breakTime;
        modeText.textContent = "Vrijeme je za odmor";
    } else {
        isFocusMode = true;
        timeLeft = focusTime;
        modeText.textContent = "Vrijeme je za fokus";
    }
    updateDisplay();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// --- ANIMACIJE ---
function updateAnimation(percent) {
    const animType = document.getElementById('set-anim').value;
    animIcon.style.top = '50%'; animIcon.style.left = '50%'; animIcon.style.transform = 'translate(-50%, -50%)'; // Reset

    if (animType === 'anim-rocket') {
        animIcon.textContent = '🚀';
        animIcon.style.left = `${percent}%`;
        animTrack.style.background = `linear-gradient(90deg, #87CEEB ${percent}%, #000033 ${percent}%)`;
    } 
    else if (animType === 'anim-plant') {
        animTrack.style.background = 'transparent';
        if (percent < 25) animIcon.textContent = '🌰';
        else if (percent < 50) animIcon.textContent = '🌱';
        else if (percent < 80) animIcon.textContent = '🌿';
        else animIcon.textContent = '🌳';
    }
    else if (animType === 'anim-sun') {
        animTrack.style.background = `linear-gradient(90deg, rgba(255,150,0,0.5), rgba(0,0,50,0.5))`;
        if (percent < 50) animIcon.textContent = '☀️';
        else if (percent < 80) animIcon.textContent = '🌇';
        else animIcon.textContent = '🌙';
        animIcon.style.left = `${percent}%`;
    }
    else if (animType === 'anim-battery') {
        animTrack.style.background = `linear-gradient(90deg, #0f0 ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
        if (percent < 20) animIcon.textContent = '🪫';
        else if (percent < 99) animIcon.textContent = '🔋';
        else animIcon.textContent = '⚡';
    }
    else if (animType === 'anim-mountain') {
        animIcon.textContent = '🧗';
        animTrack.style.background = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><path d="M0 20 L50 0 L100 20 Z" fill="rgba(255,255,255,0.1)"/></svg>') no-repeat center/cover`;
        animIcon.style.left = `${percent}%`;
    }
}

// --- DNEVNI CILJ (Goal Progress) ---
function updateGoalProgress() {
    document.getElementById('goal-count').textContent = completedPomodoros;
    document.getElementById('goal-total').textContent = dailyGoal;
    
    const style = document.getElementById('set-prog-style').value;
    progressContainer.className = `progress-bar-container ${style}`;
    
    const percentage = Math.min((completedPomodoros / dailyGoal) * 100, 100);

    if (style === 'style-dots') {
        progressContainer.innerHTML = '';
        for(let i=0; i<dailyGoal; i++) {
            const dot = document.createElement('div');
            dot.style.width = '10px'; dot.style.height = '10px'; 
            dot.style.borderRadius = '50%';
            dot.style.background = i < completedPomodoros ? 'var(--accent)' : 'rgba(255,255,255,0.2)';
            progressContainer.appendChild(dot);
        }
    } else {
        progressContainer.innerHTML = '<div class="progress-fill" id="progress-fill"></div>';
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }
}

// --- SAT (Clock) ---
function updateClock() {
    const tz = document.getElementById('set-tz').value;
    const format = document.getElementById('set-format').value;
    
    const options = { 
        hour: '2-digit', minute: '2-digit', 
        hour12: format === '12' 
    };
    if (tz !== 'local') options.timeZone = tz;

    try {
        const timeStr = new Intl.DateTimeFormat('en-US', options).format(new Date());
        document.getElementById('clock').textContent = timeStr;
    } catch (e) {
        document.getElementById('clock').textContent = "Err";
    }
}
setInterval(updateClock, 1000);

// --- POSTAVKE I LOCAL STORAGE ---
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const saveBtn = document.getElementById('save-btn');

settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));

saveBtn.addEventListener('click', () => {
    // Učitaj postavke
    focusTime = parseInt(document.getElementById('set-focus').value) * 60;
    breakTime = parseInt(document.getElementById('set-break').value) * 60;
    dailyGoal = parseInt(document.getElementById('set-goal').value);
    soundType = document.getElementById('set-sound').value;
    
    // Background i Sat stilovi
    document.getElementById('body-bg').className = document.getElementById('set-bg').value;
    const clockEl = document.getElementById('clock');
    clockEl.className = `clock ${document.getElementById('set-clock-pos').value} ${document.getElementById('set-clock-style').value}`;

    // Spremi u localStorage za Notion
    const settings = {
        focus: focusTime / 60, break: breakTime / 60, goal: dailyGoal,
        bg: document.getElementById('set-bg').value, anim: document.getElementById('set-anim').value,
        progStyle: document.getElementById('set-prog-style').value, sound: soundType,
        tz: document.getElementById('set-tz').value, format: document.getElementById('set-format').value,
        clockPos: document.getElementById('set-clock-pos').value, clockStyle: document.getElementById('set-clock-style').value
    };
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));

    resetTimer();
    updateGoalProgress();
    updateClock();
    settingsModal.classList.add('hidden');
});

// --- INICIJALIZACIJA ---
function loadSettings() {
    const saved = JSON.parse(localStorage.getItem('pomodoroSettings'));
    if (saved) {
        document.getElementById('set-focus').value = saved.focus;
        document.getElementById('set-break').value = saved.break;
        document.getElementById('set-goal').value = saved.goal;
        document.getElementById('set-bg').value = saved.bg;
        document.getElementById('set-anim').value = saved.anim;
        document.getElementById('set-prog-style').value = saved.progStyle;
        document.getElementById('set-sound').value = saved.sound;
        document.getElementById('set-tz').value = saved.tz;
        document.getElementById('set-format').value = saved.format;
        document.getElementById('set-clock-pos').value = saved.clockPos;
        document.getElementById('set-clock-style').value = saved.clockStyle;
    }
    saveBtn.click(); // Primijeni sve
}

loadSettings();