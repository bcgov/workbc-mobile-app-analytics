# WorkBC mobile app analytics API

Backend API for collecting and serving analytics events from the WorkBC mobile application.

## Stack

- **Runtime:** Node.js (see `package.json` `engines`)
- **Framework:** [Hono](https://hono.dev/) with **TypeScript**

## Prerequisites

- **Node.js** version in `package.json` → `engines.node` (use `nvm`, `fnm`, or similar to match locally and in CI).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Environment (no secrets committed): copy defaults and edit if needed:

   ```bash
   cp .env.example .env
   ```

3. Run in development:

   ```bash
   npm run dev
   ```

### Environment variables

| Variable    | Meaning           | Typical local                          |
| ----------- | ----------------- | -------------------------------------- |
| `PORT`      | HTTP listen port  | `.env.example` (e.g. `4000`)           |
| `NODE_ENV`  | Runtime profile   | `development`                          |
| `LOG_LEVEL` | Minimum log level | `debug` \| `info` \| `warn` \| `error` |

Structured logs use JSON (see middleware and startup in `src/`).

### Smoke check

With the server running:

```bash
curl -sS -X POST "http://localhost:${PORT:-4000}/v1/events" \
  -H "Content-Type: application/json" \
  -d '{"eventName":"screen_view"}'
```

Expect HTTP `202` and a JSON body with `ok`, `id`, and `receivedAt`.

## Scripts

| Script                 | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Watch mode via `tsx`                    |
| `npm run build`        | Compile TypeScript to `dist/`           |
| `npm run start`        | Run compiled app (`node dist/index.js`) |
| `npm run test`         | Run Vitest once                         |
| `npm run test:watch`   | Vitest watch mode                       |
| `npm run lint`         | ESLint                                  |
| `npm run lint:fix`     | ESLint with `--fix`                     |
| `npm run format`       | Prettier write                          |
| `npm run format:check` | Prettier check (`--check`)              |

Quality gates (**lint**, **test**, **build**) should all pass locally before opening a PR; CI automation is wired in Session 5 of [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

### Source maps in production

`tsconfig.json` enables `sourceMap` and `declarationMap` so errors and stack traces can map back to TypeScript sources and declarations are emitted for downstream tooling. Deployed artifacts normally include `.js` alongside `.js.map`; if your platform forbids shipping maps to runtime, strip `*.map` in the image or release bundle and keep them only in your build artifacts for debugging.

## Repository

- **Remote:** `https://github.com/bcgov/workbc-mobile-app-analytics`
- **Default branch:** `main`

## Licence

See [LICENSE](./LICENSE).
