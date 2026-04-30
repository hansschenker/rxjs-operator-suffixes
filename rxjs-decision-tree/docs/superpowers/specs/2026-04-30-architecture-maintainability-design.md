# Architecture / Maintainability Refactor — Design Spec

**Date:** 2026-04-30
**Branch:** feat/inline-operator-detail
**Scope:** Three independent, coordinated improvements to code organisation and render efficiency.

---

## Problem Statement

Three maintainability issues exist in the current codebase:

1. `src/tree/tree.config.ts` is a 556-line monolith mixing helper functions, constants, and the full nested tree literal. Adding or auditing a branch requires scrolling the entire file.
2. `main.ts` has a single `state$` subscription that re-renders both the sidebar and the panel on every action — including `open-detail` / `close-detail`, which the sidebar does not care about.
3. `src/ui/detail.ts` reaches into two separate registries (`getMarbleSVG` and `explanations`) and duplicates the key-extraction logic (`wikiPath.split('/').pop()`).

---

## Approach

**Approach B — Derived streams.** All three issues are addressed together:

- Split the tree config into per-branch files with a shared builders module.
- Add typed slice types and derived `sidebarState$` / `panelState$` streams to `tree.state.ts`; UI modules subscribe to these instead of raw `state$`.
- Extract a `getOperatorDetail(wikiPath)` facade that encapsulates both registry lookups behind a single call.

---

## Design

### 1. Tree Config Split

Extract helpers and `WIKI_BASE` into a new `tree.builders.ts`. Reduce `tree.config.ts` to ROOT assembly + imports only (~20 lines). Each top-level branch becomes its own file under `src/tree/branches/`.

**New file layout:**

```
src/tree/
  tree.types.ts           (unchanged)
  tree.builders.ts        (op(), leaf(), WIKI_BASE)
  tree.config.ts          (ROOT + 10 branch imports)
  branches/
    create.branch.ts      (CREATE — 8 leaves)
    one.branch.ts         (ONE + ONE_QUERY + ONE_VALUES + ONE_TIMING + LIFECYCLE)
    many.branch.ts        (MANY — 7 leaves)
    nested.branch.ts      (NESTED — 4 leaves)
    error.branch.ts       (ERROR — 4 leaves)
    multicast.branch.ts   (MULTICAST — 2 leaves)
    aggregation.branch.ts (AGGREGATION — 2 leaves)
    conditional.branch.ts (CONDITIONAL — 4 leaves)
    hot-cold.branch.ts    (HOT_COLD — 4 leaves)
    inspection.branch.ts  (INSPECTION — 4 leaves)
```

Each branch file imports from `../tree.builders` and `../tree.types`, and exports its root node with an explicit `: QuestionNode` annotation so TypeScript catches structural errors at the declaration site.

`tree.config.ts` re-exports `WIKI_BASE` from `tree.builders` so existing consumers (`detail.ts`) need no import-path changes.

`one.branch.ts` is the largest file (~130 lines) because the ONE sub-tree has the deepest nesting — this is domain complexity, not file bloat.

---

### 2. Derived State Streams

Add two slice types and two derived streams to `src/state/tree.state.ts`.

**Types:**

```typescript
export interface SidebarSlice {
  currentNode: TreeNode
  breadcrumb:  BreadcrumbStep[]
}

export interface PanelSlice {
  currentNode: TreeNode
  breadcrumb:  BreadcrumbStep[]
  historyLen:  number
  detailView:  DetailView | null
}
```

**Streams:**

```typescript
export const sidebarState$ = state$.pipe(
  map(({ currentNode, breadcrumb }): SidebarSlice => ({ currentNode, breadcrumb })),
  distinctUntilChanged((a, b) =>
    a.currentNode === b.currentNode && a.breadcrumb === b.breadcrumb
  ),
)

export const panelState$ = state$.pipe(
  map(({ currentNode, breadcrumb, history, detailView }): PanelSlice => ({
    currentNode, breadcrumb, historyLen: history.length, detailView,
  })),
  distinctUntilChanged((a, b) =>
    a.currentNode === b.currentNode &&
    a.historyLen  === b.historyLen  &&
    a.detailView  === b.detailView
  ),
)
```

Comparators use reference equality on object/array fields — safe because the reducer always creates new references when those fields change. `historyLen` is compared by value.

**Effect on renders:**
- `open-detail` / `close-detail` → sidebar does NOT re-render; panel re-renders (detailView changed).
- Navigation (`answer`, `back`, `reset`) → both re-render (currentNode changed).

**`main.ts` changes:**

```typescript
// before
state$.subscribe(state => {
  renderSidebar(sidebar, state)
  renderPanel(panel, state)
})

// after
sidebarState$.subscribe(state => renderSidebar(sidebar, state))
panelState$.subscribe(state => renderPanel(panel, state))
```

**UI renderer signature changes:**
- `renderSidebar(container, state: SidebarSlice)` — sidebar cannot access `detailView` or `history`.
- `renderPanel(container, state: PanelSlice)` — panel reads `historyLen` instead of `history.length`.

`state$` remains exported from `tree.state.ts` unchanged — it is still available for any future consumer that needs full state.

---

### 3. Operator Detail Facade

**New file `src/data/operator-detail.ts`:**

```typescript
import { getMarbleSVG } from '../marble/configs/index'
import { explanations } from './explanations'
import type { OperatorExplanation } from './explanations'

export interface OperatorDetail {
  marbleSVG:   string | null
  explanation: OperatorExplanation | null
}

export function getOperatorDetail(wikiPath: string): OperatorDetail {
  const key = wikiPath.split('/').pop() ?? ''
  return {
    marbleSVG:   getMarbleSVG(wikiPath),
    explanation: explanations[key] ?? null,
  }
}
```

**`src/ui/detail.ts` simplifies to:**

```typescript
const { marbleSVG, explanation } = getOperatorDetail(wikiPath)
```

The key-extraction convention (`wikiPath.split('/').pop()`) lives in exactly one place. No changes to the marble registry or explanations data.

---

## Files Changed

| File | Change |
|------|--------|
| `src/tree/tree.builders.ts` | **New** — `op()`, `leaf()`, `WIKI_BASE` |
| `src/tree/tree.config.ts` | **Rewrite** — ROOT assembly + imports only |
| `src/tree/branches/*.branch.ts` | **New** — 10 branch files |
| `src/state/tree.state.ts` | **Extend** — `SidebarSlice`, `PanelSlice`, `sidebarState$`, `panelState$` |
| `src/data/operator-detail.ts` | **New** — `getOperatorDetail()` facade |
| `src/ui/sidebar.ts` | **Update** — signature uses `SidebarSlice` |
| `src/ui/panel.ts` | **Update** — signature uses `PanelSlice`, reads `historyLen` |
| `src/ui/detail.ts` | **Update** — calls `getOperatorDetail()` |
| `src/main.ts` | **Update** — two independent subscriptions |

No changes to: `tree.types.ts`, `tree.reducer.ts`, the marble system, `explanations.ts`, `style.css`, or any test files (reducer tests are unaffected; marble tests are unaffected).

---

## Testing

- Existing reducer tests (`tree.state.test.ts`) and marble render tests pass without changes.
- After the refactor, run `npm run build` (tsc + vite) to confirm no type errors across the new module boundaries.
- Manual smoke test: navigate the tree, open a detail panel, use Back — verify sidebar does not flicker on detail open/close.
