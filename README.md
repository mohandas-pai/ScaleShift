# ScaleShift 2.0

ScaleShift is a daily ratio-estimation game with five rounds per day.

## What's changed

- **October 8–10, 2026 are preserved:** original question order and original scoring curve are retained for those three days.
- **From October 11, 2026:** daily sets are arranged as two more approachable questions, two medium-complexity questions, and one harder question. Difficulty labels are not shown to players.
- **Hard-question reference:** the fifth question shows one object's value as a starting point. The other value and ratio remain hidden until submission.
- **More forgiving scoring:** the new scoring curve applies from October 11 onward.
- **Logarithmic slider:** ratios from 1.1× to 100× are distributed more naturally along the slider.
- **Result breakdown:** the final screen lists every guess, the correct ratio, both values, and the score for each round.
- **Copy & challenge:** the copy button copies the emoji score pattern, total, challenge message, and game link.
- **Audio:** background music has been removed. A short jingle plays when a question appears, alongside the existing sound effects. Sound can be muted.
- **Local preview:** an environment-variable override lets you test a future day locally without changing the deployed date.

## Run locally in VS Code

You need Node.js installed. Open this folder in VS Code, then open **Terminal → New Terminal**.

### 1. Install Netlify CLI (one time)

```bash
npm install -g netlify-cli
```

Check that it is available:

```bash
netlify --version
```

### 2. Start a local server with the Netlify Functions

Run this from the folder containing `netlify.toml`:

```bash
netlify dev
```

Open the local URL printed by the CLI (normally `http://localhost:8888`).

Do **not** open `index.html` directly with `file://`; the game needs the local Netlify Functions to load questions and submit answers.

### 3. Preview the new October 11 experience before deploying

The real current date determines the puzzle by default. To preview Day #4 (October 11) locally, use the commands for your terminal.

**Windows PowerShell:**

```powershell
$env:NETLIFY_LOCAL="true"
$env:SCALESHIFT_PREVIEW_DAY="3"
netlify dev
```

**macOS / Linux:**

```bash
NETLIFY_LOCAL=true SCALESHIFT_PREVIEW_DAY=3 netlify dev
```

`SCALESHIFT_PREVIEW_DAY` is zero-based:
- `0` = October 8 (Day #1; legacy behavior)
- `1` = October 9 (Day #2; legacy behavior)
- `2` = October 10 (Day #3; legacy behavior)
- `3` = October 11 (Day #4; new behavior)
- `4` = October 12 (Day #5; new behavior)

To test another day, stop the server, change the number, and start it again. To test the real date, remove/unset both variables and run `netlify dev`.

**Important:** the preview override only works when `NETLIFY_LOCAL=true`. Do not set that variable in your deployed Netlify environment.

### 4. Test the answer-hiding behavior

Open browser developer tools → Network:
1. Load `/.netlify/functions/get-puzzle?round=4`.
2. Confirm the response includes only the approved hint (on a new-format day), not `ratio`, `aValue`, or `bValue`.
3. Submit a guess and confirm the answer values are returned only by `submit-answer`.

## Daily puzzle and scoring behavior

- Day 1 is October 8, 2026, using the `Europe/Berlin` calendar date.
- The first three daily sets retain their original order and old score curve.
- Starting on Day 4, the current set is sorted heuristically into a daily progression. The labels themselves are never shown.
- New-format scoring thresholds use the multiplicative error between guess and correct ratio:
  - ≤1.05× error: 100
  - ≤1.15×: 90
  - ≤1.30×: 80
  - ≤1.50×: 70
  - ≤2×: 60
  - ≤3×: 45
  - ≤5×: 30
  - ≤10×: 15
  - greater: 0

## Security notes

The public website does not contain a root-level `puzzles.json`. Puzzle data is bundled into Netlify Functions. The initial puzzle endpoint returns only the question and approved hint; the answer is returned after submission.

This hides answers from casual inspection, but is not a complete anti-cheat system. The submission endpoint can still be called manually without authentication or a persistent server-side game session.

## Dataset audit warning

The supplied dataset is retained rather than silently rewriting facts. A basic arithmetic audit found a number of rounds where the stored ratio does not match `aValue / bValue`, and some values appear inconsistent with the named dimension. Those questions need factual review before we can claim all 500 are verified. See `DATA_AUDIT.md` for a generated list of ratio/value mismatches. The first three published daily sets are not changed.

## Deployment

Push the project to your connected GitHub repository and Netlify will deploy it using `netlify.toml`:
- Publish directory: `.`
- Functions directory: `netlify/functions`
- Build command: none

If the GitHub repository is public, make it private or remove old Git history first: previous commits may still contain the original public puzzle data.


## Dynamic slider ranges

For challenges starting on October 11, each question uses a predefined slider maximum selected from 4×, 10×, 20×, 50×, or 100×. The minimum remains 1×, and the logarithmic slider maps its positions to that question's range. The first three published challenges retain their original 1×–100× slider. The scoring function still compares guesses to the true ratio using multiplicative error, so score thresholds are independent of the slider range. The range is intentionally never narrower than 1×–4×.
