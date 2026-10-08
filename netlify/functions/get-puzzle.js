const {
  getDayIndex,
  getRound,
  buildQuestion
} = require("../lib/shared");

exports.handler = async function (event) {
  try {
    const rawRound = event.queryStringParameters?.round ?? "0";
    const roundIndex = Number(rawRound);

    if (
      !Number.isInteger(roundIndex) ||
      roundIndex < 0 ||
      roundIndex > 4
    ) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid round." })
      };
    }

    const dayIndex = Math.max(0, getDayIndex());
    const round = getRound(dayIndex, roundIndex);

    if (!round) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Puzzle not found." })
      };
    }

    // IMPORTANT:
    // This response intentionally does NOT contain:
    // - ratio
    // - aValue
    // - bValue
    //
    // Those stay inside the Netlify function environment.
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      },
      body: JSON.stringify({
        dayIndex,
        roundIndex,
        question: buildQuestion(round),
        round: {
          a: round.a,
          b: round.b,
          dimension: round.dimension,
          unit: round.unit
        }
      })
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Unable to load today's puzzle."
      })
    };
  }
};
