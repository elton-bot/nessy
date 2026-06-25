# Nessy — Deployment

The app is a single Node process: Express serves the API, the SSE realtime
stream, **and** the built React SPA from one origin. One web service + one
Postgres = the whole product.

## One-click (Render Blueprint)
`render.yaml` declares a free web service + a free managed Postgres and wires
`DATABASE_URL` automatically. From the repo on GitHub:

1. Open **https://render.com/deploy?repo=<this-repo-url>** (or New → Blueprint →
   pick the repo).
2. Click **Apply**. Render provisions Postgres, builds (`npm install && npm run
   build`), and starts (`npm start`).
3. On first boot the server runs the migration + seeds the demo household, so the
   app is immediately usable.

That **Apply** click is the only manual step — everything else is in the repo.

Demo login: any member (Liza / Andre / Joaquin / Maria), PIN **1234**.

## Environment
| Var | Purpose | Set by |
|-----|---------|--------|
| `DATABASE_URL` | Postgres connection | Render Blueprint (or your host) |
| `NODE_ENV=production` | secure cookies, etc. | Blueprint |
| `PORT` | listen port | host-injected |

TLS to Postgres is auto-enabled for any non-localhost `DATABASE_URL`.

## Other hosts
A `Dockerfile` builds one container (API + SSE + SPA) for Fly.io / Railway /
Cloud Run. Provide a `DATABASE_URL` and deploy; the container listens on `$PORT`.

## Production hardening checklist (beyond this prototype)
- Per-member real credentials / magic-link instead of a shared demo PIN.
- Rotate session tokens; add CSRF protection for cookie auth.
- Connection pooling limits + read replicas as households grow.
- Move seed/demo bootstrap behind a flag so production starts empty.
