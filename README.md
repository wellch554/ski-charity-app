# Ski Program Cost Model

A web version of the "Ski Program Cost Model" spreadsheet. It estimates the cost
of a program that lets disadvantaged kids try skiing, the funding gap, and how
many kids live near Northeast resorts.

Project rules (spreadsheet-as-spec, architecture, workflow) are in
[CLAUDE.md](./CLAUDE.md).

## Prerequisites

- Node.js 22 or newer (developed on Node 26)
- npm

## Setup

```sh
npm install
npx playwright install chromium   # one-time: browser for e2e tests
```

## Commands

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start the dev server at http://localhost:5173       |
| `npm run build`     | Typecheck and build for production into `dist/`     |
| `npm run preview`   | Serve the production build locally                  |
| `npm test`          | Run unit tests (Vitest)                             |
| `npm run test:e2e`  | Build, serve, and run end-to-end tests (Playwright) |
| `npm run lint`      | Lint with ESLint                                    |
| `npm run typecheck` | Typecheck with TypeScript (strict)                  |
| `npm run format`    | Format all files with Prettier                      |

## Project layout

```
src/
  calc/       Pure calculation functions + spec tests from the spreadsheet
  lib/        Small shared helpers (e.g. currency formatting)
  App.tsx     UI
e2e/          Playwright end-to-end tests
```
