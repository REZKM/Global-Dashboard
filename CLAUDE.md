# Instructions for Claude

## Always push to `main`

Railway deploys only from the `main` branch. Commit and push all changes
directly to `main` (`git push origin HEAD:main`), not to a feature branch —
a push to any other branch will not deploy.

## Project shape

- `public/dashboard/index.html` is the whole dashboard in one file. Keep it one file.
  Its app script is split into labelled sections (see README); put new code in the
  section it belongs to.
- All metric maths lives in the METRICS section (`engagementValueOf`,
  `aggregatePerformanceRows`, `engagementRatesFor`, `avgEngagementPerPost`,
  `sharePct`). Reuse these instead of writing a formula inline.
- Colours, fonts, sizes, radii and shadows come from `DESIGN.md` (injected by
  `design.js`). Use `var(--token)` in CSS/HTML and `COLORS` / `token()` for charts;
  never hard-code a colour or font size. New tokens go in `DESIGN.md`.
- Performance-only, Emplifi exports only. There is no Listening or Quick
  Performance mode any more.

## Before every commit

Run `npm run check` (validates `DESIGN.md` and runs `node --check` on every inline
script in `index.html`). It must pass.
