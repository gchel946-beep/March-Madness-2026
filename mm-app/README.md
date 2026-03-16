# 2026 March Madness Analytics

A full-stack interactive NCAA Tournament analytics dashboard built with Next.js 14, React, TypeScript, Tailwind CSS, and Zustand. Deploy to Vercel in under 2 minutes.

---

## Features

- **Interactive bracket** — click any matchup to open a full analytics panel
- **Stat format** `94.2(18)` — value with national rank inline
- **Upset probability engine** — logistic model + pre-researched confidence scores
- **Matchup advantage scoring** — 6-category edge comparison with summary
- **Monte Carlo simulation** — 5,000 tournament simulations with champion/F4 probabilities
- **My Bracket Analysis** — personality classification, champion risk, historical comparison, recommendations

---

## Tech Stack

| Layer     | Tech                        |
|-----------|-----------------------------|
| Framework | Next.js 14 (App Router)     |
| Language  | TypeScript                  |
| Styling   | Tailwind CSS v3             |
| State     | Zustand                     |
| Fonts     | Inter + IBM Plex Mono (Google Fonts) |
| Deploy    | Vercel                      |

---

## Run Locally

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# Deploy (run from the project root)
vercel

# Follow the prompts:
#   - Link to existing project? No → create new
#   - Project name: march-madness-2026 (or anything you like)
#   - Root directory: ./  (leave blank, just hit Enter)
#   - Framework: Next.js (auto-detected)

# For production:
vercel --prod
```

Your live URL will be printed at the end: `https://march-madness-2026.vercel.app`

---

### Option B — GitHub + Vercel Dashboard (recommended for ongoing updates)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/march-madness-2026.git
   git push -u origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **"Import Git Repository"**
   - Select your `march-madness-2026` repo
   - Framework preset: **Next.js** (auto-detected)
   - Click **Deploy**

3. **Done.** Every `git push` to `main` auto-deploys.

---

## Build for Production (local check)

```bash
npm run build
npm run start
```

If `npm run build` passes with no errors, Vercel deployment will succeed.

---

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind + base styles
│   ├── layout.tsx           # Root layout, fonts, metadata
│   └── page.tsx             # Entry point → renders MainApp
│
├── components/
│   ├── MainApp.tsx          # Tab router + view shell
│   ├── Nav.tsx              # Top navigation bar
│   ├── BracketPage.tsx      # Bracket view with sub-tabs
│   ├── RegionGrid.tsx       # 4-round region column set
│   ├── FinalFour.tsx        # Final Four + Championship
│   ├── MatchupPair.tsx      # Clickable matchup (2 slots)
│   ├── TeamSlot.tsx         # Individual team row
│   ├── Sidebar.tsx          # Analytics panel (right side)
│   └── pages/
│       ├── UpsetsPage.tsx
│       ├── DarkHorsesPage.tsx
│       ├── InsightsPage.tsx
│       ├── AnalysisPage.tsx
│       └── SimulatePage.tsx
│
├── data/
│   ├── teams.ts             # All 68 team KenPom data
│   └── matchups.ts          # All 32 R1 matchups + analysis
│
├── lib/
│   ├── analytics.ts         # Win probability, matchup engine, risk
│   └── simulation.ts        # Monte Carlo tournament simulator
│
├── store/
│   └── useBracket.ts        # Zustand global state
│
└── types/
    └── index.ts             # TypeScript interfaces
```

---

## Environment Variables

None required. The app is fully static with no API keys or external data fetching.

---

## Customization

**Update team data:** Edit `src/data/teams.ts` — every team has KenPom stats with national ranks.

**Update matchup analysis:** Edit `src/data/matchups.ts` — each game has upset confidence and a written analysis.

**Adjust the simulation:** The logistic model scale factor (default `8`) in `src/lib/simulation.ts` controls how much efficiency margin translates to win probability. Higher = chalk, lower = more chaos.
