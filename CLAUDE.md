# Ski Program Cost Model – Web App

## What this is
A web version of the "Ski Program Cost Model" spreadsheet (Excel + Google Sheets).
It estimates the cost of a program that lets disadvantaged kids try skiing, the
funding gap, and how many kids live near Northeast resorts.

This is also a **learning project**: the owner (Chris) is learning Claude Code,
testing, and a GitHub-based workflow. Explain non-obvious decisions in PR
descriptions, keep changes small, and prefer clarity over cleverness.

## The spreadsheet is the spec
- Every calculation must match the spreadsheet exactly.
- `src/calc/costs.test.ts` and `src/calc/marketSizing.test.ts` hold the expected
  values taken from the spreadsheet. **Never change an expected value to make a
  test pass.** If the spreadsheet logic seems wrong, stop and ask.
- Spreadsheet → code mapping:
  - Assumptions tab → `src/calc/defaults.ts` (`Assumptions` type + `DEFAULT_ASSUMPTIONS`)
  - Summary tab → `src/calc/costs.ts` (`calculateCosts(a: Assumptions): CostSummary`)
  - Market Sizing tab → `src/calc/marketSizing.ts`

## Stack
- TypeScript (strict mode), React, Vite
- Vitest for unit tests, Playwright for end-to-end tests
- No backend in v1. Inputs persist in localStorage.
- Hosting: Vercel (auto-deploy from `main`)

## Architecture rules
- All maths lives in `src/calc/` as **pure functions** – no React, no DOM, no I/O.
- UI components only read inputs and display results from `src/calc/`.
- Money is plain numbers (dollars). Round only when displaying, never in calculations.
- Guard every division (zero kids, zero instructors) the same way the spreadsheet does.

## Workflow
1. Every feature starts as a GitHub Issue.
2. Use plan mode first; agree the plan before writing code.
3. Write or update tests **before** implementation.
4. One branch and one small PR per issue. PR description: what, why, how tested.
5. CI (GitHub Actions) runs `npm run lint`, `npm run typecheck`, `npm test` on every PR.
   Nothing merges with failing checks.

## Commands
- `npm run dev` – local dev server
- `npm test` – Vitest
- `npm run test:e2e` – Playwright
- `npm run lint` / `npm run typecheck`

## Roadmap
- v1: Assumptions form + live Cost Summary (one page)
- v2: Scenario compare (pilot / mid / full) and sensitivity view
- v3: Market Sizing with map (Leaflet: county shading + resort radius circles)
- v4: Existing Programs directory
- v5: Backend (e.g. Supabase) to save and share scenarios

## Known spreadsheet quirks (keep for now, revisit later)
- With 0 kids, the model still books 1 bus because volunteers ride it.
- "Kids per instructor" of 0 is treated as 1 (spreadsheet uses MAX(x,1)).
- ASSUMED, not yet checked against the spreadsheet: bus capacity of 0 is treated
  as 1, and cost per child-day is 0 when ski days is 0.
