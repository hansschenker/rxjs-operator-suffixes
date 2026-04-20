# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

A research/documentation project cataloguing RxJS operator naming conventions — grouping operators by shared name prefixes and suffixes (e.g. `buffer*`, `*Map`, `*Time`, `*Until`). The goal is to surface the patterns embedded in the RxJS API surface.

## Commands

```bash
npm run dev      # Vite dev server (localhost:5173)
npm run build    # tsc + vite build
npm run preview  # Preview production build
```

No test runner is configured yet (Vitest is installed as a dependency but has no test files).

## Project Structure

```
docs/
  rxjs-operator-name-suffixes.md   # Primary artifact — operators grouped by prefix
  rxjs-api-function-list.txt       # Raw flat list of all RxJS API names (source data)
  rxjs-api-function-list.xlsx      # Excel version of the same list
src/                               # Vite + TypeScript scaffold (default template, unused)
.vitepress/                        # VitePress is installed; config not yet written
```

## Architecture Notes

- The `src/` directory is the default Vite TypeScript starter template and is not yet the main focus — the real content lives in `docs/`.
- VitePress (`^1.6.4`) is installed, suggesting the intent is to build a VitePress documentation site from the markdown in `docs/`. No `.vitepress/config.ts` exists yet.
- `rxjs-operator-name-suffixes.md` uses a `#prefix / ##operator` heading hierarchy to group operators. When adding to it, preserve this convention.
- The `.xlsx` file is source data, not generated output — treat it as a reference artifact.

## TypeScript Config

Strict mode with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, and `noUncheckedSideEffectImports` all enabled. Target: ES2022, bundler module resolution.
