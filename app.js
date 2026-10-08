// ScaleShift daily puzzle date.
// Day #1 starts on October 8, 2026 (Europe/Berlin).
const EPOCH = Date.UTC(2026, 9, 8);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ===================== STATE =====================
let puzzles = [];
let dayIndex = 0;
let todayData = null;
let currentRound = 0;
let scores = [];
let guesses = [];
let gameOver = false;
let timerId = null;
let timeLeft = 60;
const QUESTION_TIME = 60;

// ===================== AUDIO =====================
const audio = {
  ambient: new Audio("audio/ambient.wav"),
  slider: new Audio("audio/slider.wav"),
  lock: new Audio("audio/lock.wav"),
  good: new Audio("audio/good.wav"),
  perfect: new Audio("audio/perfect.wav"),
  neutral: new Audio("audio/neutral.wav"),
  tick: new Audio("audio/tick.wav"),
  timeout: new Audio("audio/timeout.wav")
};

let soundEnabled = localStorage.getItem("scaleshift-sound") !== "off";
let lastSliderSound = 0;
let lastTimerTick = 0;

audio.ambient.loop = true;
audio.ambient.volume = 0.10;

audio.slider.volume = 0.16;
audio.lock.volume = 0.20;
audio.good.volume = 0.20;
audio.perfect.volume = 0.22;
audio.neutral.volume = 0.16;
audio.tick.volume = 0.12;
audio.timeout.volume = 0.20;

function playSound(name) {
  if (!soundEnabled || !audio[name]) return;
  const sound = audio[name];
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function startAmbient() {
  if (!soundEnabled) return;
  audio.ambient.play().catch(() => {});
}

function stopAmbient() {
  audio.ambient.pause();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("scaleshift-sound", soundEnabled ? "on" : "off");

  if (soundEnabled) {
    startAmbient();
  } else {
    stopAmbient();
  }

  updateSoundButton();
}

function updateSoundButton() {
  const button = document.getElementById("sound-toggle");
  if (!button) return;
  button.textContent = soundEnabled ? "🔊" : "🔇";
  button.setAttribute("aria-label", soundEnabled ? "Mute sound" : "Enable sound");
  button.title = soundEnabled ? "Mute sound" : "Enable sound";
}

// Browsers require a user gesture before audio can play.
document.addEventListener("pointerdown", startAmbient, { once: true });

function getCumulativeScore() {
  return scores.reduce((sum, score) => sum + score, 0);
}

function getScoreDisplay() {
  const completedRounds = scores.length;
  const denominator = Math.max(1, completedRounds) * 100;
  return `${getCumulativeScore()} / ${denominator}`;
}

// Always use the German calendar date, regardless of the player's local timezone.
// Europe/Berlin automatically handles CET (winter) and CEST (summer).
function getBerlinDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = {};
  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }

  return { year: values.year, month: values.month, day: values.day };
}

function getDayIndex(date = new Date()) {
  const berlin = getBerlinDate(date);
  const berlinDateUTC = Date.UTC(berlin.year, berlin.month - 1, berlin.day);
  return Math.floor((berlinDateUTC - EPOCH) / MS_PER_DAY);
}

function getTodaysPuzzle() {
  return puzzles[dayIndex % puzzles.length];
}

// ===================== QUESTIONS =====================
function getQuestion(round) {
  const a = round.a;
  const b = round.b;
  const ratio = Number(round.ratio);

  // If the data is accidentally ordered with the smaller object first,
  // reverse the wording rather than asking an awkward question.
  const largerIsA = ratio >= 1;
  const first = largerIsA ? a : b;
  const second = largerIsA ? b : a;

  switch (round.dimension) {
    case "length":
      return `How many times longer is ${first} than ${second}?`;

    case "height":
      return `How many times taller is ${first} than ${second}?`;

    case "weight":
      return `How many times heavier is ${first} than ${second}?`;

    case "wingspan":
      return `How many times wider is ${first}'s wingspan than ${second}'s?`;

    default:
      return `How many times bigger is ${first} than ${second}?`;
  }
}

