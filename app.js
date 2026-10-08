// ScaleShift
// The correct answers are no longer downloaded to the browser.
// Questions come from a Netlify Function and scoring happens server-side.

const EPOCH = Date.UTC(2026, 9, 8);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

let dayIndex = 0;
let todayData = null;
let currentRound = 0;
let scores = [];
let guesses = [];
let gameOver = false;

let timerId = null;
let timeLeft = 45;
let timerEndTime = null;

const QUESTION_TIME = 45;
const TOTAL_ROUNDS = 5;

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

let soundEnabled =
  localStorage.getItem("scaleshift-sound") !== "off";

let lastSliderSound = 0;
let lastTimerTick = 0;

audio.ambient.loop = true;
audio.ambient.preload = "auto";
audio.ambient.volume = 0.40;

audio.slider.volume = 0.25;
audio.lock.volume = 0.30;
audio.good.volume = 0.30;
audio.perfect.volume = 0.32;
audio.neutral.volume = 0.26;
audio.tick.volume = 0.22;
audio.timeout.volume = 0.30;

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

  localStorage.setItem(
    "scaleshift-sound",
    soundEnabled ? "on" : "off"
  );

  if (soundEnabled) {
    startAmbient();
  } else {
    stopAmbient();
  }

  updateSoundButton();
}

function updateSoundButton() {
  const button =
    document.getElementById("sound-toggle");

  if (!button) return;

  button.textContent =
    soundEnabled ? "🔊" : "🔇";

  button.setAttribute(
    "aria-label",
    soundEnabled
      ? "Mute sound"
      : "Enable sound"
  );

  button.title =
    soundEnabled
      ? "Mute sound"
      : "Enable sound";
}

// Browsers require a user gesture before audio can play.
document.addEventListener(
  "pointerdown",
  startAmbient,
  { once: true }
);

// ===================== DATE =====================
function getBerlinDate(date = new Date()) {
  const parts =
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] =
        Number(part.value);
    }
  }

  return {
    year: values.year,
    month: values.month,
    day: values.day
  };
}

function getDayIndex(date = new Date()) {
  const berlin = getBerlinDate(date);

  const berlinDateUTC = Date.UTC(
    berlin.year,
    berlin.month - 1,
    berlin.day
  );

  return Math.floor(
    (berlinDateUTC - EPOCH) /
      MS_PER_DAY
  );
}

// ===================== SCORE DISPLAY =====================
function getCumulativeScore() {
  return scores.reduce(
    (sum, score) => sum + score,
    0
  );
}

function getScoreDisplay() {
  const completedRounds =
    scores.length;

  const denominator =
    Math.max(1, completedRounds) * 100;

  return `${getCumulativeScore()} / ${denominator}`;
}

// ===================== FORMATTERS =====================
function formatValue(value, unit) {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(Number(value))
  ) {
    return null;
  }

  const n = Number(value);

  if (Number.isInteger(n)) {
    return `${n.toLocaleString()} ${unit}`;
  }

  return `${n.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2
    }
  )} ${unit}`;
}

function getDimensionVerb(dimension) {
  switch (dimension) {
    case "length":
      return "longer";

    case "height":
      return "taller";

    case "weight":
      return "heavier";

    case "wingspan":
      return "wider";

    default:
      return "larger";
  }
}

// ===================== TIMER =====================
function getTimerKey() {
  return `scaleshift-timer-${dayIndex}-${currentRound}`;
}

function startTimer() {
  clearInterval(timerId);

  const timerKey = getTimerKey();

  const storedValue =
    localStorage.getItem(timerKey);

  if (storedValue !== null) {
    const savedEndTime =
      Number(storedValue);

    if (Number.isFinite(savedEndTime)) {
      // Even if expired, keep the old deadline.
      // This prevents refresh from creating a new 45 seconds.
      timerEndTime = savedEndTime;
    } else {
      timerEndTime =
        Date.now() +
        QUESTION_TIME * 1000;

      localStorage.setItem(
        timerKey,
        String(timerEndTime)
      );
    }
  } else {
    timerEndTime =
      Date.now() +
      QUESTION_TIME * 1000;

    localStorage.setItem(
      timerKey,
      String(timerEndTime)
    );
  }

  lastTimerTick = 0;

  timeLeft = Math.max(
    0,
    Math.ceil(
      (timerEndTime - Date.now()) /
        1000
    )
  );

  updateTimerUI();

  if (timeLeft <= 0) {
    localStorage.removeItem(timerKey);
    playSound("timeout");

    setTimeout(
      () => submitAnswer(true),
      0
    );

    return;
  }

  timerId = setInterval(() => {
    timeLeft = Math.max(
      0,
      Math.ceil(
        (timerEndTime - Date.now()) /
          1000
      )
    );

    updateTimerUI();

    if (
      timeLeft <= 5 &&
      timeLeft > 0 &&
      timeLeft !== lastTimerTick
    ) {
      lastTimerTick = timeLeft;
      playSound("tick");
    }

    if (timeLeft <= 0) {
      clearInterval(timerId);
      timerId = null;

      localStorage.removeItem(
        timerKey
      );

      playSound("timeout");
      submitAnswer(true);
    }
  }, 250);
}

