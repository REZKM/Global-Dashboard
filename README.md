# Dashboard with allowlist + self-service login

An Express server that serves your static HTML dashboard from
`public/dashboard/` and only lets pre-approved emails in. How it works for
each user:

1. They visit the site and type their email.
2. If that email isn't on your allowed list, they're told to contact you.
3. If it's their first time, they're prompted to create a password on the
   spot — no admin work needed per user.
4. Next time, they just type their email + the password they set.

Passwords are hashed (bcrypt) and stored in a small Postgres database —
Railway can add one to your project with a single click and wires it up
automatically.

## 1. Add your dashboard

Copy your existing dashboard's HTML, CSS, JS, and any assets into
`public/dashboard/`, replacing the placeholder file there.

If your main dashboard file is named `index.html`, nothing else to do. If it
keeps a different name (e.g. `GDC_Dashboard_latest.html`) and you don't want
to rename it every time you update it, set an env var in Railway called
`DASHBOARD_INDEX_FILE` to that exact filename — the server will look for
whatever name you put there instead of `index.html`.

## 2. Decide who's allowed in

You just need a plain list of emails — no passwords, no hashing. You'll paste
this as the `ALLOWED_EMAILS` variable in step 5, comma-separated, e.g.:

```
alice@example.com,bob@example.com,carol@example.com
```

## 3. Push this project to GitHub

Create a new (private) repo on GitHub, then use its "uploading an existing
file" link to drag in everything from this folder (skip `node_modules` if
present — it won't exist unless you ran `npm install` locally).

## 4. Deploy to Railway

In Railway: **New Project → Deploy from GitHub repo**, pick the repo you just
created. Railway auto-detects Node.js, runs `npm install`, and starts it with
`npm start` — no Dockerfile needed.

## 5. Add a database

In the same Railway project, click **New → Database → Add PostgreSQL**.
Railway creates it and automatically links a `DATABASE_URL` variable into
your app service — you don't need to copy anything by hand.

## 6. Set the remaining variables

Open your app service's **Variables** tab and add:

- `SESSION_SECRET` — any long random string you make up
- `ALLOWED_EMAILS` — your comma-separated list from step 2
- `NODE_ENV` — `production`

Saving triggers an automatic redeploy.

## 7. Get your public URL

Once deployed, go to **Settings → Networking → Generate Domain** for a free
`*.up.railway.app` URL, or attach your own custom domain from the same tab —
Railway handles the SSL certificate either way.

## Managing users later

- **Add someone:** add their email to `ALLOWED_EMAILS` and redeploy. They'll
  be prompted to create a password the first time they visit.
- **Remove someone:** remove their email from `ALLOWED_EMAILS`. This blocks
  future logins immediately; their password stays in the database in case
  you re-add them later.
- **Someone forgot their password:** there's no self-serve reset built in
  yet. For now, connect to the Postgres database from Railway's dashboard
  (Data tab) and run `DELETE FROM users WHERE email = 'their@email.com';` —
  they'll be prompted to set a new password on their next visit.

## Notes / good-to-knows

- Sessions are stored in a signed cookie, so restarts/redeploys never log
  anyone out unexpectedly.
- Everything under `/dashboard` requires a logged-in session; `/login`,
  `/check-email`, `/set-password`, `/enter-password`, and `/logout` are the
  public routes that make the login flow work.
- This was tested locally end-to-end (allowlist rejection, first-time
  password creation, returning-user login, wrong-password rejection, and
  unauthenticated access all behave correctly) before being handed to you.
