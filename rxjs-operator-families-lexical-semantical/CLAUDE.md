# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

An interactive explorer for RxJS operator families organized by a **lexical-semantic taxonomy** — grouping operators by what they *do* conceptually (Creation, Transformation, Filtering, Flattening Policies, State/Accumulation, Grouping/Branching, Time Control, etc.) rather than alphabetically. The taxonomy is backed by a Mermaid decision tree that routes users to the right operator family by answering intent-based questions.

## Commands

```bash
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # tsc type-check + Vite production build
npm run preview    # Preview production build
```

No test script is configured yet, though `vitest` is installed as a dependency.

## Project State

The `src/` directory currently contains the **default Vite + TypeScript starter template** — a placeholder. The substantive content lives in `docs/`:

- `docs/rxjs_lexical-semantic-taxonomy.pdf` — reference taxonomy document
- `docs/rxjs_operator_family_mermaid_decision_tree (1).md` — Mermaid flowchart for operator family selection (15 top-level decision branches)

## Operator Family Taxonomy

The decision tree routes from a single root question ("What to do?") through 15 operator families:

| Letter | Family |
|--------|--------|
| B | Creation / Adaptation |
| C | Static Multi-Source Combination |
| D | Projection / Shape Change |
| E | Filtering / Selection |
| F | Flattening Policies |
| G | State / Accumulation / Reduction |
| H | Grouping / Branching / Recursive Expansion |
| I | Time Control |
| J | Combination by Context / Sequence Augmentation |
| K | Sharing / Multicasting |
| L | Inspection / Notification Conversion |
| M | Scheduler Control |
| N | Error / Recovery / Timeout |
| O | Interop / Boundary Conversion |

## TypeScript Configuration

Strict mode with full linting flags: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly`. Target ES2022, bundler module resolution.

## Dependencies Note

`vitepress` and `vitest` are listed under `dependencies` rather than `devDependencies` — this is intentional for the project's current scaffold; adjust if adding a proper build pipeline.
