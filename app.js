// ScaleShift 2.0
// Questions and scoring are served by Netlify Functions so the answer is not
// sent to the browser until the player submits a guess.

const TOTAL_ROUNDS = 5;
const QUESTION_TIME = 45;
const MIN_RATIO = 1.1;
const MAX_RATIO = 100;
const SLIDER_STEPS = 1000;

let dayIndex = 0;
let todayData = null;
let currentRound = 0;
let scores = [];
let guesses = [];
let results = [];
let gameOver = false;
let timerId = null;
let timeLeft = QUESTION_TIME;
let timerEndTime = null;
let lastTimerTick = 0;
let lastSliderSound = 0;
let lastSliderSoundPosition = 0;
let questionJinglePending = false;

const audio = {
  question: new Audio("audio/question-jingle.wav"),
  slider: new Audio("audio/slider.wav"),
  lock: new Audio("audio/lock.wav"),
  good: new Audio("audio/good.wav"),
  perfect: new Audio("audio/perfect.wav"),
  neutral: new Audio("audio/neutral.wav"),
  tick: new Audio("audio/tick.wav"),
  timeout: new Audio("audio/timeout.wav")
};

let soundEnabled = localStorage.getItem("scaleshift-sound") !== "off";

audio.question.preload = "auto";
audio.question.volume = 0.34;
audio.slider.volume = 0.16;
audio.lock.volume = 0.25;
audio.good.volume = 0.28;
audio.perfect.volume = 0.30;
audio.neutral.volume = 0.22;
audio.tick.volume = 0.18;
audio.timeout.volume = 0.25;

function playSound(name) {
  if (!soundEnabled || !audio[name]) return;
  const sound = audio[name];
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function playQuestionJingle() {
  if (!soundEnabled) {
    questionJinglePending = false;
    return;
  }

  audio.question.currentTime = 0;
  audio.question.play()
    .then(() => { questionJinglePending = false; })
    .catch(() => { questionJinglePending = true; });
}

// Browsers may block the first automatic sound until a user gesture.
// If that happens, play the waiting question jingle on the first interaction.
function unlockAudioAndPlayPendingJingle() {
  if (questionJinglePending && soundEnabled) playQuestionJingle();
}
document.addEventListener("pointerdown", unlockAudioAndPlayPendingJingle);
document.addEventListener("keydown", unlockAudioAndPlayPendingJingle);

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("scaleshift-sound", soundEnabled ? "on" : "off");
  if (soundEnabled && questionJinglePending) playQuestionJingle();
  updateSoundButton();
}

function updateSoundButton() {
  const button = document.getElementById("sound-toggle");
  if (!button) return;
  button.textContent = soundEnabled ? "🔊" : "🔇";
  button.setAttribute("aria-label", soundEnabled ? "Mute sound" : "Enable sound");
  button.title = soundEnabled ? "Mute sound effects" : "Enable sound effects";
}

function getStorageKey() {
  return `scaleshift-${dayIndex}`;
}

function getTimerKey() {
  return `scaleshift-timer-${dayIndex}-${currentRound}`;
}

function getCumulativeScore() {
  return scores.reduce((sum, score) => sum + Number(score || 0), 0);
}

function getScoreDisplay() {
  // Include the current round in the denominator: 0/100, then 45/200, etc.
  return `${getCumulativeScore()} / ${Math.min(TOTAL_ROUNDS, currentRound + 1) * 100}`;
}

function formatNumber(value, maximumFractionDigits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits });
}

function formatRatio(value) {
  return `${formatNumber(value, 2)}×`;
}

