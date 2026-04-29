# Inline Operator Detail Panel — Design Spec

**Date:** 2026-04-29
**Project:** rxjs-decision-tree
**Stack:** Vanilla TypeScript + RxJS 7.8, MVU architecture, Vite

---

## Overview

When a user reaches a leaf node in the decision tree and clicks an operator name, the main panel is replaced by a rich inline detail view. No page navigation occurs. A Back button returns to the leaf result. All content is bundled at build time — no runtime API calls.

---

## UX Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Detail placement | Replace panel entirely (Option C) | Fits the existing MVU nav model; no layout complexity |
| Content scope | Marble + code always visible; gotchas + related behind `<details>` | Quick scan for most users, depth on demand |
| Marble style | Gold standard SVG (FirstOrderDiagram / MarbleDiagram) for all operators | Consistent visual language across the whole app |
| Marble coverage | All ~30 operators in the tree | No second-class operators |
| Content source | Pre-extracted from `rxjs-operator-explain-claude/` cache | Leverages existing skill infrastructure |
| Architecture | Port Vue SVG renderers to vanilla TS + static TS data files | Matches existing codebase style, no build tooling changes |

---

## Section 1 — State & Actions

### TreeState change

```typescript
interface DetailView {
  operatorName: string
  oneliner:     string
}

interface TreeState {
  currentNode: TreeNode
  history:     QuestionNode[]
  breadcrumb:  BreadcrumbStep[]
  detailView:  DetailView | null   // set when detail panel is open
}
```

### New action variants

```typescript
type Action =
  | { kind: 'answer';       next: TreeNode; label: string }
  | { kind: 'back' }
  | { kind: 'reset' }
  | { kind: 'open-detail';  operatorName: string; oneliner: string }   // NEW
  | { kind: 'close-detail' }                                            // NEW
```

### Reducer rules

| Action | Effect on `detailView` | Effect on rest of state |
|---|---|---|
| `open-detail` | Set to `{ operatorName, oneliner }` | No change |
| `close-detail` | Set to `null` | No change |
| `back` | Set to `null` | Existing back logic |
| `reset` | Set to `null` | Existing reset logic |

`detailView` carries just the operator name and its one-liner so `renderDetail` doesn't need to traverse `currentNode`. Marble config and explanation content are looked up from data files by `operatorName` at render time.

---

## Section 2 — Marble Rendering

### New files

```
src/marble/marble.types.ts          — TypeScript interfaces (ported from Vue components)
src/marble/render-first-order.ts    — renderFirstOrderSVG(config): string
src/marble/render-higher-order.ts   — renderHigherOrderSVG(config): string
src/marble/configs/index.ts         — registry: Record<string, MarbleEntry>
src/marble/configs/<operatorName>.ts — one config file per operator
```

### Marble registry type

```typescript
type MarbleEntry =
  | { kind: 'first-order';  config: FirstOrderDiagramConfig }
  | { kind: 'higher-order'; config: MarbleDiagramConfig }

const marbleRegistry: Record<string, MarbleEntry> = { ... }

export function getMarbleSVG(operatorName: string): string | null
```

`getMarbleSVG` looks up the registry, dispatches to the right renderer, returns the SVG string (or `null` if no config exists for that operator).

### Config sources

- **Higher-order operators** (switchMap, mergeMap, concatMap, exhaustMap): port existing configs from `rxjs-operator-documentation/docs/components/configs/`
- **First-order operators** (~26 remaining tree operators): write fresh `FirstOrderDiagramConfig` objects

### SVG renderer design

Both renderers are pure functions: `(config) => string`. They reproduce the same SVG output as the Vue components — same layout constants, same color conventions, same legend. The SVG string is injected via `innerHTML` in the detail renderer.

---

## Section 3 — Content Data

### Extraction script

`scripts/extract-explanations.ts` — a one-time Node/tsx script:

1. Reads every `.md` from `C:\Users\HP\Web\Frontend\rxjs\rxjs-operator-explain-claude\`
2. Extracts four sections by heading marker:

| Heading | Extracted field | Type |
|---|---|---|
| `#### Primary Code Sample` | `code` | `string` (fenced block content, stripped of ` ``` `) |
| `#### Gotchas` | `gotchas` | `string[]` (numbered list items, stripped of leading `1. ` etc.) |
| `#### Related Operators` | `related` | `string` (raw markdown table) |
| `#### Decision Rule` | `rule` | `string` (blockquote text, stripped of leading `> `) |

3. Writes `src/data/explanations.ts`:

```typescript
export interface OperatorExplanation {
  code:    string
  gotchas: string[]
  related: string
  rule:    string
}

export const explanations: Record<string, OperatorExplanation> = { ... }
```

The output file is committed to the repo. Re-run the script when the rxjs-explain cache is updated.

### npm script

Add to `package.json`:

```json
"extract-explanations": "npx tsx scripts/extract-explanations.ts"
```

---

## Section 4 — Detail View UI

### New file: `src/ui/detail.ts`

Exports `renderDetail(container: HTMLElement, operatorName: string, oneliner: string): void`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to results                          switchMap    │  header
├─────────────────────────────────────────────────────────┤
│  Cancels the active inner Observable when a new source  │  one-liner
│  value arrives.                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Gold standard SVG marble — full width, inline]        │  always visible
│                                                         │
├─────────────────────────────────────────────────────────┤
│  // Scenario: search typeahead                          │  always visible
│  const query$ = fromEvent(input, 'input').pipe(         │  <pre><code> block
│    switchMap(q => searchApi(q))                         │
│  )                                                      │
├─────────────────────────────────────────────────────────┤
│  ▶ Gotchas (2)                                          │  <details> expandable
│  ▶ Related operators                                    │  <details> expandable
│                                                         │
│  Full docs →                                            │  secondary wiki link
└─────────────────────────────────────────────────────────┘
```

### Event wiring

- Back button → `action$.next({ kind: 'close-detail' })`
- Operator name button in `renderLeaf` → `action$.next({ kind: 'open-detail', operatorName, oneliner })`
- `renderPanel` checks `state.detailView` first; if set, delegates to `renderDetail`

### Expandable sections

Native `<details>` / `<summary>` HTML — no JavaScript expand/collapse logic needed.

---

## Section 5 — File Map

### New files

| File | Purpose |
|---|---|
| `src/marble/marble.types.ts` | Ported TypeScript interfaces |
| `src/marble/render-first-order.ts` | SVG generator for first-order operators |
| `src/marble/render-higher-order.ts` | SVG generator for higher-order operators |
| `src/marble/configs/index.ts` | Marble registry + `getMarbleSVG()` |
| `src/marble/configs/<operatorName>.ts` | One file per operator (~30 total) |
| `src/data/explanations.ts` | Extracted code/gotchas/related/rule per operator |
| `src/ui/detail.ts` | Detail view renderer |
| `scripts/extract-explanations.ts` | One-time content extraction script |

### Modified files

| File | Change |
|---|---|
| `src/tree/tree.types.ts` | Add `DetailView` interface + `detailView` field; add 2 action variants |
| `src/state/tree.reducer.ts` | Handle `open-detail`, `close-detail`; clear `detailView` in `back` + `reset` |
| `src/ui/panel.ts` | Route to `renderDetail` when `detailOperator` set; operator name → `<button>` |
| `src/style.css` | Detail panel styles |

### Unchanged files

`main.ts`, `sidebar.ts`, `tree.config.ts`, `tree.state.ts`, `tree.reducer.test.ts`

---

## Testing

- `src/state/tree.reducer.ts` — extend existing tests to cover `open-detail` / `close-detail` / `back`-clears-detailView
- `src/marble/render-first-order.ts` and `render-higher-order.ts` — unit test: given a known config, output contains expected SVG elements (operator name, circle counts)
- `scripts/extract-explanations.ts` — test against a known fixture `.md` file
