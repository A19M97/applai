# Applai — Get briefed before your next job interview

**Live demo:** [applai-eosin.vercel.app](https://applai-eosin.vercel.app)

## Why I built this

While working on a technical test, I found myself doing something painfully manual: opening my CV in one tab, the job description in another, and spending 20 minutes cross-referencing skills, drafting mental notes for the cover letter, and guessing what interview questions might come up.

So I built Applai — the tool I wished I had at that moment. Paste your CV and the job description, and in seconds you get a compatibility score, a skills gap analysis, and a set of tailored interview questions ready to practice.

---

## What it does

**Step 1 — Paste your CV**
Paste plain text or upload a PDF. Applai extracts the text automatically.

**Step 2 — Paste the job description**
Copy the full JD from any job board.

**Step 3 — Analyze**
Applai calls Claude to produce:
- A **match score** (0–100) with animated progress bar
- **Common skills** you already have vs **missing skills** to address
- **Strengths** to highlight in your application
- **Cover letter tips** tailored to this specific JD
- 5 **technical questions** + 3 **behavioral questions**, each with a coaching hint

Results persist in `localStorage` so you can come back without re-analyzing. A banner on the homepage lets you resume or start over.

---

## Local setup

```bash
git clone https://github.com/A19M97/applai.git
cd applai

cp .env.example .env
# Fill in your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-...

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Tech choices

### Next.js full-stack (App Router)
Both the UI and the API routes live in a single Next.js 16 project — no separate backend to deploy. The `/api/analyze` and `/api/interview` routes call Claude server-side, so the API key never reaches the browser.

### Claude AI (`claude-sonnet-4-20250514`)
All prompts are pure functions in `/lib/prompts.ts`, never inlined in route handlers. Every response is strict JSON — the prompts explicitly forbid markdown fences or any preamble, so the output can be `JSON.parse()`d directly.

### localStorage for persistence
No database, no auth, no signup friction. The session (CV text, JD text, analysis, interview prep) is stored under a single key in `localStorage`. This is intentionally simple: the target user is someone who needs to prep for one interview right now, not someone building a long-term portfolio.

### next-intl for i18n
All user-facing strings live in `/messages/en.json` and `/messages/it.json`. No hardcoded strings in components. Locale routing follows the `[locale]` App Router convention with automatic static params generation.

### shadcn/ui + Tailwind CSS v4
Accessible primitives (Tabs, Accordion, Badge, Skeleton, Button) styled with Tailwind. Minimal: consistent spacing, mobile-first layout, skeleton loading states, no gratuitous animations beyond the score bar fill.

---

## Project structure

```
app/
  [locale]/
    page.tsx            # Homepage — multi-step form
    results/page.tsx    # Results — tabs: Match Analysis | Interview Prep
    layout.tsx          # Locale layout with per-locale meta tags
  api/
    analyze/route.ts    # POST — CV + JD → MatchAnalysis via Claude
    interview/route.ts  # POST — CV + JD + summary → InterviewPrep via Claude
  icon.tsx              # Emoji favicon (🎯) via Next.js ImageResponse
components/
  StepForm.tsx          # Multi-step controlled form (CV → JD → Analyze)
  ResultsTabs.tsx       # Tab switcher with skeleton loading state
  MatchScore.tsx        # Animated score bar (CSS transition on mount)
  SkillsBreakdown.tsx   # Common vs missing skills, two-column grid
  InterviewQuestions.tsx# Accordion: question + hint
lib/
  prompts.ts            # Pure functions that build Claude prompts
  claude.ts             # Anthropic SDK wrapper
  parsers.ts            # PDF text extraction (pdf-parse)
  session.ts            # localStorage read/write/clear helpers
  types.ts              # Shared TypeScript interfaces
hooks/
  useSession.ts         # SSR-safe React hook for session state
messages/
  en.json / it.json     # All UI strings
```

---

## What I'd improve with more time

- ~~**Streaming responses** — stream Claude's output token-by-token so the results page fills in progressively instead of waiting for the full JSON. This would dramatically improve perceived performance, especially on slow connections.~~
- **Database + shareable links** — swap `localStorage` for a lightweight DB (SQLite via Turso, or Postgres on Neon) with a unique URL per analysis. Useful for sending your prep session to a mentor or a friend.