function formatValue(value, unit) {
  if (value === undefined || value === null || !Number.isFinite(Number(value))) return "—";
  return `${formatNumber(value, 2)} ${unit || ""}`.trim();
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

function getScoreColor(score) {
  if (score >= 80) return "var(--success)";
  if (score >= 45) return "var(--accent)";
  return "var(--danger)";
}

function getScoreEmoji(score) {
  return score >= 80 ? "🟩" : score >= 45 ? "🟨" : "🟥";
}

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

function getClientDayIndex(date = new Date()) {
  const berlin = getBerlinDate(date);
  const berlinUTC = Date.UTC(berlin.year, berlin.month - 1, berlin.day);
  return Math.floor((berlinUTC - Date.UTC(2026, 9, 8)) / 86400000);
}

function startTimer() {
  clearInterval(timerId);
  const key = getTimerKey();
  const savedDeadline = localStorage.getItem(key);

  if (savedDeadline !== null && Number.isFinite(Number(savedDeadline))) {
    timerEndTime = Number(savedDeadline);
  } else {
    timerEndTime = Date.now() + QUESTION_TIME * 1000;
    localStorage.setItem(key, String(timerEndTime));
  }

  lastTimerTick = 0;
  timeLeft = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
  updateTimerUI();

  if (timeLeft <= 0) {
    playSound("timeout");
    setTimeout(() => submitAnswer(true), 0);
    return;
  }

  timerId = setInterval(() => {
    timeLeft = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
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
  }, 250);
}

function stopTimer(clearSavedTimer = false) {
  clearInterval(timerId);
  timerId = null;
  if (clearSavedTimer) localStorage.removeItem(getTimerKey());
}

function updateTimerUI() {
  const timer = document.getElementById("timer");
  const fill = document.getElementById("timer-fill");
  if (!timer || !fill) return;
  timer.textContent = `${timeLeft}s`;
  fill.style.width = `${Math.max(0, (timeLeft / QUESTION_TIME) * 100)}%`;
  timer.classList.toggle("warning", timeLeft <= 15);
  timer.classList.toggle("danger", timeLeft <= 5);
}

async function fetchRound(roundIndex) {
  const response = await fetch(`/.netlify/functions/get-puzzle?round=${roundIndex}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to load today's puzzle.");
  return data;
}

async function submitToServer(roundIndex, guess) {
  const response = await fetch("/.netlify/functions/submit-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ roundIndex, guess })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to submit answer.");
  return data;
}

function saveProgress() {
  localStorage.setItem(getStorageKey(), JSON.stringify({ scores, guesses, results }));
}

function updateStreak(finishedToday) {
  const streakKey = "scaleshift-streak";
  const lastDayKey = "scaleshift-lastDay";
  let streak = parseInt(localStorage.getItem(streakKey) || "0", 10);
  const lastDay = parseInt(localStorage.getItem(lastDayKey) || "-999", 10);

  if (finishedToday) {
    if (lastDay === dayIndex - 1) streak += 1;
    else if (lastDay !== dayIndex) streak = 1;
    localStorage.setItem(streakKey, String(streak));
    localStorage.setItem(lastDayKey, String(dayIndex));
  }
  return streak;
}

async function restoreProgress() {
  const saved = JSON.parse(localStorage.getItem(getStorageKey()) || "null");
  if (!saved || !Array.isArray(saved.scores)) return;

  scores = saved.scores.map(Number);
  guesses = Array.isArray(saved.guesses) ? saved.guesses.map(Number) : [];
  results = Array.isArray(saved.results) ? saved.results : [];
  currentRound = scores.length;

  // Older saved games only stored guesses and scores. Rebuild the review details
  // from the server for already-submitted guesses, without changing stored scores.
  for (let i = 0; i < scores.length && i < TOTAL_ROUNDS; i++) {
    if (results[i]?.ratio !== undefined) continue;
    if (!Number.isFinite(guesses[i])) continue;

    try {
      const [roundData, answer] = await Promise.all([
        fetchRound(i),
        submitToServer(i, guesses[i])
      ]);
      results[i] = {
        ...roundData.round,
        question: roundData.question,
        guess: guesses[i],
        score: scores[i],
        ratio: Number(answer.ratio),
        aValue: Number(answer.aValue),
        bValue: Number(answer.bValue),
        unit: answer.unit,
        timedOut: false
      };
    } catch (error) {
      console.warn("Could not restore one older round's details.", error);
    }
  }
  saveProgress();
}

async function loadGame() {
  try {
    updateSoundButton();

    // Ask the server first. This also makes local preview-day testing work.
    const firstRound = await fetchRound(0);
    dayIndex = Math.max(0, Number(firstRound.dayIndex));
    await restoreProgress();

    document.getElementById("day-number").textContent = `Day #${dayIndex + 1}`;
    document.getElementById("streak").textContent = `Streak: ${updateStreak(false)}`;

    if (currentRound >= TOTAL_ROUNDS) {
      gameOver = true;
      showFinalScreen();
      return;
    }

    const data = currentRound === 0 ? firstRound : await fetchRound(currentRound);
    todayData = { ...data.round, question: data.question };
    render();
  } catch (error) {
    console.error(error);
    card.innerHTML = `
      <div class="loading error-message">
        Could not load today's puzzle.<br>
        Please check your connection and try again.
        <button class="btn-secondary" id="retry-load">Try again</button>
      </div>`;
    document.getElementById("retry-load")?.addEventListener("click", loadGame);
  }
}

const card = document.getElementById("game-card");
document.getElementById("sound-toggle")?.addEventListener("click", event => {
  event.stopPropagation();
  toggleSound();
});

function ratioToSliderPosition(ratio) {
  const bounded = Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
  return Math.round(Math.log(bounded / MIN_RATIO) / Math.log(MAX_RATIO / MIN_RATIO) * SLIDER_STEPS);
}

function sliderPositionToRatio(position) {
  const fraction = Number(position) / SLIDER_STEPS;
  return MIN_RATIO * Math.pow(MAX_RATIO / MIN_RATIO, fraction);
}

function render() {
  stopTimer();

  if (gameOver || currentRound >= TOTAL_ROUNDS) {
    showFinalScreen();
    return;
  }

  const round = todayData;
  const hintMarkup = round.hint
    ? `<div class="hint-box">
         <div class="hint-label">REFERENCE VALUE</div>
         <div class="hint-object">${round.hint.object}</div>
         <div class="hint-value">${formatValue(round.hint.value, round.hint.unit)}</div>
       </div>`
    : "";

  card.innerHTML = `
    <div class="progress-dots" aria-label="Round progress">
      ${Array.from({ length: TOTAL_ROUNDS }, (_, i) =>
      `<div class="dot ${i < currentRound ? "done" : ""} ${i === currentRound ? "current" : ""}"></div>`
      ).join("")}
    </div>

    <div class="round-info">
      <span>Round ${currentRound + 1} / ${TOTAL_ROUNDS}</span>
      <div class="round-actions">
        <span class="score-pill">Score: ${getScoreDisplay()}</span>
        <span class="dimension-pill">${round.dimension}</span>
      </div>
    </div>

    <div class="timer-row"><span>TIME</span><strong id="timer">${QUESTION_TIME}s</strong></div>
    <div class="timer-track"><div class="timer-fill" id="timer-fill"></div></div>

    <div class="question">${round.question}</div>
    ${hintMarkup}

    <div class="slider-container">
      <input type="range" id="ratio-slider" min="0" max="${SLIDER_STEPS}" step="1"
        value="${ratioToSliderPosition(5)}" aria-label="Your ratio estimate">
      <div class="slider-markers" aria-hidden="true">
        <span>1.1×</span><span>2×</span><span>5×</span><span>10×</span><span>20×</span><span>50×</span><span>100×</span>
      </div>
    </div>

    <div class="guess-display" id="guess-value">5.0×</div>
    <div class="guess-label">Your estimate</div>
    <button class="btn-primary" id="lock-btn">Lock In</button>
  `;

  const slider = document.getElementById("ratio-slider");
  const display = document.getElementById("guess-value");

  const updateSlider = () => {
    const position = Number(slider.value);
    const ratio = sliderPositionToRatio(position);
    const percentage = (position / SLIDER_STEPS) * 100;
    slider.style.setProperty("--progress", `${percentage}%`);
    display.textContent = `${ratio.toFixed(1)}×`;

    // Avoid repeatedly restarting an audio file while the user drags.
    const now = Date.now();
    if (Math.abs(position - lastSliderSoundPosition) >= 35 && now - lastSliderSound >= 280) {
      playSound("slider");
      lastSliderSound = now;
      lastSliderSoundPosition = position;
    }
  };

  slider.addEventListener("input", updateSlider);
  updateSlider();

  document.getElementById("lock-btn").addEventListener("click", () => submitAnswer(false));
  playQuestionJingle();
  startTimer();
}

async function submitAnswer(timedOut = false) {
  if (gameOver) return;
  const lockBtn = document.getElementById("lock-btn");
  if (!lockBtn || lockBtn.disabled) return;

  lockBtn.disabled = true;
  stopTimer(true);
  if (!timedOut) playSound("lock");

  const slider = document.getElementById("ratio-slider");
  const guess = sliderPositionToRatio(Number(slider.value));

  try {
    const answer = await submitToServer(currentRound, guess);
    const score = Number(answer.score);
    scores[currentRound] = score;
    guesses[currentRound] = guess;

    const resultRound = {
      ...todayData,
      guess,
      score,
      ratio: Number(answer.ratio),
      aValue: Number(answer.aValue),
      bValue: Number(answer.bValue),
      unit: answer.unit,
      timedOut
    };
    results[currentRound] = resultRound;
    saveProgress();
    showRoundResult(resultRound);
  } catch (error) {
    console.error(error);
    lockBtn.disabled = false;
    alert("Could not submit your answer. Please try again.");
  }
}

function showRoundResult(round) {
  const score = Number(round.score);
  const color = getScoreColor(score);
  if (score >= 80) playSound(score === 100 ? "perfect" : "good");
  else if (score > 0) playSound("neutral");

  const cumulativeScore = getCumulativeScore();
  const cumulativeMax = scores.length * 100;
  const difference = Math.max(round.guess / round.ratio, round.ratio / round.guess);
  let accuracyText = "Great estimate!";
  if (difference > 1.5) accuracyText = "There was quite a gap between your estimate and the answer.";
  else if (difference > 1.15) accuracyText = "You were in the right ballpark, but there was room to improve.";

  card.innerHTML = `
    <div class="result">
      <div class="result-title">${round.timedOut ? "Time's up — here's the answer" : "Your estimate"}</div>
      <div class="score-big" style="color:${color}">${formatRatio(round.guess)}</div>
      <div class="answer-ratio">Correct ratio: <strong>${formatRatio(round.ratio)}</strong></div>

      <div class="comparison">
        <div class="comparison-item">
          <div class="comparison-name">${round.a}</div>
          <div class="comparison-value">${formatValue(round.aValue, round.unit)}</div>
        </div>
        <div class="comparison-divider">VS</div>
        <div class="comparison-item">
          <div class="comparison-name">${round.b}</div>
          <div class="comparison-value">${formatValue(round.bValue, round.unit)}</div>
        </div>
      </div>

      <div class="result-explanation">
        ${round.a} is <strong>${formatRatio(round.ratio)} ${getDimensionVerb(round.dimension)}</strong> than ${round.b}.
        <div class="accuracy-note">${accuracyText}</div>
      </div>

      <div class="points" style="color:${color}">${score} / 100 points</div>
      <div class="round-score">Daily score: <strong>${cumulativeScore} / ${cumulativeMax}</strong></div>

      <button class="btn-primary" id="next-btn">
        ${currentRound + 1 >= TOTAL_ROUNDS ? "See Final Results" : "Next Question"}
      </button>
    </div>
  `;

  document.getElementById("next-btn").addEventListener("click", async () => {
    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) {
      gameOver = true;
      updateStreak(true);
      document.getElementById("streak").textContent = `Streak: ${updateStreak(false)}`;
      showFinalScreen();
      return;
    }

    try {
      const data = await fetchRound(currentRound);
      dayIndex = Math.max(0, Number(data.dayIndex));
      todayData = { ...data.round, question: data.question };
      document.getElementById("day-number").textContent = `Day #${dayIndex + 1}`;
      saveProgress();
      render();
    } catch (error) {
      console.error(error);
      card.innerHTML = `
        <div class="loading error-message">
          Could not load the next question.<br>Please refresh and try again.
          <button class="btn-secondary" id="retry-next">Try again</button>
        </div>`;
      document.getElementById("retry-next")?.addEventListener("click", async () => {
        try {
          const data = await fetchRound(currentRound);
          todayData = { ...data.round, question: data.question };
          render();
        } catch (retryError) {
          alert("Still unable to load the next question. Please try again.");
        }
      });
    }
  });
}

