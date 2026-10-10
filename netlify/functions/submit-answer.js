const { getDayIndex, getRound, scoreRatio } = require("../lib/shared");

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json", "Allow": "POST" },
        body: JSON.stringify({ error: "Method not allowed." })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const roundIndex = Number(body.roundIndex);
    const guess = Number(body.guess);

    if (
      !Number.isInteger(roundIndex) || roundIndex < 0 || roundIndex > 4 ||
      !Number.isFinite(guess) || guess < 1.1 || guess > 100
    ) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid answer." })
      };
    }

    // Never trust a day index supplied by the browser.
    const dayIndex = Math.max(0, getDayIndex());
    const round = getRound(dayIndex, roundIndex);
    if (!round) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Puzzle not found." })
      };
    }

    const score = scoreRatio(guess, Number(round.ratio), dayIndex);

    // Answers are returned only after a submission.
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      },
      body: JSON.stringify({
        score,
        ratio: Number(round.ratio),
        aValue: Number(round.aValue),
        bValue: Number(round.bValue),
        unit: round.unit
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unable to submit answer." })
    };
  }
};
