const puzzles = require("./puzzle-data");

const EPOCH = Date.UTC(2026, 9, 8);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// A local-only preview override makes it possible to test future days in VS Code.
// Never set NETLIFY_LOCAL=true in the deployed Netlify environment.
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
  if (process.env.NETLIFY_LOCAL === "true") {
    const previewDay = Number(process.env.SCALESHIFT_PREVIEW_DAY);
    if (
      process.env.SCALESHIFT_PREVIEW_DAY !== undefined &&
      Number.isInteger(previewDay) &&
      previewDay >= 0 &&
      previewDay < puzzles.length
    ) {
      return previewDay;
    }
  }

  const berlin = getBerlinDate(date);
  const berlinDateUTC = Date.UTC(berlin.year, berlin.month - 1, berlin.day);
  return Math.floor((berlinDateUTC - EPOCH) / MS_PER_DAY);
}

const FAMILIAR_TERMS = new Set([
  "human", "adult", "man", "woman", "child", "baby", "person",
  "cat", "dog", "horse", "cow", "pig", "goat", "sheep", "elephant",
  "giraffe", "lion", "tiger", "bear", "monkey", "gorilla", "whale",
  "dolphin", "shark", "crocodile", "snake", "bird", "eagle", "crow",
  "penguin", "butterfly", "car", "vehicle", "truck", "bus", "bicycle",
  "bike", "motorcycle", "van", "train", "plane", "aircraft", "airplane",
  "football", "soccer", "basketball", "tennis", "ball", "house", "building",
  "tree", "sunflower", "bamboo", "table", "chair", "phone", "laptop",
  "bottle", "bag", "cement", "brick", "ship", "boat", "rocket"
]);

function objectFamiliarity(name) {
  const words = String(name).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  let score = 0;
  for (const word of words) {
    if (FAMILIAR_TERMS.has(word)) score += 2;
    else if (["african", "domestic", "adult", "giant", "great", "blue", "common"].includes(word)) score += 0.25;
  }
  // Familiar everyday concepts get a little extra weight.
  if (/\b(car|human|cat|dog|horse|bicycle|bike|bus|football|basketball)\b/i.test(name)) score += 1;
  return Math.min(4, score);
}

function difficultyScore(round) {
  const familiarity = objectFamiliarity(round.a) + objectFamiliarity(round.b);
  const ratio = Number(round.ratio);
  let ratioPenalty = 1;
  if (ratio >= 1.5 && ratio <= 5) ratioPenalty = 0;
  else if (ratio <= 10) ratioPenalty = 1;
  else if (ratio <= 20) ratioPenalty = 2;
  else ratioPenalty = 3;
  // Lower means more intuitive. This is used only to arrange the future daily set.
  return (8 - familiarity) + ratioPenalty;
}

function getDailyRounds(dayIndex) {
  const index = ((dayIndex % puzzles.length) + puzzles.length) % puzzles.length;
  const originalRounds = puzzles[index]?.rounds || [];

  // Preserve the original order and experience for Oct 8, 9, and 10, 2026.
  if (dayIndex < 3) return originalRounds;

  // For future days, arrange each set into two most approachable,
  // two middle-difficulty, and one most challenging comparison.
  return originalRounds
    .map((round, originalIndex) => ({
      round,
      originalIndex,
      difficulty: difficultyScore(round)
    }))
    .sort((a, b) => a.difficulty - b.difficulty || a.originalIndex - b.originalIndex)
    .map(item => item.round);
}

function getRound(dayIndex, roundIndex) {
  const rounds = getDailyRounds(dayIndex);
  return rounds[roundIndex] || null;
}

function getHint(dayIndex, roundIndex, round) {
  // No hints are introduced for the first three published challenges.
  if (dayIndex < 3 || roundIndex !== 4 || !round) return null;

  const aFamiliarity = objectFamiliarity(round.a);
  const bFamiliarity = objectFamiliarity(round.b);

  // Reveal the value of the more familiar object; never the ratio or both values.
  if (aFamiliarity >= bFamiliarity) {
    return { object: round.a, value: Number(round.aValue), unit: round.unit };
  }
  return { object: round.b, value: Number(round.bValue), unit: round.unit };
}

function scoreRatio(guess, trueRatio, dayIndex = 0) {
  if (
    !Number.isFinite(guess) || guess <= 0 ||
    !Number.isFinite(trueRatio) || trueRatio <= 0
  ) return 0;

  const error = Math.max(guess / trueRatio, trueRatio / guess);

  // Original scoring is retained for October 8–10.
  if (dayIndex < 3) {
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

  // More forgiving scoring curve from October 11 onward.
  if (error <= 1.05) return 100;
  if (error <= 1.15) return 90;
  if (error <= 1.30) return 80;
  if (error <= 1.50) return 70;
  if (error <= 2.00) return 60;
  if (error <= 3.00) return 45;
  if (error <= 5.00) return 30;
  if (error <= 10.00) return 15;
  return 0;
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

function buildQuestion(round) {
  switch (round.dimension) {
    case "length": return `How many times longer is ${round.a} than ${round.b}?`;
    case "height": return `How many times taller is ${round.a} than ${round.b}?`;
    case "weight": return `How many times heavier is ${round.a} than ${round.b}?`;
    case "wingspan": return `How many times wider is ${round.a}'s wingspan than ${round.b}'s?`;
    default: return `How many times bigger is ${round.a} than ${round.b}?`;
  }
}

module.exports = {
  puzzles,
  getDayIndex,
  getRound,
  getHint,
  scoreRatio,
  getDimensionVerb,
  buildQuestion
};