function makeShareText(total) {
  const emojiLine = scores.slice(0, TOTAL_ROUNDS).map(getScoreEmoji).join("");
  const resultEmoji = total >= 400 ? "🔥" : total >= 300 ? "💪" : total >= 200 ? "👍" : "👀";
  return `I challenge you to today's ScaleShift!\n\nScaleShift #${dayIndex + 1}\n${emojiLine}\nScore: ${total}/500 ${resultEmoji}\nCan you beat my score?\nhttps://playscaleshift.netlify.app`;
}

function renderFinalResultCard(result, index) {
  if (!result || result.ratio === undefined) {
    return `<article class="final-round">
      <div class="final-round-heading">Round ${index + 1}</div>
      <div class="final-question">Result details unavailable for this round.</div>
      <div class="final-round-score">${Number(scores[index] || 0)} / 100</div>
    </article>`;
  }

  return `<article class="final-round">
    <div class="final-round-heading">Round ${index + 1}</div>
    <div class="final-question">${result.question || `${result.a} vs. ${result.b}`}</div>
    <div class="final-guess-row"><span>Your guess</span><strong>${formatRatio(result.guess)}</strong></div>
    <div class="final-guess-row"><span>Correct answer</span><strong>${formatRatio(result.ratio)}</strong></div>
    <div class="final-values">${result.a}: <strong>${formatValue(result.aValue, result.unit)}</strong>
      <span class="final-vs">·</span> ${result.b}: <strong>${formatValue(result.bValue, result.unit)}</strong>
    </div>
    <div class="final-round-score" style="color:${getScoreColor(Number(result.score))}">${Number(result.score)} / 100 points</div>
  </article>`;
}

