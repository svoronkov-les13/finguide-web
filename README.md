# FinGuide Web

React/Vite frontend for **FinGuide / «Финансовый капитал»**.

## Links

- App: https://finguide.les13.tech/fg/
- Backend API base: https://finguide.les13.tech/finguide-api/api/v1
- Backend Swagger: https://finguide.les13.tech/finguide-api/swagger-ui.html
- Backend docs: https://svoronkov-les13.github.io/finguide-be/
- Keycloak realm: https://finguide.les13.tech/auth/realms/finguide
- Web repository: https://github.com/svoronkov-les13/finguide-web
- Backend repository: https://github.com/svoronkov-les13/finguide-be

## Stack

- React 19
- TypeScript 5.9
- Vite 7
- TanStack Query / Router
- Zustand
- React Hook Form + Zod
- Recharts
- Tailwind CSS 4
- Orval generated API client
- Bun 1.3.6 / Node 22

## Runtime behavior

The app can run in anonymous demo mode or authenticated OIDC mode.

When `VITE_FINGUIDE_AUTH_ENABLED=true`:

1. `/fg/login` starts Keycloak Authorization Code + PKCE.
2. `/fg/auth/callback` completes the OIDC flow.
3. The app restores the OIDC session from `localStorage` before loading the current financial plan.
4. API requests send `Authorization: Bearer <access_token>`.
5. React Query keeps separate cache entries for anonymous demo mode and each authenticated user.
6. Layout renders a neutral loading state until `/api/v1/plans/current` returns the user-owned plan.

Hardcoded demo owner/profile fallback must not be rendered during auth restore.

## FinPlan redesign roadmap

Frontend issue [#7](https://github.com/svoronkov-les13/finguide-web/issues/7) tracks applying the new FinPlan Figma direction. Treat it as a staged design-system migration, not a one-shot rewrite.

Implementation order:

1. Design tokens: colors, typography, radius, shadows and spacing.
2. App shell: background, sidebar, topbar, page layout and card surfaces.
3. Shared UI primitives: Button, Input, Select, Tabs, Card, Badge, Dialog and Tooltip.
4. Dashboard desktop target with visual before/after screenshots.
5. Page migrations: onboarding/common data, incomes/expenses, goals/scenario tables, tracker, account/settings, FAQ/help modals.

Backend/API gaps discovered during migration should become explicit backend follow-up issues instead of frontend-only mock fields.

## Current backend integration

Current deploy uses the real backend, not the legacy mock, for persisted plan reads and financial item mutations:

- `GET /api/v1/me`;
- `GET /api/v1/plans/current`;
- dashboard/health/cashflow/scenarios read;
- incomes CRUD;
- expenses CRUD;
- goals CRUD;
- goals reorder.

The left navigation counters for income, expenses and goals are derived from the currently loaded persisted plan state returned by `/plans/current`.

- Income/expense counters count enabled cashflow items of the corresponding type.
- Goal counter counts goals in the current plan.
- While the current plan is not loaded, the sidebar does not render demo/default counter values.
- Empty persisted plans render zero counters instead of seeded demo values.

## Documentation and GitHub Pages

Project-wide MkDocs/GitHub Pages documentation is currently published from `finguide-be`:

```txt
https://svoronkov-les13.github.io/finguide-be/
```

This repository does not currently have its own Pages workflow. Keep this README and `.env.example` aligned with the public deployment contract because they are the web-specific source for local setup and runtime variables.

## CI/CD

Current production-like deployment is container based:

- `.github/workflows/docker-ghcr.yml` builds and pushes `ghcr.io/svoronkov-les13/finguide-web:<tag>`;
- `finguide-ops` deploy workflows roll out the selected image tag to Kubernetes.

The older `.github/workflows/deploy.yml` static-file deploy is legacy and should not be treated as the current `finguide.les13.tech` deployment path.

Триггеры:

- push в `main`;
- ручной `workflow_dispatch`.

`main` can publish container images automatically, so unfinished changes should stay in a separate branch/worktree until checked.

## Environment

Typical local `.env` values:

```bash
VITE_FINGUIDE_BASE_PATH=/
VITE_FINGUIDE_API_BASE_URL=http://127.0.0.1:8080/api/v1
VITE_FINGUIDE_AUTH_ENABLED=false
VITE_FINGUIDE_OIDC_ISSUER_URL=https://finguide.les13.tech/auth/realms/finguide
VITE_FINGUIDE_OIDC_CLIENT_ID=finguide-web
VITE_FINGUIDE_OIDC_SCOPE="openid profile email"
```

In local dev the app uses the backend client first. If the backend route is unavailable, it falls back to the in-memory demo plan so the UI stays usable:

```bash
# Optional: disable automatic local fallback and surface API errors.
VITE_FINGUIDE_DEV_MOCK_FALLBACK=false
```

Production-like Kubernetes deployment uses the app under `/fg/`, API at `/finguide-api/api/v1`, and Keycloak at `/auth/realms/finguide` on the same host:

```bash
VITE_FINGUIDE_BASE_PATH=/fg/
VITE_FINGUIDE_API_BASE_URL=/finguide-api/api/v1
VITE_FINGUIDE_AUTH_ENABLED=true
VITE_FINGUIDE_OIDC_ISSUER_URL=https://finguide.les13.tech/auth/realms/finguide
VITE_FINGUIDE_OIDC_CLIENT_ID=finguide-web
VITE_FINGUIDE_OIDC_SCOPE="openid profile email"
```

The root URL redirects to `/fg/`; Keycloak redirect URI should therefore stay `https://finguide.les13.tech/fg/auth/callback`.

## Development

```bash
bun install
bun run dev
```

Generate API client from `openapi/finguide.openapi.json`:

```bash
bun run generate:api
```

## Checks

```bash
bun run test
bun run lint
bun run typecheck
bun run e2e
bun run build:fg
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can override the Chromium/Chrome executable used by Playwright.

## Test expectations

Changes around auth bootstrap, current plan loading, sidebar counters or generated API usage should be test-driven:

1. add/update a failing unit/integration/e2e check;
2. implement the behavior;
3. run at least the focused test plus `bun run test` and `bun run typecheck`.

Open follow-up: [finguide-web#2](https://github.com/svoronkov-les13/finguide-web/issues/2) — smoke coverage for the generated client against the backend contract.
