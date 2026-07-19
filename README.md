# The Signal Desk — Fake News Detection Demo

Paste a headline or article and get a verdict (VERIFIED / FLAGGED / UNVERIFIED),
a confidence score, and a 5-point signal breakdown explaining why.

## How it's built

- `src/App.jsx` — the React frontend (Vite)
- `api/analyze.js` — a serverless function that calls the Claude API. Your API
  key lives here, on the server, and is never sent to the browser.

## 1. Get an API key

Sign up at [console.anthropic.com](https://console.anthropic.com), create an
API key, and keep it somewhere safe. Don't paste it into any file in this repo.

## 2. Push this project to GitHub

```bash
cd signal-desk
git init
git add .
git commit -m "Initial commit: Signal Desk fake news detector"
git branch -M main
git remote add origin https://github.com/<your-username>/signal-desk.git
git push -u origin main
```

(Create the empty repo on GitHub first — github.com → New repository — then
copy its URL into the `git remote add` command above.)

## 3. Deploy with Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up/log in with your GitHub
   account.
2. Click **Add New → Project**, and select your `signal-desk` repo.
3. Vercel auto-detects it's a Vite project — leave the build settings as
   default.
4. Before deploying, open **Environment Variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: *(paste your real key here)*
5. Click **Deploy**.

In about a minute you'll get a live URL like `signal-desk.vercel.app` that
anyone can open and use. Every time you `git push` to `main`, Vercel
redeploys automatically.

## Running it locally (optional)

```bash
npm install
npm run dev
```

Note: `npm run dev` alone won't run the `/api/analyze` function — that needs
Vercel's dev environment. Run `npx vercel dev` instead (after `npx vercel login`)
to test the full app locally with your API key from a `.env.local` file
(copy `.env.example` to `.env.local` and fill in your key).