function formatValue(value, unit) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return null;
  }

  const n = Number(value);
  if (Number.isInteger(n)) return `${n.toLocaleString()} ${unit}`;
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`;
}

function getDimensionVerb(dimension) {
  switch (dimension) {
    case "length": return "longer";
    case "height": return "taller";
    case "weight": return "heavier";
    case "wingspan": return "wider";
    default: return "larger";
  }
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = QUESTION_TIME;
  lastTimerTick = 0;
  updateTimerUI();

  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimerUI();

    if (timeLeft <= 5 && timeLeft > 0 && timeLeft !== lastTimerTick) {
      lastTimerTick = timeLeft;
      playSound("tick");
    }

    if (timeLeft <= 0) {
      clearInterval(timerId);
      timerId = null;
      playSound("timeout");
      submitAnswer(true);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function updateTimerUI() {
  const timer = document.getElementById("timer");
  const timerFill = document.getElementById("timer-fill");
  if (!timer || !timerFill) return;

  timer.textContent = `${timeLeft}s`;
  const percentage = Math.max(0, (timeLeft / QUESTION_TIME) * 100);
  timerFill.style.width = `${percentage}%`;

  timer.classList.toggle("warning", timeLeft <= 15);
  timer.classList.toggle("danger", timeLeft <= 5);
}

function submitAnswer(timedOut = false) {
  if (gameOver) return;

  const lockBtn = document.getElementById("lock-btn");
  if (!lockBtn || lockBtn.disabled) return;
  lockBtn.disabled = true;
  stopTimer();
  if (!timedOut) playSound("lock");

  const slider = document.getElementById("ratio-slider");
  const round = todayData.rounds[currentRound];
  const guess = timedOut ? parseFloat(slider.value) : parseFloat(slider.value);
  const score = scoreRatio(guess, round.ratio);

  scores.push(score);
  guesses.push(guess);

  localStorage.setItem(
    `scaleshift-${dayIndex}`,
    JSON.stringify({ scores, guesses })
  );

  showRoundResult(guess, round, score, timedOut);
}


// ===================== SCORING =====================
function scoreRatio(guess, trueRatio) {
  if (guess <= 0 || trueRatio <= 0) return 0;

  // A score is based on the multiplicative error, so guessing half or
  // double the true answer is treated symmetrically.
  const error = Math.max(guess / trueRatio, trueRatio / guess);

  if (error <= 1.05) return 100;
  if (error <= 1.10) return 90;
  if (error <= 1.20) return 75;
  if (error <= 1.35) return 60;
  if (error <= 1.60) return 45;
  if (error <= 2.00) return 30;
  if (error <= 3.00) return 15;
  if (error <= 5.00) return 5;
  return 0;
}

// ===================== STREAK =====================
function updateStreak(finishedToday) {
  const streakKey = "scaleshift-streak";
  const lastDayKey = "scaleshift-lastDay";
  let streak = parseInt(localStorage.getItem(streakKey) || "0", 10);
  const lastDay = parseInt(localStorage.getItem(lastDayKey) || "-999", 10);

  if (finishedToday) {
    if (lastDay === dayIndex - 1) {
      streak += 1;
    } else if (lastDay !== dayIndex) {
      streak = 1;
    }

    localStorage.setItem(streakKey, String(streak));
    localStorage.setItem(lastDayKey, String(dayIndex));
  }

  return streak;
}

// ===================== LOAD DATA =====================
async function loadPuzzles() {
  try {
    const res = await fetch("puzzles.json");
    if (!res.ok) throw new Error("Failed to load puzzles.json");

    puzzles = await res.json();
    if (!Array.isArray(puzzles) || puzzles.length === 0) {
      throw new Error("puzzles.json contains no puzzles");
    }

    dayIndex = Math.max(0, getDayIndex());
    todayData = getTodaysPuzzle();

    // Save progress under the ScaleShift name.
    const storageKey = `scaleshift-${dayIndex}`;
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");

    if (saved && Array.isArray(saved.scores)) {
      scores = saved.scores;
      guesses = saved.guesses || [];
      currentRound = scores.length;
      if (currentRound >= todayData.rounds.length) gameOver = true;
    }

    document.getElementById("day-number").textContent = `Day #${dayIndex + 1}`;
    document.getElementById("streak").textContent = `Streak: ${updateStreak(false)}`;
    updateSoundButton();

    render();
  } catch (err) {
    document.getElementById("game-card").innerHTML = `
      <div class="loading" style="color:var(--danger)">
        Could not load puzzles.json<br>
        Make sure the file is in the same folder.
      </div>`;
    console.error(err);
  }
}

// ===================== UI =====================
const card = document.getElementById("game-card");

const soundToggle = document.getElementById("sound-toggle");
if (soundToggle) {
  soundToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleSound();
  });
}

