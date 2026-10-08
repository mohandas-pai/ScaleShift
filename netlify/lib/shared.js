
const puzzles = require("./puzzle-data");

const EPOCH = Date.UTC(2026, 9, 8);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getBerlinDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
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
    (berlinDateUTC - EPOCH) / MS_PER_DAY
  );
}

function getTodayPuzzle(dayIndex) {
  const index =
    ((dayIndex % puzzles.length) + puzzles.length) %
    puzzles.length;

  return puzzles[index];
}

function getRound(dayIndex, roundIndex) {
  const day = getTodayPuzzle(dayIndex);

  if (!day || !Array.isArray(day.rounds)) {
    return null;
  }

  return day.rounds[roundIndex] || null;
}

function scoreRatio(guess, trueRatio) {
  if (
    !Number.isFinite(guess) ||
    guess <= 0 ||
    !Number.isFinite(trueRatio) ||
    trueRatio <= 0
  ) {
    return 0;
  }

  const error = Math.max(
    guess / trueRatio,
    trueRatio / guess
  );

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

function buildQuestion(round) {
  switch (round.dimension) {
    case "length":
      return `How many times longer is ${round.a} than ${round.b}?`;
    case "height":
      return `How many times taller is ${round.a} than ${round.b}?`;
    case "weight":
      return `How many times heavier is ${round.a} than ${round.b}?`;
    case "wingspan":
      return `How many times wider is ${round.a}'s wingspan than ${round.b}'s?`;
    default:
      return `How many times bigger is ${round.a} than ${round.b}?`;
  }
}

module.exports = {
  puzzles,
  getDayIndex,
  getRound,
  scoreRatio,
  getDimensionVerb,
  buildQuestion
};
