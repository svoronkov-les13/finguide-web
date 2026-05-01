# FinGuide Web

React/Vite frontend for FinGuide.

## Auth and current plan bootstrap

When `VITE_FINGUIDE_AUTH_ENABLED=true`, the app restores the OIDC session from `localStorage` before loading the current financial plan. React Query keeps separate cache entries for anonymous demo mode and each authenticated user, so a seeded demo plan/profile is not reused while a login callback or browser session restore is resolving.

Layout components show a neutral loading state until `/api/v1/plans/current` returns the user-owned plan. Hardcoded demo owner fallbacks must not be rendered during auth restore.

## Sidebar counters

The left navigation counters for income, expenses, and goals are derived from the currently loaded persisted plan state returned by `/api/v1/plans/current`.

- Income/expense counters count enabled cashflow items of the corresponding type.
- Goal counter counts goals in the current plan.
- While the current plan is not loaded, the sidebar does not render demo/default counter values.
- Empty persisted plans render zero counters instead of seeded demo values.

Changes to this behavior should be test-driven: add or update a failing unit/integration/e2e check first, then implement the UI fix.

## Checks

```bash
bun run test
bun run lint
bun run typecheck
bun run e2e
bun run build:fg
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can override the Chromium/Chrome executable used by Playwright.