function render() {
  stopTimer();

  if (gameOver || currentRound >= todayData.rounds.length) {
    showFinalScreen();
    return;
  }

  const round = todayData.rounds[currentRound];
  const question = getQuestion(round);

  card.innerHTML = `
    <div class="progress-dots">
      ${todayData.rounds.map((_, i) =>
        `<div class="dot ${i < currentRound ? "done" : ""} ${i === currentRound ? "current" : ""}"></div>`
      ).join("")}
    </div>

    <div class="round-info">
      <span>Round ${currentRound + 1} / ${todayData.rounds.length}</span>
      <div class="round-actions">
        <span class="score-pill">Score: ${getScoreDisplay()}</span>
        <span class="dimension-pill">${round.dimension}</span>
      </div>
    </div>

    <div class="timer-row">
      <span>TIME</span>
      <strong id="timer">60s</strong>
    </div>
    <div class="timer-track">
      <div class="timer-fill" id="timer-fill"></div>
    </div>

    <div class="question">
      ${question}
    </div>

    <div class="slider-container">
      <input type="range" id="ratio-slider" min="1.1" max="100" step="0.1" value="5">
    </div>

    <div class="guess-display" id="guess-value">5.0×</div>
    <div class="guess-label">Your estimate</div>

    <button class="btn-primary" id="lock-btn">Lock In</button>
  `;

  const slider = document.getElementById("ratio-slider");
  const display = document.getElementById("guess-value");

  const updateSlider = () => {
    const value = parseFloat(slider.value);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const percentage = ((value - min) / (max - min)) * 100;

    slider.style.setProperty("--progress", `${percentage}%`);
    display.textContent = value.toFixed(1) + "×";
  };

  slider.addEventListener("input", () => {
    updateSlider();

    const now = Date.now();
    if (now - lastSliderSound > 140) {
      playSound("slider");
      lastSliderSound = now;
    }
  });
  updateSlider();

  document.getElementById("lock-btn").addEventListener("click", () => {
    submitAnswer(false);
  });

  startTimer();
}

function showRoundResult(guess, round, score, timedOut = false) {
  const color = score >= 80
    ? "var(--success)"
    : score >= 45
      ? "var(--accent)"
      : "var(--danger)";

  const aValue = formatValue(round.aValue, round.unit);
  const bValue = formatValue(round.bValue, round.unit);
  const hasValues = aValue && bValue;
  const verb = getDimensionVerb(round.dimension);

  if (score >= 80) {
    playSound(score === 100 ? "perfect" : "good");
  } else if (score > 0) {
    playSound("neutral");
  }

  const cumulativeScore = getCumulativeScore();
  const cumulativeMax = scores.length * 100;

  card.innerHTML = `
    <div class="result">
      <div class="result-title">${timedOut ? "Time's up!" : "Your guess"}</div>
      <div class="score-big" style="color:${color}">${guess.toFixed(1)}×</div>

      <div class="answer-ratio">
        Actual ratio: <strong>${Number(round.ratio).toFixed(2)}×</strong>
      </div>

      ${hasValues ? `
        <div class="comparison">
          <div class="comparison-item">
            <div class="comparison-name">${round.a}</div>
            <div class="comparison-value">${aValue}</div>
          </div>
          <div class="comparison-divider">VS</div>
          <div class="comparison-item">
            <div class="comparison-name">${round.b}</div>
            <div class="comparison-value">${bValue}</div>
          </div>
        </div>
      ` : ""}

      <div class="result-explanation">
        ${round.a} is <strong>${Number(round.ratio).toFixed(2)}× ${verb}</strong> than ${round.b}.
      </div>

      <div class="points" style="color:${color}">+${score} points</div>
      <div class="round-score">Daily score: <strong>${cumulativeScore} / ${cumulativeMax}</strong></div>

      <button class="btn-primary" id="next-btn">
        ${currentRound + 1 >= todayData.rounds.length ? "See Final Score" : "Next Round"}
      </button>
    </div>
  `;

  document.getElementById("next-btn").addEventListener("click", () => {
    currentRound++;

    if (currentRound >= todayData.rounds.length) {
      gameOver = true;
      updateStreak(true);
      document.getElementById("streak").textContent = `Streak: ${updateStreak(false)}`;
    }

    render();
  });
}

function showFinalScreen() {
  const total = scores.reduce((a, b) => a + b, 0);
  const emoji = total >= 400 ? "🔥" : total >= 300 ? "💪" : total >= 200 ? "👍" : "👀";

  const shareText = `ScaleShift #${dayIndex + 1}
${scores.map(s => s >= 80 ? "🟩" : s >= 45 ? "🟨" : "🟥").join("")}
Score: ${total}/500 ${emoji}`;

  card.innerHTML = `
    <div class="final-screen">
      <div style="font-size:1.1rem; color:var(--muted);">Today's Score</div>
      <div class="final-score">${total}<span style="font-size:1.4rem; color:var(--muted)">/500</span></div>

      <div class="share-box" id="share-text">${shareText}</div>

      <button class="btn-primary" id="copy-btn">Copy Result</button>
    </div>
  `;

  document.getElementById("copy-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(shareText).then(() => {
      const btn = document.getElementById("copy-btn");
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = "Copy Result", 1500);
    });
  });
}

// Start
loadPuzzles();