function showFinalScreen() {
  stopTimer();
  const total = getCumulativeScore();
  const shareText = makeShareText(total);

  card.innerHTML = `
    <div class="final-screen">
      <div class="result-title">ScaleShift #${dayIndex + 1}</div>
      <div class="final-score">${total}<span class="final-denominator">/500</span></div>
      <div class="final-intro">Your five-round breakdown</div>
      <div class="final-rounds">
        ${Array.from({ length: TOTAL_ROUNDS }, (_, i) => renderFinalResultCard(results[i], i)).join("")}
      </div>
      <div class="share-heading">Challenge your friends</div>
      <div class="share-box" id="share-text"></div>
      <button class="btn-primary" id="copy-btn">📋 Copy Results &amp; Challenge Friends</button>
      <div class="copy-status" id="copy-status" role="status" aria-live="polite"></div>
    </div>
  `;

  document.getElementById("share-text").textContent = shareText;
  document.getElementById("copy-btn").addEventListener("click", async () => {
    const button = document.getElementById("copy-btn");
    const status = document.getElementById("copy-status");
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareText;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand("copy");
        textArea.remove();
        if (!copied) throw new Error("Clipboard copy failed");
      }
      button.textContent = "✓ Copied to clipboard!";
      status.textContent = "Ready to paste into WhatsApp, Discord, or anywhere else.";
      setTimeout(() => { button.textContent = "📋 Copy Results & Challenge Friends"; }, 1800);
    } catch (error) {
      console.error(error);
      status.textContent = "Copy was blocked by the browser. Select and copy the text above.";
    }
  });
}

loadGame();
