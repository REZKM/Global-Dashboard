# Global Dashboards Center — Performance

A performance dashboard for **Emplifi exports**, served behind an email-allowlist
login. Users upload an Emplifi content export in the setup wizard and get one
scrolling dashboard: overview KPIs and engagement rates, posting timeline,
engagements, posting frequency, brand/platform comparison, post performance and
data quality, plus Benchmark view, Executive Intelligence and Ask me panels.

## Project layout

| Path | What it is |
|---|---|
| `public/dashboard/index.html` | The whole dashboard: one self-contained page (HTML, CSS, app code and the SheetJS / Chart.js / JSZip libraries inline). |
| `DESIGN.md` | **The design system.** Every colour, font, size, radius and shadow. Edit it to restyle the site. |
| `design.js` | Reads `DESIGN.md` and turns it into CSS variables for every page. |
| `server.js` | Express server: login flow, saved-views API, serves the dashboard. |
| `db.js` | Postgres tables for users (bcrypt-hashed passwords) and saved views. |
| `views/` | Login pages (`login-email`, `set-password`, `enter-password`) and their shared `auth.css`. |
| `scripts/check.js` | `npm run check` — validates `DESIGN.md` and syntax-checks the dashboard's scripts. |

### Inside `index.html`

The app script is split into labelled sections, in this order:
core helpers → app state → Emplifi import → **metrics** → filters → charts →
UI building blocks → dashboard page → one section per dashboard section
(Overview, Posting Timeline, Engagements, Posting Frequency, Comparison, Post
Performance, Data Quality) → one section per panel (Post details, KPI drilldown,
Widget compare, Day drilldown, Benchmark view, Executive Intelligence, Ask me) →
export → theme → saved views → setup wizard → startup.

**Every number is calculated in the METRICS section.** The key functions:

- `engagementValueOf(post)` — a post's engagement in the selected metric.
  *Engagements* is read as-is from Emplifi's Engagements column (owned accounts
  only); *Total Interactions* adds shares for Instagram/YouTube.
- `aggregatePerformanceRows(posts)` — every total, breakdown and daily series.
- `engagementRatesFor(posts)` — the only place ERF% / ER% / ERi% are calculated:
  - ERF% = Σ engagement ÷ Σ each post's own profile followers × 100
  - ER% = Σ engagement ÷ Σ reach × 100, posts with reach only
  - ERi% = Σ engagement ÷ Σ impressions × 100, posts with impressions only
- `avgEngagementPerPost(agg)` and `sharePct(part, total)` — every average and
  share-of-total shown on the page.

## Changing the design

Open `DESIGN.md`, change a value in one of its tables (for example the accent
colour, a chart colour, the font or a font size), commit and push. Railway
redeploys and the new look is live. Charts, the login pages and the PDF export
read the same tokens, so nothing else needs to change. Light and dark mode each
have their own column.

## Checking a change

```
npm install
npm run check
```

To run it locally, copy `.env.example` to `.env`, point `DATABASE_URL` at a
local Postgres, then `npm start` and open http://localhost:3000. Outside
production (`NODE_ENV` not `production`), edits to `DESIGN.md` and
`index.html` show up on refresh without restarting.

## Deploying (Railway)

Railway deploys the `main` branch automatically.

1. **New Project → Deploy from GitHub repo**, pick this repo. Railway runs
   `npm install` and `npm start`.
2. **New → Database → Add PostgreSQL** in the same project. `DATABASE_URL` is
   linked into the app automatically.
3. In the app's **Variables** tab set:
   - `SESSION_SECRET` — any long random string
   - `ALLOWED_EMAILS` — comma-separated emails allowed to sign in
   - `NODE_ENV` — `production`
4. **Settings → Networking → Generate Domain** for a public URL.

`DASHBOARD_INDEX_FILE` is no longer needed — the dashboard is `index.html`. If
it is still set to a file that doesn't exist, the server logs a warning and
serves `index.html`, so it can simply be deleted.

## Managing users

- **Add someone:** add their email to `ALLOWED_EMAILS`. They create a password
  the first time they sign in.
- **Remove someone:** remove their email from `ALLOWED_EMAILS`. Their password
  stays in the database in case they're re-added.
- **Forgotten password:** in Railway's Postgres **Data** tab run
  `DELETE FROM users WHERE email = 'their@email.com';` — they'll set a new
  password on their next sign-in.

## Saved views

Signed-in users can save the whole dashboard (data, filters, open section) and
restore it later from any device. The dashboard calls a small JSON API, scoped
to the signed-in user:

- `GET /api/me` — who is signed in
- `GET /api/views` — the user's saved views (name and last update)
- `POST /api/views` — save a view (`{ name, state }`)
- `GET /api/views/:id` — one view's full state
- `PUT /api/views/:id` — overwrite a view
- `DELETE /api/views/:id` — delete a view

Each user can keep up to 20 views (`MAX_VIEWS_PER_USER` in `db.js`); requests
over 25MB are rejected with a clear message (limit in `server.js`). Views saved
with the removed Listening or Quick Performance dashboards can't be restored.