function stopTimer(
  clearSavedTimer = false
) {
  clearInterval(timerId);
  timerId = null;

  if (clearSavedTimer) {
    localStorage.removeItem(
      getTimerKey()
    );
  }
}

function updateTimerUI() {
  const timer =
    document.getElementById("timer");

  const timerFill =
    document.getElementById(
      "timer-fill"
    );

  if (!timer || !timerFill) return;

  timer.textContent =
    `${timeLeft}s`;

  const percentage =
    Math.max(
      0,
      (timeLeft / QUESTION_TIME) *
        100
    );

  timerFill.style.width =
    `${percentage}%`;

  timer.classList.toggle(
    "warning",
    timeLeft <= 15
  );

  timer.classList.toggle(
    "danger",
    timeLeft <= 5
  );
}

// ===================== SERVER API =====================
async function fetchRound(roundIndex) {
  const response =
    await fetch(
      `/.netlify/functions/get-puzzle?round=${roundIndex}`,
      {
        cache: "no-store"
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to load today's puzzle."
    );
  }

  return response.json();
}

async function submitToServer(
  roundIndex,
  guess
) {
  const response =
    await fetch(
      "/.netlify/functions/submit-answer",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        cache: "no-store",
        body: JSON.stringify({
          roundIndex,
          guess
        })
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Failed to submit answer."
    );
  }

  return data;
}

// ===================== STREAK =====================
function updateStreak(
  finishedToday
) {
  const streakKey =
    "scaleshift-streak";

  const lastDayKey =
    "scaleshift-lastDay";

  let streak =
    parseInt(
      localStorage.getItem(
        streakKey
      ) || "0",
      10
    );

  const lastDay =
    parseInt(
      localStorage.getItem(
        lastDayKey
      ) || "-999",
      10
    );

  if (finishedToday) {
    if (
      lastDay ===
      dayIndex - 1
    ) {
      streak += 1;
    } else if (
      lastDay !== dayIndex
    ) {
      streak = 1;
    }

    localStorage.setItem(
      streakKey,
      String(streak)
    );

    localStorage.setItem(
      lastDayKey,
      String(dayIndex)
    );
  }

  return streak;
}

// ===================== LOAD GAME =====================
async function loadGame() {
  try {
    updateSoundButton();

    // We use the Berlin date only to locate today's
    // local progress. The server remains authoritative
    // about which puzzle is actually today's puzzle.
    dayIndex = Math.max(
      0,
      getDayIndex()
    );

    const storageKey =
      `scaleshift-${dayIndex}`;

    const saved =
      JSON.parse(
        localStorage.getItem(
          storageKey
        ) || "null"
      );

    if (
      saved &&
      Array.isArray(
        saved.scores
      )
    ) {
      scores =
        saved.scores;

      guesses =
        Array.isArray(
          saved.guesses
        )
          ? saved.guesses
          : [];

      currentRound =
        scores.length;
    }

    document.getElementById(
      "streak"
    ).textContent =
      `Streak: ${updateStreak(false)}`;

    // Five rounds completed.
    if (
      currentRound >=
      TOTAL_ROUNDS
    ) {
      gameOver = true;

      document.getElementById(
        "day-number"
      ).textContent =
        `Day #${dayIndex + 1}`;

      showFinalScreen();
      return;
    }

    // Ask the server only for the current round.
    const data =
      await fetchRound(
        currentRound
      );

    // Use the server's date index.
    dayIndex =
      Math.max(
        0,
        Number(data.dayIndex)
      );

    todayData = {
      ...data.round,
      question:
        data.question
    };

    document.getElementById(
      "day-number"
    ).textContent =
      `Day #${dayIndex + 1}`;

    render();
  } catch (error) {
    console.error(error);

    document.getElementById(
      "game-card"
    ).innerHTML = `
      <div
        class="loading"
        style="color:var(--danger)"
      >
        Could not load today's puzzle.<br>
        Please check your connection
        and try again.
      </div>
    `;
  }
}

// ===================== UI =====================
const card =
  document.getElementById(
    "game-card"
  );

