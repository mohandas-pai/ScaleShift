# ScaleShift

ScaleShift is a daily ratio-estimation game with 5 rounds per day.

## Secure puzzle architecture

The public website no longer contains `puzzles.json`.

- `netlify/lib/puzzle-data.js` contains the 100 days / 500 rounds and is bundled into the Netlify Functions.
- `get-puzzle.js` returns only the current round's question and public descriptive fields.
- The correct ratio and measurements are not returned before submission.
- `submit-answer.js` calculates the score on the server and returns the answer only after submission.

This prevents a player from opening `/puzzles.json` and downloading all answers.

## Local development

Install Netlify CLI if needed:

```bash
npm install -g netlify-cli
```

Then from the project folder:

```bash
netlify dev
```

The site and functions will run together locally.

## Deployment

Push the project to GitHub and keep the Netlify site connected to the repository.

The included `netlify.toml` tells Netlify to use:

- Publish directory: `.`
- Functions directory: `netlify/functions`

No build command is required.

## Important limitation

This architecture protects the answers from being downloaded with the initial page/question request.

It does not provide a full anti-cheat/account system. A determined user can still call the submission endpoint manually, because the game currently has no user authentication or server-side persistent game session. For a public casual game, this is a major improvement over shipping `puzzles.json` to every browser.

## Dataset

The original ScaleShift dataset is preserved as supplied:
- 100 daily puzzle sets
- 5 rounds per set
- 500 rounds total
