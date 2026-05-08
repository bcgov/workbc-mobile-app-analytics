# WorkBC mobile app analytics API — implementation plan and progress

Use **one Cursor agent session per row** in [Session progress](#session-progress). Update checkboxes and **Notes** as you complete work.

| Field | Value |
|-------|--------|
| **Epic / ticket** | _link_ |
| **Target org/repo** | `bcgov/workbc-mobile-app-analytics` |
| **Default branch** | `main` |
| **Primary maintainer / channel** | _fill in Session 8_ |

---

## Session progress

Update **Done** when the session’s deliverables are merged (or intentionally deferred). Add **Completed (date)** when you close the session.

| Session | Done | Completed (date) | Notes / blockers |
|---------|:----:|------------------|------------------|
| [1 — Repo governance](#session-1--repository-governance-and-bootstrap) | [x] | 2026-05-07 | README + `docs/org-setup-checklist.md`; remote `bcgov/workbc-mobile-app-analytics`, branch `main`. Confirm repo visibility in GitHub UI. |
| [2 — Hono skeleton](#session-2--application-skeleton-hono-typescript-versioned-api) | [x] | 2026-05-07 | HANDOFF Session 3: Routes `POST /v1/events` (202 accept). Example: `curl -sS -X POST http://localhost:3000/v1/events -H "Content-Type: application/json" -d '{"eventName":"screen_view"}'`. Stable JSON: success `{ ok, id, receivedAt }`; errors `{ ok:false, error:{ code, message, fields? } }`. OpenAPI deferred. Package manager: npm. |
| [3 — Ops baseline](#session-3--operations-baseline-logging-health-config) | [x] | 2026-05-07 | HANDOFF Session 4: Env vars — `PORT` (default 3000), `NODE_ENV`, `LOG_LEVEL` (`debug`|`info`|`warn`|`error`). JSON logs: `server_listen`, `http_request` (INFO), `http_server_error` + `unhandled_error` (ERROR). Probes: `GET /health`, `GET /ready` (alias until deps). See `.env.example`. |
| [4 — Quality local](#session-4--quality-gates-locally-lint-format-tests-build) | [ ] | | |
| [5 — CI](#session-5--ci-pipeline) | [ ] | | |
| [6 — Docker](#session-6--containerization-conditional) | [ ] | | |
| [7 — bcgov hygiene](#session-7--bcgov-repository-hygiene-and-security-baseline) | [ ] | | |
| [8 — Handoff](#session-8--handoff-and-epic-closure) | [ ] | | |

---

## How to run an agent session

1. Open a **new** agent chat.
2. Paste: _“Execute **Session N** only per [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md). Do not expand scope to dashboards, production secrets, or warehouse schema. Deliverables and HANDOFF at the end.”_
3. When finished, tick the session in the table above, add the date, and paste any HANDOFF into **Notes** if useful for the next session.

---

## Session 1 — Repository governance and bootstrap

**Goal:** bcgov repo exists with agreed name, visibility, default branch; local remote wired; README stub.

- [x] Repo created under bcgov; naming and visibility confirmed
- [x] Default branch policy applied
- [x] Local clone: `origin` (or remotes) points to bcgov; initial push done if allowed
- [x] README stub: purpose, Hono/TypeScript, local run TBD or pointer to Session 4
- [x] Optional: `docs/org-setup-checklist.md` or epic notes for Actions, scanners, branch protection

**Handoff for Session 2:** Remote URL, default branch, blockers (e.g. Actions disabled).

---

## Session 2 — Application skeleton: Hono, TypeScript, versioned API

**Goal:** Hono app with `/v1` (or equivalent) and one placeholder analytics POST returning predictable JSON.

- [x] Layout: `src/`, config/env helper, `scripts/` if needed
- [x] Versioned routes (e.g. `/v1/...`)
- [x] Placeholder analytics endpoint (e.g. `POST /v1/events`), minimal JSON validation, stable success/error JSON
- [x] `package.json`: `dev`, `build`, `start` (compiles + runs)
- [x] Package manager chosen (`npm` or `pnpm`) and stick to it

**Handoff for Session 3:** Route list + example `curl`; OpenAPI deferred unless required.

---

## Session 3 — Operations baseline: logging, health, config

**Goal:** Structured logging, `/health`, `/ready` as appropriate, 12-factor env, no secrets in repo.

- [x] Request logging middleware (INFO); errors at ERROR with useful fields
- [x] `GET /health` (liveness)
- [x] `GET /ready` (readiness or documented alias until real deps)
- [x] Config via env (`PORT`, `LOG_LEVEL`, `NODE_ENV`, etc.); optional Zod validation
- [x] `.env.example` with safe local defaults only

**Handoff for Session 4:** Env var table (README polish in Session 4).

---

## Session 4 — Quality gates locally: lint, format, tests, build

**Goal:** ESLint/Prettier (or org-aligned tool), Vitest/Jest for routes, `npm run build` → runnable `dist`; README dev instructions.

- [ ] Lint + format wired; scripts in `package.json`
- [ ] Unit/route tests: happy path + bad body for analytics; health returns 200 + expected JSON
- [ ] `tsconfig` + source maps decision; README paragraph on maps in prod
- [ ] README: install, copy `.env.example`, `dev` / `test` / `build` / `start`

**Handoff for Session 5:** Local `lint`, `test`, `build` all green.

---

## Session 5 — CI pipeline

**Goal:** GitHub Actions on PR and default branch: install → lint → test → build → audit (blocking unless org waiver).

- [ ] `.github/workflows/ci.yml` (or org template) with Node setup + cache
- [ ] `npm ci`, lint, test, build
- [ ] `npm audit` (or org scanner) — prefer blocking
- [ ] Note Dependabot enabling (Settings); verify in Session 7

**Handoff for Session 6:** Link to first green CI run; any `continue-on-error` documented.

---

## Session 6 — Containerization (conditional)

**Goal:** If deployment uses containers: Dockerfile builds and runs; probe paths documented; tagging strategy noted.

- [ ] Multi-stage Dockerfile; org-approved base if required; non-root if required
- [ ] `.dockerignore`
- [ ] README: build/run, env at runtime, `/health` / `/ready` for probes
- [ ] Image version/tag strategy (semver, git sha) in README or ADR

**Skip:** If no containers yet, mark N/A in Notes and add follow-up.

**Handoff for Session 7:** `docker build` + `docker run` smoke commands (if applicable).

---

## Session 7 — bcgov repository hygiene and security baseline

**Goal:** Licence + community files per template; branch protection; Dependabot file; security scanning per org.

- [ ] `LICENSE` matches bcgov mandate; copyright/year if needed
- [ ] `CODE_OF_CONDUCT`, `CONTRIBUTING`, `SECURITY` / `SECURITY.md` as required
- [ ] Branch protection: reviews, no direct push to default branch, required checks = CI
- [ ] `.github/dependabot.yml` if allowed
- [ ] CodeQL / org scanner workflow or documented org ruleset

**Handoff for Session 8:** Confirm Dependabot, Actions, scanners visible in GitHub.

---

## Session 8 — Handoff and epic closure

**Goal:** Maintainers listed; epic/wiki link to repo; optional ADR for Hono/versioned API/env config.

- [ ] README **Maintainers / Contact**
- [ ] Epic or wiki updated with repo URL and v1 scope
- [ ] Optional: `docs/adr/0001-framework-choice.md`

---

## Acceptance criteria checklist (epic)

Track overall completion here; many items map to sessions above.

**Repository and docs**

- [ ] Repository under bcgov; naming and visibility correct
- [x] README: purpose, stack (Hono), run locally
- [x] Env vars documented with safe local defaults; no secrets committed
- [ ] Licence and metadata match bcgov (e.g. Apache-2.0 if mandated)
- [ ] `CODE_OF_CONDUCT` / `CONTRIBUTING` if template requires

**Application**

- [x] Hono boots; versioned base path (e.g. `/v1/...`)
- [x] At least one placeholder analytics endpoint with predictable JSON
- [x] `/health`; `/ready` if applicable to platform
- [x] Structured logging (JSON or consistent key/value) — INFO requests, ERROR failures

**Build and quality**

- [x] TypeScript build: `npm run build` (or equivalent) produces runnable artifact
- [ ] Source maps strategy documented if required
- [ ] Lint + tests in CI; failures block merge per policy

**Security and ops**

- [ ] Dependency audit or org-approved scanner in CI
- [ ] Dependabot or equivalent if policy requires
- [ ] Branch protection aligned with org (reviews, no direct push if required)

**Containerization (if used)**

- [ ] Dockerfile builds and runs; tagging/version strategy noted

**Handoff**

- [ ] Link from epic/mobile docs or wiki to repo + primary maintainer team/channel

---

## Out of scope (do not track here)

- Full production rollout and secrets in every environment
- Definitive downstream warehouse schema
- Dashboards / BI layer

---

## Risks (rolling)

| Risk | Status / mitigation |
|------|---------------------|
| Org templates, scanners, Actions delays | |
| Deployment target (e.g. OpenShift) undecided | |
| Mandatory scanner blocks merge temporarily | |