const soundToggle =
  document.getElementById(
    "sound-toggle"
  );

if (soundToggle) {
  soundToggle.addEventListener(
    "click",
    event => {
      event.stopPropagation();
      toggleSound();
    }
  );
}

function render() {
  stopTimer();

  if (
    gameOver ||
    currentRound >=
      TOTAL_ROUNDS
  ) {
    showFinalScreen();
    return;
  }

  const round =
    todayData;

  card.innerHTML = `
    <div class="progress-dots">
      ${Array.from(
        { length: TOTAL_ROUNDS },
        (_, i) =>
          `<div class="dot ${
            i < currentRound
              ? "done"
              : ""
          } ${
            i === currentRound
              ? "current"
              : ""
          }"></div>`
      ).join("")}
    </div>

    <div class="round-info">
      <span>
        Round ${currentRound + 1} /
        ${TOTAL_ROUNDS}
      </span>

      <div class="round-actions">
        <span class="score-pill">
          Score: ${getScoreDisplay()}
        </span>

        <span class="dimension-pill">
          ${round.dimension}
        </span>
      </div>
    </div>

    <div class="timer-row">
      <span>TIME</span>
      <strong id="timer">45s</strong>
    </div>

    <div class="timer-track">
      <div
        class="timer-fill"
        id="timer-fill"
      ></div>
    </div>

    <div class="question">
      ${round.question}
    </div>

    <div class="slider-container">
      <input
        type="range"
        id="ratio-slider"
        min="1.1"
        max="100"
        step="0.1"
        value="5"
        aria-label="Your ratio estimate"
      >
    </div>

    <div
      class="guess-display"
      id="guess-value"
    >
      5.0×
    </div>

    <div class="guess-label">
      Your estimate
    </div>

    <button
      class="btn-primary"
      id="lock-btn"
    >
      Lock In
    </button>
  `;

  const slider =
    document.getElementById(
      "ratio-slider"
    );

  const display =
    document.getElementById(
      "guess-value"
    );

  const updateSlider = () => {
    const value =
      parseFloat(
        slider.value
      );

    const min =
      parseFloat(
        slider.min
      );

    const max =
      parseFloat(
        slider.max
      );

    const percentage =
      ((value - min) /
        (max - min)) *
      100;

    slider.style.setProperty(
      "--progress",
      `${percentage}%`
    );

    display.textContent =
      value.toFixed(1) + "×";
  };

  slider.addEventListener(
    "input",
    () => {
      updateSlider();

      const now =
        Date.now();

      if (
        now -
          lastSliderSound >
        140
      ) {
        playSound("slider");
        lastSliderSound =
          now;
      }
    }
  );

  updateSlider();

  document
    .getElementById(
      "lock-btn"
    )
    .addEventListener(
      "click",
      () => {
        submitAnswer(false);
      }
    );

  startTimer();
}

// ===================== SUBMIT =====================
async function submitAnswer(
  timedOut = false
) {
  if (gameOver) return;

  const lockBtn =
    document.getElementById(
      "lock-btn"
    );

  if (
    !lockBtn ||
    lockBtn.disabled
  ) {
    return;
  }

  lockBtn.disabled = true;

  stopTimer(true);

  if (!timedOut) {
    playSound("lock");
  }

  const slider =
    document.getElementById(
      "ratio-slider"
    );

  const guess =
    parseFloat(
      slider.value
    );

  try {
    const result =
      await submitToServer(
        currentRound,
        guess
      );

    scores.push(
      Number(result.score)
    );

    guesses.push(
      guess
    );

    localStorage.setItem(
      `scaleshift-${dayIndex}`,
      JSON.stringify({
        scores,
        guesses
      })
    );

    // Only now do we receive the actual answer.
    const resultRound = {
      ...todayData,
      ratio:
        Number(result.ratio),
      aValue:
        Number(result.aValue),
      bValue:
        Number(result.bValue),
      unit:
        result.unit
    };

    showRoundResult(
      guess,
      resultRound,
      Number(result.score),
      timedOut
    );
  } catch (error) {
    console.error(error);

    lockBtn.disabled = false;

    alert(
      "Could not submit your answer. Please try again."
    );
  }
}

// ===================== RESULT =====================
function showRoundResult(
  guess,
  round,
  score,
  timedOut = false
) {
  const color =
    score >= 80
      ? "var(--success)"
      : score >= 45
        ? "var(--accent)"
        : "var(--danger)";

  const aValue =
    formatValue(
      round.aValue,
      round.unit
    );

  const bValue =
    formatValue(
      round.bValue,
      round.unit
    );

  const hasValues =
    aValue && bValue;

  const verb =
    getDimensionVerb(
      round.dimension
    );

  if (score >= 80) {
    playSound(
      score === 100
        ? "perfect"
        : "good"
    );
  } else if (score > 0) {
    playSound("neutral");
  }

  const cumulativeScore =
    getCumulativeScore();

  const cumulativeMax =
    scores.length * 100;

  card.innerHTML = `
    <div class="result">

      <div class="result-title">
        ${
          timedOut
            ? "Time's up!"
            : "Your guess"
        }
      </div>

      <div
        class="score-big"
        style="color:${color}"
      >
        ${guess.toFixed(1)}×
      </div>

      <div class="answer-ratio">
        Actual ratio:
        <strong>
          ${Number(
            round.ratio
          ).toFixed(2)}×
        </strong>
      </div>

      ${
        hasValues
          ? `
            <div class="comparison">

              <div class="comparison-item">
                <div class="comparison-name">
                  ${round.a}
                </div>

                <div class="comparison-value">
                  ${aValue}
                </div>
              </div>

              <div class="comparison-divider">
                VS
              </div>

              <div class="comparison-item">
                <div class="comparison-name">
                  ${round.b}
                </div>

                <div class="comparison-value">
                  ${bValue}
                </div>
              </div>

            </div>
          `
          : ""
      }

      <div class="result-explanation">
        ${round.a} is
        <strong>
          ${Number(
            round.ratio
          ).toFixed(2)}×
          ${verb}
        </strong>
        than ${round.b}.
      </div>

      <div
        class="points"
        style="color:${color}"
      >
        +${score} points
      </div>

      <div class="round-score">
        Daily score:
        <strong>
          ${cumulativeScore} /
          ${cumulativeMax}
        </strong>
      </div>

      <button
        class="btn-primary"
        id="next-btn"
      >
        ${
          currentRound + 1 >=
          TOTAL_ROUNDS
            ? "See Final Score"
            : "Next Round"
        }
      </button>

    </div>
  `;

  document
    .getElementById(
      "next-btn"
    )
    .addEventListener(
      "click",
      async () => {
        currentRound++;

        if (
          currentRound >=
          TOTAL_ROUNDS
        ) {
          gameOver = true;

          updateStreak(true);

          document.getElementById(
            "streak"
          ).textContent =
            `Streak: ${updateStreak(false)}`;

          showFinalScreen();
          return;
        }

        // Load only the next question.
        try {
          const data =
            await fetchRound(
              currentRound
            );

          dayIndex =
            Math.max(
              0,
              Number(data.dayIndex)
            );

          todayData = {
            ...data.round,
            question:
              data.question
          };

          render();
        } catch (error) {
          console.error(error);

          card.innerHTML = `
            <div
              class="loading"
              style="color:var(--danger)"
            >
              Could not load the next round.<br>
              Please refresh and try again.
            </div>
          `;
        }
      }
    );
}

// ===================== FINAL SCREEN =====================
function showFinalScreen() {
  stopTimer();

  const total =
    scores.reduce(
      (a, b) => a + b,
      0
    );

  const emoji =
    total >= 400
      ? "🔥"
      : total >= 300
        ? "💪"
        : total >= 200
          ? "👍"
          : "👀";

  const shareText =
`I challenge you to today's ScaleShift!

