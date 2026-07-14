---
name: verify
description: How to build, run, and drive Tervana end-to-end to verify changes in the real app (Vite SPA, headless Edge via Playwright).
---

# Verifying Tervana changes

Vite React SPA, mobile-first dark UI, max-w-2xl. No test suite — verification is
driving the running app.

## Launch

```bash
cd C:/Users/Merri/tervana && npm run dev   # background; serves http://localhost:5173
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/   # 200 = up
```

`npm run build` runs `tsc -b` first — use it as the typecheck gate. `npm run lint` is
oxlint (two pre-existing fast-refresh warnings in Button.tsx / AuthContext.tsx are
normal).

## Drive (browser)

No Playwright in project deps and no bundled browsers. Recipe that works:

1. `npm i playwright` in a scratch dir (fast, no browser download needed).
2. `chromium.launch({ channel: 'msedge', headless: true })` — uses the system Edge.
3. Viewport 420×900 matches the mobile-first design.
4. `isVisible()` right after `waitForURL` races React's first paint — use
   `locator.waitFor()`-based assertions instead.
5. Screenshots: wait ~900ms first; `animate-fade-up` runs 0.7s with staggered delays.
6. Headless gotcha: the mouse position lingers after clicks, leaving a `:hover`
   highlight on whatever lands under it on the next page — cosmetic, not a bug.

## Flows worth driving

- **Scan lookup:** paste a code on the home page → `/scan/:retailId` (needs Supabase
  env in `.env` and a product row to get a hit; miss-state works without data).
- **Learn path:** `/learn` — fresh state shows START on the first node, 12 locked.
  Complete a lesson via the answer key: dump prompt→answer JSON from
  `src/data/learnContent.ts` with `node --experimental-strip-types` (it has no
  imports), then click options by exact accessible name (exact: true matters — "THC"
  is a substring of "THCV"). Progress persists in localStorage key `tervana.learn.v1`;
  a fresh browser context = fresh user. XP rules: 10/lesson, +5 perfect, 5 replay.
- **Admin:** `/admin/login` needs a real Supabase admin user; not driveable without
  credentials.
