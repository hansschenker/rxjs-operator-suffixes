# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

An interactive RxJS operator decision tree — a tool to guide developers toward the right RxJS operator based on their use-case. Currently a blank Vite + TypeScript scaffold; all application logic is yet to be built.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Type-check (tsc) then bundle with Vite
npm run preview  # Serve the production build locally
```

No test runner is wired up yet (Vitest is installed as a dependency but has no config file or test files). When adding tests, create `vitest.config.ts` and place tests alongside source files as `*.test.ts`.

## Stack

- **Runtime:** Vanilla TypeScript — no framework (no Vue, no React)
- **Bundler:** Vite 7
- **RxJS:** 7.8.x — available for all reactive logic
- **VitePress:** installed; use it if a documentation site is needed alongside the app
- **Vitest:** installed; configure when tests are added

## TypeScript Config

`tsconfig.json` enforces strict mode with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, and `noUncheckedSideEffectImports`. The compiler does not emit (bundler handles output); `tsc` in the build step is type-check only.

## Architecture Intent

Since the project is vanilla TS with RxJS, follow the MVU pattern from the global CLAUDE.md:

- State in a `BehaviorSubject`, updated via `scan` + reducer
- UI rendered by subscribing to `state$` and writing to the DOM imperatively
- User interactions modelled as `Subject<Action>` streams
- No nested subscriptions — flatten with the appropriate higher-order operator

Decision-tree state (current node, selected path, breadcrumb trail) maps naturally to a `scan`-based reducer over navigation actions.