ScaleShift #${dayIndex + 1}
${scores.map(
  s =>
    s >= 80
      ? "🟩"
      : s >= 45
        ? "🟨"
        : "🟥"
).join("")}
Score: ${total}/500 ${emoji}
Can you beat my score?
https://playscaleshift.netlify.app`;

  card.innerHTML = `
    <div class="final-screen">

      <div
        style="
          font-size:1.1rem;
          color:var(--muted);
        "
      >
        Today's Score
      </div>

      <div class="final-score">
        ${total}
        <span
          style="
            font-size:1.4rem;
            color:var(--muted)
          "
        >
          /500
        </span>
      </div>

      <div
        class="share-box"
        id="share-text"
      >
        ${shareText}
      </div>

      <button
        class="btn-primary"
        id="copy-btn"
      >
        Copy Result
      </button>

    </div>
  `;

  document
    .getElementById(
      "copy-btn"
    )
    .addEventListener(
      "click",
      async () => {
        try {
          await navigator.clipboard
            .writeText(
              shareText
            );

          const btn =
            document.getElementById(
              "copy-btn"
            );

          btn.textContent =
            "Copied!";

          setTimeout(
            () => {
              btn.textContent =
                "Copy Result";
            },
            1500
          );
        } catch (error) {
          console.error(error);
        }
      }
    );
}

// ===================== START =====================
loadGame();
