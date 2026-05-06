# FinPlan Figma design assessment — 2026-05-06

Source Figma file: `FinPlan` (`GVmbMjADqc5K8XivPpBuQq`), last modified `2026-05-05T09:31:55Z`.

## Result

The design is accessible through the Figma API and can be applied to the current React/Vite frontend. The right implementation path is **manual React integration**, not direct generated Figma code import.

## Evidence / screenshots

Full contact sheet:

![FinPlan contact sheet](./finplan-figma-2026-05-06/00-contact-sheet.jpg)

Key frames:

![Style guide](./finplan-figma-2026-05-06/01-style-guide.png)

![Dashboard page](./finplan-figma-2026-05-06/02-dashboard-page.png)

![Main flow A](./finplan-figma-2026-05-06/03-main-flow-a.png)

![Instruction modal](./finplan-figma-2026-05-06/14-instruction.png)

Additional rendered frames are stored in [`docs/design/finplan-figma-2026-05-06`](./finplan-figma-2026-05-06/).

## Figma structure observed

- Page `FinPlan`: 116 top-level objects/frames.
- Page `FinPlan дубликат`: 118 top-level objects/frames.
- Page `🎨 Style Guide`: 1 style guide frame.
- Components/component sets: none exposed through the API.
- Styles: 4 remote styles exposed (`XXS/Regular`, `XS/Regular`, `L/Regular`, `Neutral/80`).

## UI direction

- Light SaaS UI with warm neutral background and generous spacing.
- Persistent dark-purple left sidebar.
- Rounded cards, thin borders, glass/card surfaces.
- Pastel semantic accents for financial categories and statuses.
- Heavy use of financial tables, grouped rows, charts, tooltips, forms, and onboarding/help modals.

## Applicability to current frontend

Current frontend already uses:

- React 19 + TypeScript + Vite.
- TanStack Query/Router.
- Recharts.
- React Hook Form + Zod.
- Radix primitives and local UI components.

This stack is compatible with the new design. Existing `AppShell`, sidebar/topbar, cards, buttons, inputs, dashboard widgets, and page routes can be evolved rather than replaced wholesale.

## Recommended implementation order

1. Add design tokens: colors, typography, radii, shadows, spacing.
2. Update base layout shell: background, sidebar, topbar, page width, card surfaces.
3. Rework shared UI primitives: Button, Input, Select, Tabs, Card, Badge, Dialog, Tooltip.
4. Apply pages in this order:
   - Dashboard / summary overview.
   - General data / onboarding flow.
   - Income and expense sections.
   - Goals and scenario tables.
   - Tracker and personal account/settings.
   - FAQ/help/instruction modals.
5. Add visual regression screenshots for key pages before/after.

## Risks / blockers

- Figma file does not expose a reusable component library through the API, so the frontend design system must be rebuilt manually.
- Desktop frames are clear; responsive/mobile behavior is not obvious from the captured frames.
- Tables are the highest-risk area: grouping, inline states, sticky headers, empty states, and formatting.
- Charts need precise tooltip, legend, axes, currency/percentage formatting.
- Some UI states are missing or unclear: loading, error, hover/focus, validation errors, disabled states.
- Backend/API gaps may block full fidelity for tracker, account/settings, scenarios, and advanced analytics screens.

## Acceptance criteria

- [ ] Design tokens are codified in `src/styles.css` / UI primitives.
- [ ] App shell matches the new sidebar/topbar/background direction.
- [ ] Dashboard key screenshots match Figma at desktop width.
- [ ] Shared UI primitives cover buttons, inputs, cards, tabs, badges, dialogs, tooltips.
- [ ] Page-by-page migration plan is split into implementation issues.
- [ ] Missing API/data fields are listed as backend follow-up issues.
- [ ] Build/typecheck pass.
- [ ] Visual screenshots are attached to each implementation PR/issue.
