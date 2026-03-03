# TODO — Honest improvement backlog

Things I'd tackle next, roughly in priority order.

---

## 1. Streaming Claude responses

**Problem:** the results page shows a spinner for 5–10 seconds while waiting for the full JSON from Claude, then everything appears at once.

**Fix:** use the Anthropic streaming API and accumulate partial tokens. The tricky part is that the current design relies on `JSON.parse()` at the end — streaming JSON requires buffering and parsing incrementally (e.g., with a library like `partial-json`) or restructuring the prompt to emit each section separately. Either way, perceived performance improves dramatically.

---

## 2. Persistent storage + shareable URLs

**Problem:** `localStorage` is per-device and per-browser. You can't share a session with a mentor, and clearing browser data wipes your prep.

**Fix:** store sessions in a DB (Turso + Drizzle is a good lightweight choice for a Vercel-deployed Next.js app). Generate a short UUID per session and make `/results/[id]` a public URL. No auth required — the UUID is the secret.

---

## 3. Streaming / progressive result rendering

**Problem:** Match Analysis and Interview Prep are fetched sequentially (analyze → then interview). The user waits for both before seeing anything.

**Fix:** fire both API calls in parallel (they're independent once the CV and JD are known). Alternatively, show the Match Analysis tab immediately after the first call completes, and populate the Interview Prep tab asynchronously in the background.

---

## 4. Error recovery UX

**Problem:** if the Claude API call fails mid-session, the user sees a generic error and has to re-paste everything.

**Fix:** save the raw CV and JD text to `localStorage` before firing the API calls. On error, pre-fill the form with the saved text so the user can retry with one click instead of starting from scratch.
