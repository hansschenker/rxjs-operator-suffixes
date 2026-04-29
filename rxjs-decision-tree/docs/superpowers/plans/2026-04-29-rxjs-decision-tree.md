# RxJS Decision Tree Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a vanilla TypeScript + RxJS interactive decision tree that guides developers to the right RxJS operator across 11 branches, with a sidebar tree overview and a step-by-step main panel.

**Architecture:** Data-driven MVU — the tree is a static TypeScript object graph (`tree.config.ts`), navigation state flows through `Subject<Action> → scan(reducer) → state$`, and two independent DOM renderers (`sidebar.ts`, `panel.ts`) subscribe to `state$`. The only coupling is `action$.next(...)` called from click handlers.

**Tech Stack:** TypeScript 5.9 (strict), RxJS 7.8, Vite 7, Vitest 4, no framework.

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `src/tree/tree.types.ts` | Create | All TypeScript interfaces: `TreeNode`, `QuestionNode`, `LeafNode`, `Branch`, `OperatorResult`, `TreeState`, `BreadcrumbStep`, `Action` |
| `src/tree/tree.config.ts` | Create | Full tree object graph — 11 branches, ROOT export, WIKI_BASE constant |
| `src/state/tree.state.ts` | Create | `action$`, `treeReducer` (exported pure fn), `state$` |
| `src/ui/sidebar.ts` | Create | Renders the full tree from ROOT, highlights active path |
| `src/ui/panel.ts` | Create | Renders current question or leaf result |
| `src/main.ts` | Replace | Wires `state$` subscriptions to sidebar and panel |
| `src/style.css` | Replace | Dark two-panel layout |
| `index.html` | Modify | Two-panel shell: header, sidebar `<aside>`, main `<main>` |
| `src/counter.ts` | Delete | Vite scaffold leftover |
| `src/typescript.svg` | Delete | Vite scaffold leftover |
| `vitest.config.ts` | Create | Vitest with node environment |
| `src/state/tree.state.test.ts` | Create | Pure reducer tests |

---

## Task 1: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/state/tree.state.test.ts` (placeholder)

- [ ] **Step 1: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 2: Create placeholder test file**

```typescript
// src/state/tree.state.test.ts
import { describe } from 'vitest'

describe('treeReducer', () => {
  // tests added in Task 3
})
```

- [ ] **Step 3: Verify Vitest runs**

```bash
npx vitest run
```

Expected: `1 test file | 0 tests | 0 failed`

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts src/state/tree.state.test.ts
git commit -m "feat: configure Vitest"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/tree/tree.types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/tree/tree.types.ts
export type TreeNode = QuestionNode | LeafNode

export interface QuestionNode {
  kind:     'question'
  id:       string
  question: string
  hint?:    string
  branches: Branch[]
}

export interface Branch {
  label: string
  next:  TreeNode
}

export interface LeafNode {
  kind:      'leaf'
  id:        string
  operators: OperatorResult[]
}

export interface OperatorResult {
  name:     string
  oneliner: string
  wikiPath: string
  primary:  boolean
}

export interface TreeState {
  currentNode: TreeNode
  history:     TreeNode[]
  breadcrumb:  BreadcrumbStep[]
}

export interface BreadcrumbStep {
  nodeId: string
  label:  string
}

export type Action =
  | { kind: 'answer'; next: TreeNode; label: string }
  | { kind: 'back' }
  | { kind: 'reset' }
```

- [ ] **Step 2: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/tree/tree.types.ts
git commit -m "feat: add tree TypeScript types"
```

---

## Task 3: treeReducer — TDD

**Files:**
- Create: `src/state/tree.state.ts`
- Modify: `src/state/tree.state.test.ts`

- [ ] **Step 1: Write the failing tests**

Replace `src/state/tree.state.test.ts`:

```typescript
// src/state/tree.state.test.ts
import { describe, test, expect } from 'vitest'
import { treeReducer } from './tree.state'
import type { TreeState, QuestionNode, LeafNode } from '../tree/tree.types'

const MOCK_LEAF: LeafNode = {
  kind: 'leaf',
  id: 'mock-leaf',
  operators: [{ name: 'of', oneliner: 'Emit values.', wikiPath: '/operators/of', primary: true }],
}

const MOCK_ROOT: QuestionNode = {
  kind: 'question',
  id: 'mock-root',
  question: 'Test question?',
  branches: [{ label: 'Answer A', next: MOCK_LEAF }],
}

const initial: TreeState = {
  currentNode: MOCK_ROOT,
  history:     [],
  breadcrumb:  [],
}

describe('treeReducer', () => {
  test('answer moves to next node, pushes history and breadcrumb', () => {
    const branch = MOCK_ROOT.branches[0]
    const next = treeReducer(initial, { kind: 'answer', next: branch.next, label: branch.label })

    expect(next.currentNode).toBe(MOCK_LEAF)
    expect(next.history).toEqual([MOCK_ROOT])
    expect(next.breadcrumb).toEqual([{ nodeId: 'mock-root', label: 'Answer A' }])
  })

  test('back at root is a no-op (returns same state reference)', () => {
    expect(treeReducer(initial, { kind: 'back' })).toBe(initial)
  })

  test('back after answer returns to previous node', () => {
    const afterAnswer = treeReducer(initial, {
      kind: 'answer',
      next: MOCK_LEAF,
      label: 'Answer A',
    })
    const afterBack = treeReducer(afterAnswer, { kind: 'back' })

    expect(afterBack.currentNode).toBe(MOCK_ROOT)
    expect(afterBack.history).toHaveLength(0)
    expect(afterBack.breadcrumb).toHaveLength(0)
  })

  test('reset returns the initial state object', () => {
    const afterAnswer = treeReducer(initial, {
      kind: 'answer',
      next: MOCK_LEAF,
      label: 'Answer A',
    })
    const afterReset = treeReducer(afterAnswer, { kind: 'reset' })

    expect(afterReset.currentNode.id).toBe('mock-root')
    expect(afterReset.history).toHaveLength(0)
    expect(afterReset.breadcrumb).toHaveLength(0)
  })

  test('breadcrumb length always equals history length', () => {
    const s1 = treeReducer(initial, { kind: 'answer', next: MOCK_LEAF, label: 'A' })
    expect(s1.breadcrumb.length).toBe(s1.history.length)
    const s2 = treeReducer(s1, { kind: 'back' })
    expect(s2.breadcrumb.length).toBe(s2.history.length)
  })
})
```

- [ ] **Step 2: Run to confirm tests fail**

```bash
npx vitest run
```

Expected: FAIL — `treeReducer` not found.

- [ ] **Step 3: Create the state file with reducer and streams**

```typescript
// src/state/tree.state.ts
import { Subject } from 'rxjs'
import { scan, startWith, shareReplay } from 'rxjs'
import type { Action, TreeState } from '../tree/tree.types'

// ROOT is imported lazily to avoid a circular dep during testing.
// Tests supply their own initial state — they do not import ROOT.
import { ROOT } from '../tree/tree.config'

export const action$ = new Subject<Action>()

const initial: TreeState = {
  currentNode: ROOT,
  history:     [],
  breadcrumb:  [],
}

export function treeReducer(state: TreeState, action: Action): TreeState {
  switch (action.kind) {
    case 'answer':
      return {
        currentNode: action.next,
        history:     [...state.history, state.currentNode],
        breadcrumb:  [...state.breadcrumb, { nodeId: state.currentNode.id, label: action.label }],
      }
    case 'back':
      if (state.history.length === 0) return state
      return {
        currentNode: state.history.at(-1)!,
        history:     state.history.slice(0, -1),
        breadcrumb:  state.breadcrumb.slice(0, -1),
      }
    case 'reset':
      return initial
  }
}

export const state$ = action$.pipe(
  scan(treeReducer, initial),
  startWith(initial),
  shareReplay(1),
)
```

> **Note:** `tree.state.ts` imports `ROOT` from `tree.config.ts` (Task 4). The tests do not import `tree.state.ts` directly; they import only `treeReducer` — which is fine because the test file supplies its own `initial` state object without referencing `ROOT`.

Wait — the tests DO import from `./tree.state`, which will trigger the `ROOT` import. To avoid this, export `treeReducer` from a separate file. Revise as follows:

**Revised plan:** split into two files:

`src/state/tree.reducer.ts` — pure reducer, no ROOT dependency:

```typescript
// src/state/tree.reducer.ts
import type { Action, TreeState } from '../tree/tree.types'

export function treeReducer(state: TreeState, action: Action): TreeState {
  switch (action.kind) {
    case 'answer':
      return {
        currentNode: action.next,
        history:     [...state.history, state.currentNode],
        breadcrumb:  [...state.breadcrumb, { nodeId: state.currentNode.id, label: action.label }],
      }
    case 'back':
      if (state.history.length === 0) return state
      return {
        currentNode: state.history.at(-1)!,
        history:     state.history.slice(0, -1),
        breadcrumb:  state.breadcrumb.slice(0, -1),
      }
    case 'reset':
      return { currentNode: action.root, history: [], breadcrumb: [] }
  }
}
```

Actually that makes `reset` need ROOT too. Simplest fix: keep them together but make the test not import from `tree.state` — instead import from a separate `tree.reducer.ts`.

**Final structure:**

- `src/state/tree.reducer.ts` — exports `treeReducer` only, no RxJS, no ROOT import
- `src/state/tree.state.ts` — imports reducer + ROOT, creates `action$`, `state$`
- `src/state/tree.state.test.ts` — imports from `tree.reducer.ts` only

Create `src/state/tree.reducer.ts`:

```typescript
// src/state/tree.reducer.ts
import type { Action, TreeState } from '../tree/tree.types'

let _initial: TreeState | null = null

export function setInitial(state: TreeState): void {
  _initial = state
}

export function treeReducer(state: TreeState, action: Action): TreeState {
  switch (action.kind) {
    case 'answer':
      return {
        currentNode: action.next,
        history:     [...state.history, state.currentNode],
        breadcrumb:  [...state.breadcrumb, { nodeId: state.currentNode.id, label: action.label }],
      }
    case 'back':
      if (state.history.length === 0) return state
      return {
        currentNode: state.history.at(-1)!,
        history:     state.history.slice(0, -1),
        breadcrumb:  state.breadcrumb.slice(0, -1),
      }
    case 'reset':
      return _initial ?? state
  }
}
```

This is getting complicated. Simplest approach: keep one file, but use a **factory** that receives `initial`:

```typescript
// src/state/tree.reducer.ts
import type { Action, TreeState } from '../tree/tree.types'

export function makeReducer(initial: TreeState) {
  return function treeReducer(state: TreeState, action: Action): TreeState {
    switch (action.kind) {
      case 'answer':
        return {
          currentNode: action.next,
          history:     [...state.history, state.currentNode],
          breadcrumb:  [...state.breadcrumb, { nodeId: state.currentNode.id, label: action.label }],
        }
      case 'back':
        if (state.history.length === 0) return state
        return {
          currentNode: state.history.at(-1)!,
          history:     state.history.slice(0, -1),
          breadcrumb:  state.breadcrumb.slice(0, -1),
        }
      case 'reset':
        return initial
    }
  }
}
```

Tests use `makeReducer(mockInitial)`. State module uses `makeReducer(realInitial)`. Clean, no circular deps.

Create both files:

```typescript
// src/state/tree.reducer.ts
import type { Action, TreeState } from '../tree/tree.types'

export function makeReducer(initial: TreeState) {
  return function treeReducer(state: TreeState, action: Action): TreeState {
    switch (action.kind) {
      case 'answer':
        return {
          currentNode: action.next,
          history:     [...state.history, state.currentNode],
          breadcrumb:  [...state.breadcrumb, { nodeId: state.currentNode.id, label: action.label }],
        }
      case 'back':
        if (state.history.length === 0) return state
        return {
          currentNode: state.history.at(-1)!,
          history:     state.history.slice(0, -1),
          breadcrumb:  state.breadcrumb.slice(0, -1),
        }
      case 'reset':
        return initial
    }
  }
}
```

```typescript
// src/state/tree.state.ts
import { Subject } from 'rxjs'
import { scan, startWith, shareReplay } from 'rxjs'
import { ROOT } from '../tree/tree.config'
import { makeReducer } from './tree.reducer'
import type { Action, TreeState } from '../tree/tree.types'

export { action$ as _action$ }   // not needed — remove

export const action$ = new Subject<Action>()

export const initial: TreeState = {
  currentNode: ROOT,
  history:     [],
  breadcrumb:  [],
}

const treeReducer = makeReducer(initial)

export const state$ = action$.pipe(
  scan(treeReducer, initial),
  startWith(initial),
  shareReplay(1),
)
```

Update test file to import from `tree.reducer`:

```typescript
// src/state/tree.state.test.ts
import { describe, test, expect } from 'vitest'
import { makeReducer } from './tree.reducer'
import type { TreeState, QuestionNode, LeafNode } from '../tree/tree.types'

const MOCK_LEAF: LeafNode = {
  kind: 'leaf',
  id: 'mock-leaf',
  operators: [{ name: 'of', oneliner: 'Emit values.', wikiPath: '/operators/of', primary: true }],
}

const MOCK_ROOT: QuestionNode = {
  kind: 'question',
  id: 'mock-root',
  question: 'Test question?',
  branches: [{ label: 'Answer A', next: MOCK_LEAF }],
}

const mockInitial: TreeState = {
  currentNode: MOCK_ROOT,
  history:     [],
  breadcrumb:  [],
}

const treeReducer = makeReducer(mockInitial)

describe('treeReducer', () => {
  test('answer moves to next node, pushes history and breadcrumb', () => {
    const branch = MOCK_ROOT.branches[0]
    const next = treeReducer(mockInitial, { kind: 'answer', next: branch.next, label: branch.label })

    expect(next.currentNode).toBe(MOCK_LEAF)
    expect(next.history).toEqual([MOCK_ROOT])
    expect(next.breadcrumb).toEqual([{ nodeId: 'mock-root', label: 'Answer A' }])
  })

  test('back at root is a no-op (returns same state reference)', () => {
    expect(treeReducer(mockInitial, { kind: 'back' })).toBe(mockInitial)
  })

  test('back after answer returns to previous node', () => {
    const afterAnswer = treeReducer(mockInitial, {
      kind: 'answer',
      next: MOCK_LEAF,
      label: 'Answer A',
    })
    const afterBack = treeReducer(afterAnswer, { kind: 'back' })

    expect(afterBack.currentNode).toBe(MOCK_ROOT)
    expect(afterBack.history).toHaveLength(0)
    expect(afterBack.breadcrumb).toHaveLength(0)
  })

  test('reset returns initial state', () => {
    const afterAnswer = treeReducer(mockInitial, {
      kind: 'answer',
      next: MOCK_LEAF,
      label: 'Answer A',
    })
    const afterReset = treeReducer(afterAnswer, { kind: 'reset' })

    expect(afterReset).toBe(mockInitial)
  })

  test('breadcrumb length always equals history length', () => {
    const s1 = treeReducer(mockInitial, { kind: 'answer', next: MOCK_LEAF, label: 'A' })
    expect(s1.breadcrumb.length).toBe(s1.history.length)
    const s2 = treeReducer(s1, { kind: 'back' })
    expect(s2.breadcrumb.length).toBe(s2.history.length)
  })
})
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run
```

Expected: `5 tests passed`.

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/state/tree.reducer.ts src/state/tree.state.ts src/state/tree.state.test.ts
git commit -m "feat: add treeReducer (TDD) and state$ stream"
```

---

## Task 4: Tree Config — Create & One Observable Branches

**Files:**
- Create: `src/tree/tree.config.ts`

> **Note:** `tree.state.ts` (Task 3) imports `ROOT` from this file. Create this file before running `tsc` again.

- [ ] **Step 1: Create tree.config.ts with leaf helper and Create branch**

```typescript
// src/tree/tree.config.ts
import type { QuestionNode, LeafNode, OperatorResult } from './tree.types'

export const WIKI_BASE = 'http://localhost:5174'  // local VitePress wiki; update for prod

// ── Helper ─────────────────────────────────────────────────────────────────
function leaf(id: string, operators: OperatorResult[]): LeafNode {
  return { kind: 'leaf', id, operators }
}

function op(name: string, oneliner: string, wikiPath: string, primary = true): OperatorResult {
  return { name, oneliner, wikiPath, primary }
}

// ── ① Create ───────────────────────────────────────────────────────────────
const CREATE: QuestionNode = {
  kind: 'question',
  id: 'create',
  question: 'What is your source?',
  hint: 'The nature of the data source determines the creation operator.',
  branches: [
    {
      label: 'Single or multiple static values',
      next: leaf('create-of', [
        op('of', 'Emit a fixed sequence of values then complete.', '/operators/of'),
        op('from', 'Convert an array, iterable, or Promise into an Observable.', '/operators/from', false),
      ]),
    },
    {
      label: 'Array, iterable, or Promise',
      next: leaf('create-from', [
        op('from', 'Convert an array, iterable, or Promise into an Observable.', '/operators/from'),
      ]),
    },
    {
      label: 'DOM event or Node.js EventEmitter',
      next: leaf('create-fromEvent', [
        op('fromEvent', 'Create an Observable from DOM or Node.js events.', '/operators/fromEvent'),
      ]),
    },
    {
      label: 'Repeating timer or interval',
      next: leaf('create-interval', [
        op('interval', 'Emit an incrementing number on a fixed time interval.', '/operators/interval'),
        op('timer', 'Emit after an initial delay, then optionally on an interval.', '/operators/timer', false),
      ]),
    },
    {
      label: 'Custom subscribe / unsubscribe logic',
      next: leaf('create-observable', [
        op('new Observable()', 'Define custom subscribe logic from scratch.', '/operators/Observable'),
      ]),
    },
    {
      label: 'Condition or deferred factory (different Observable per subscriber)',
      next: leaf('create-defer', [
        op('defer', 'Create a fresh Observable for each subscriber via a factory function.', '/operators/defer'),
        op('iif', 'Subscribe to one of two Observables based on a boolean condition.', '/operators/iif', false),
      ]),
    },
    {
      label: 'Completes immediately without emitting any value',
      next: leaf('create-empty', [
        op('EMPTY', 'An Observable that completes immediately without emitting.', '/operators/EMPTY'),
      ]),
    },
    {
      label: 'Never emits, errors, or completes',
      next: leaf('create-never', [
        op('NEVER', 'An Observable that never emits, errors, or completes.', '/operators/NEVER'),
      ]),
    },
  ],
}

// ── ② One Observable — value query sub-nodes ───────────────────────────────
const ONE_VALUES_NONLOSSY: QuestionNode = {
  kind: 'question',
  id: 'one-values-nonlossy',
  question: 'What transformation do you need?',
  branches: [
    {
      label: 'Change the shape or type of each value',
      next: leaf('one-values-map', [
        op('map', 'Apply a projection function to each emitted value.', '/operators/map'),
      ]),
    },
    {
      label: 'Accumulate state and emit each intermediate result',
      next: leaf('one-values-scan', [
        op('scan', 'Apply an accumulator and emit the running result after each value.', '/operators/scan'),
      ]),
    },
    {
      label: 'Reduce all values to one, emitted when the source completes',
      next: leaf('one-values-reduce', [
        op('reduce', 'Apply an accumulator and emit a single result on completion.', '/operators/reduce'),
        op('toArray', 'Collect all values into a single array emitted on completion.', '/operators/toArray', false),
        op('count', 'Emit the total count of values when the source completes.', '/operators/count', false),
      ]),
    },
    {
      label: 'Expand each value into multiple inner emissions',
      next: leaf('one-values-expand', [
        op('mergeMap', 'Map each value to an inner Observable and merge all emissions.', '/operators/mergeMap'),
        op('concatMap', 'Map each value to an inner Observable, concat in order.', '/operators/concatMap', false),
      ]),
    },
  ],
}

const ONE_VALUES: QuestionNode = {
  kind: 'question',
  id: 'one-values',
  question: 'Lossy (filter / drop) or non-lossy (transform all values)?',
  hint: 'Lossy: some emitted values are discarded. Non-lossy: every value is kept and transformed.',
  branches: [
    {
      label: 'Lossy — pass only values that match a predicate',
      next: leaf('one-values-filter', [
        op('filter', 'Pass only values that satisfy a predicate — others are dropped.', '/operators/filter'),
        op('distinctUntilChanged', 'Drop consecutive duplicates — emit only when the value changes.', '/operators/distinctUntilChanged', false),
        op('distinct', 'Drop all previously-seen values — emit only new ones.', '/operators/distinct', false),
      ]),
    },
    {
      label: 'Non-lossy — transform or accumulate all values',
      next: ONE_VALUES_NONLOSSY,
    },
  ],
}

const ONE_TIMING_LOSSY: QuestionNode = {
  kind: 'question',
  id: 'one-timing-lossy',
  question: 'What timing strategy? (all drop some values)',
  branches: [
    {
      label: 'Wait for silence — emit the last value after a quiet period',
      next: leaf('one-timing-debounce', [
        op('debounceTime', 'Emit only after the source has been silent for a specified duration.', '/operators/debounceTime'),
        op('debounce', 'Like debounceTime but silence duration is controlled by an Observable.', '/operators/debounce', false),
      ]),
    },
    {
      label: 'First value in a time window wins, ignore the rest',
      next: leaf('one-timing-throttle', [
        op('throttleTime', 'Emit the first value then ignore further values for a time window.', '/operators/throttleTime'),
        op('throttle', 'Like throttleTime but the window is controlled by an Observable.', '/operators/throttle', false),
      ]),
    },
    {
      label: 'Last value in a time window wins (trailing edge)',
      next: leaf('one-timing-audit', [
        op('auditTime', 'Emit the most recent value after a time window elapses.', '/operators/auditTime'),
        op('sampleTime', 'Emit the most recent value at regular time intervals.', '/operators/sampleTime', false),
        op('sample', 'Emit the most recent value whenever a notifier Observable emits.', '/operators/sample', false),
      ]),
    },
  ],
}

const ONE_TIMING_NONLOSSY: QuestionNode = {
  kind: 'question',
  id: 'one-timing-nonlossy',
  question: 'Buffer into arrays, window into Observables, or delay all?',
  branches: [
    {
      label: 'Collect values into arrays at regular intervals',
      next: leaf('one-timing-buffer', [
        op('bufferTime', 'Collect values into arrays emitted at regular time intervals.', '/operators/bufferTime'),
        op('bufferCount', 'Collect values into arrays of a fixed size.', '/operators/bufferCount', false),
        op('buffer', 'Collect into arrays, closing each when a notifier emits.', '/operators/buffer', false),
      ]),
    },
    {
      label: 'Window values into inner Observables',
      next: leaf('one-timing-window', [
        op('windowTime', 'Emit inner Observables containing values from a time window.', '/operators/windowTime'),
        op('windowCount', 'Emit inner Observables containing a fixed number of values.', '/operators/windowCount', false),
      ]),
    },
    {
      label: 'Delay all emissions by a fixed amount',
      next: leaf('one-timing-delay', [
        op('delay', 'Shift all emissions forward in time by a fixed duration.', '/operators/delay'),
        op('delayWhen', 'Delay each emission by a duration determined by a per-value Observable.', '/operators/delayWhen', false),
      ]),
    },
  ],
}

const ONE_TIMING: QuestionNode = {
  kind: 'question',
  id: 'one-timing',
  question: 'Lossy (rate-limit, drop some) or non-lossy (buffer / delay all)?',
  branches: [
    {
      label: 'Lossy — only some values survive the time constraint',
      next: ONE_TIMING_LOSSY,
    },
    {
      label: 'Non-lossy — keep all values, reshape their timing',
      next: ONE_TIMING_NONLOSSY,
    },
  ],
}

const ONE_QUERY: QuestionNode = {
  kind: 'question',
  id: 'one-query',
  question: 'Query on the VALUES emitted, or on the TIMING of emissions?',
  hint: 'Values: you care about what is emitted. Timing: you care about when it is emitted.',
  branches: [
    { label: 'Values — what is emitted', next: ONE_VALUES },
    { label: 'Timing — when it is emitted', next: ONE_TIMING },
  ],
}

// ── ③ One Observable — Lifecycle ───────────────────────────────────────────
const LIFECYCLE: QuestionNode = {
  kind: 'question',
  id: 'lifecycle',
  question: 'How should the subscription end or be bounded?',
  hint: 'Control when to stop receiving values — completion, condition, or notifier.',
  branches: [
    {
      label: 'After a fixed number of values',
      next: leaf('lifecycle-take', [
        op('take(n)', 'Complete after emitting exactly n values.', '/operators/take'),
        op('first', 'Take only the first value (or first matching value) then complete.', '/operators/first', false),
        op('last', 'Emit only the last value when the source completes.', '/operators/last', false),
      ]),
    },
    {
      label: 'While a condition holds true',
      next: leaf('lifecycle-takeWhile', [
        op('takeWhile', 'Emit values while a predicate returns true, then complete.', '/operators/takeWhile'),
      ]),
    },
    {
      label: 'Until a notifier Observable emits',
      next: leaf('lifecycle-takeUntil', [
        op('takeUntil', 'Complete when a notifier Observable emits its first value.', '/operators/takeUntil'),
      ]),
    },
    {
      label: 'Skip values at the start of the stream',
      next: leaf('lifecycle-skip', [
        op('skip(n)', 'Ignore the first n values then pass all subsequent values through.', '/operators/skip'),
        op('skipWhile', 'Skip values while a predicate returns true, then pass all through.', '/operators/skipWhile', false),
        op('skipUntil', 'Skip values until a notifier emits, then pass all through.', '/operators/skipUntil', false),
      ]),
    },
  ],
}

// ── One Observable — top-level branch ─────────────────────────────────────
const ONE: QuestionNode = {
  kind: 'question',
  id: 'one',
  question: 'What kind of operation on the single Observable?',
  branches: [
    { label: 'Query or transform values / timing', next: ONE_QUERY },
    { label: 'Control subscription lifecycle (take, skip, complete when…)', next: LIFECYCLE },
  ],
}
```

- [ ] **Step 2: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/tree/tree.config.ts
git commit -m "feat: add tree config — Create and One Observable branches"
```

---

## Task 5: Tree Config — Many, Nested, Error, Multicast

**Files:**
- Modify: `src/tree/tree.config.ts` (append before ROOT)

- [ ] **Step 1: Add Many, Nested, Error, Multicast nodes**

Append to `src/tree/tree.config.ts` after the `ONE` node definition:

```typescript
// ── ④ Many Observables ─────────────────────────────────────────────────────
const MANY: QuestionNode = {
  kind: 'question',
  id: 'many',
  question: 'What matters most about combining them?',
  hint: 'Think about whether completion, emission order, or latest values is the goal.',
  branches: [
    {
      label: 'Wait for all to complete, then emit their combined last values',
      next: leaf('many-forkJoin', [
        op('forkJoin', 'Wait for all Observables to complete and emit their last values as a combined array.', '/operators/forkJoin'),
      ]),
    },
    {
      label: 'Emit combined latest values whenever any source emits',
      next: leaf('many-combineLatest', [
        op('combineLatest', 'Emit the latest value from each source whenever any source emits.', '/operators/combineLatest'),
      ]),
    },
    {
      label: 'Emit from whichever source emits, interleaved',
      next: leaf('many-merge', [
        op('merge', 'Subscribe to all sources and emit values as they arrive from any of them.', '/operators/merge'),
      ]),
    },
    {
      label: 'Strict sequence — each starts only when the previous completes',
      next: leaf('many-concat', [
        op('concat', 'Subscribe to sources in order — next one starts only when previous completes.', '/operators/concat'),
      ]),
    },
    {
      label: 'Race — use only the fastest source, ignore the rest',
      next: leaf('many-race', [
        op('race', 'Subscribe to the first source to emit and unsubscribe from all others.', '/operators/race'),
      ]),
    },
    {
      label: 'Pair values by index position (like a zip file)',
      next: leaf('many-zip', [
        op('zip', 'Emit arrays pairing the nth value from each source by emission index.', '/operators/zip'),
      ]),
    },
    {
      label: 'Sample primary stream using secondary stream\'s timing',
      next: leaf('many-withLatestFrom', [
        op('withLatestFrom', 'When the primary emits, combine its value with the latest from a secondary stream.', '/operators/withLatestFrom'),
      ]),
    },
  ],
}

// ── ⑤ Nested Observable (Observable of Observables) ───────────────────────
const NESTED: QuestionNode = {
  kind: 'question',
  id: 'nested',
  question: 'Lossy (cancel or ignore some inner Observables) or non-lossy (process all)?',
  hint: 'Lossy strategies discard inner Observables. Non-lossy strategies process every one.',
  branches: [
    {
      label: 'Lossy — cancel the current inner when a new outer value arrives',
      next: leaf('nested-switchMap', [
        op('switchMap', 'Cancel the current inner Observable when a new outer value arrives — only the latest inner runs.', '/operators/switchMap'),
      ]),
    },
    {
      label: 'Lossy — ignore new outer values while an inner Observable is still active',
      next: leaf('nested-exhaustMap', [
        op('exhaustMap', 'Ignore new outer values while an inner Observable is still running.', '/operators/exhaustMap'),
      ]),
    },
    {
      label: 'Non-lossy — queue each inner and process them in strict order',
      next: leaf('nested-concatMap', [
        op('concatMap', 'Map each outer value to an inner Observable and concatenate — next inner starts only when previous completes.', '/operators/concatMap'),
      ]),
    },
    {
      label: 'Non-lossy — run all inner Observables concurrently',
      next: leaf('nested-mergeMap', [
        op('mergeMap', 'Map each outer value to an inner Observable and merge all emissions concurrently.', '/operators/mergeMap'),
      ]),
    },
  ],
}

// ── ⑥ Error Handling ───────────────────────────────────────────────────────
const ERROR: QuestionNode = {
  kind: 'question',
  id: 'error',
  question: 'What should happen when the stream errors?',
  branches: [
    {
      label: 'Recover by switching to a fallback Observable',
      next: leaf('error-catchError', [
        op('catchError', 'Intercept an error and replace the failed Observable with a fallback.', '/operators/catchError'),
      ]),
    },
    {
      label: 'Retry the source Observable',
      next: leaf('error-retry', [
        op('retry(n)', 'Resubscribe to the source Observable up to n times on error.', '/operators/retry'),
        op('retryWhen', 'Resubscribe when a notifier Observable emits — enables delay-based retry.', '/operators/retryWhen', false),
      ]),
    },
    {
      label: 'Continue seamlessly with the next Observable on error',
      next: leaf('error-onErrorResumeNext', [
        op('onErrorResumeNextWith', 'On error (or completion), continue seamlessly with the next provided Observable.', '/operators/onErrorResumeNextWith'),
      ]),
    },
    {
      label: 'Throw if no value arrives within a time limit',
      next: leaf('error-timeout', [
        op('timeout', 'Throw a TimeoutError if the source does not emit within the specified duration.', '/operators/timeout'),
      ]),
    },
  ],
}

// ── ⑦ Multicasting / Sharing ───────────────────────────────────────────────
const MULTICAST: QuestionNode = {
  kind: 'question',
  id: 'multicast',
  question: 'Do late subscribers need to receive a cached value immediately on subscription?',
  hint: 'Sharing makes multiple subscribers share one source execution instead of each triggering a new one.',
  branches: [
    {
      label: 'Yes — replay the last emitted value to late subscribers',
      next: leaf('multicast-shareReplay', [
        op('shareReplay(1)', 'Share the source execution and replay the last emitted value to new subscribers.', '/operators/shareReplay'),
      ]),
    },
    {
      label: 'No — share execution only, no replay needed',
      next: leaf('multicast-share', [
        op('share', 'Share the source execution among multiple subscribers — no value replay.', '/operators/share'),
      ]),
    },
  ],
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/tree/tree.config.ts
git commit -m "feat: add tree config — Many, Nested, Error, Multicast branches"
```

---

## Task 6: Tree Config — Aggregation, Conditional, Hot/Cold, Inspection, ROOT

**Files:**
- Modify: `src/tree/tree.config.ts` (append remaining nodes + ROOT export)

- [ ] **Step 1: Add remaining nodes and ROOT**

Append to `src/tree/tree.config.ts`:

```typescript
// ── ⑧ Aggregation ─────────────────────────────────────────────────────────
const AGGREGATION: QuestionNode = {
  kind: 'question',
  id: 'aggregation',
  question: 'Emit each accumulated step, or one final result when the stream completes?',
  branches: [
    {
      label: 'Emit each accumulated intermediate result (stream stays open)',
      next: leaf('aggregation-scan', [
        op('scan', 'Apply an accumulator and emit the running result after each source value.', '/operators/scan'),
      ]),
    },
    {
      label: 'Emit a single final result when the source completes',
      next: leaf('aggregation-reduce', [
        op('reduce', 'Apply an accumulator and emit a single result when the source completes.', '/operators/reduce'),
        op('toArray', 'Collect all values and emit them as a single array on completion.', '/operators/toArray', false),
        op('count', 'Emit the total count of emitted values when the source completes.', '/operators/count', false),
      ]),
    },
  ],
}

// ── ⑨ Conditional / Boolean ────────────────────────────────────────────────
const CONDITIONAL: QuestionNode = {
  kind: 'question',
  id: 'conditional',
  question: 'What yes/no question do you want to ask about the stream?',
  branches: [
    {
      label: 'Does every emitted value satisfy a condition?',
      next: leaf('conditional-every', [
        op('every', 'Emit true if all values pass the predicate, false as soon as one fails.', '/operators/every'),
      ]),
    },
    {
      label: 'Find the first value that matches a condition',
      next: leaf('conditional-find', [
        op('find', 'Emit the first value satisfying the predicate, then complete.', '/operators/find'),
        op('findIndex', 'Emit the index of the first value satisfying the predicate, then complete.', '/operators/findIndex', false),
      ]),
    },
    {
      label: 'Did the stream complete without emitting anything?',
      next: leaf('conditional-isEmpty', [
        op('isEmpty', 'Emit true if the source completes without emitting any values.', '/operators/isEmpty'),
        op('defaultIfEmpty', 'Emit a default value if the source completes without emitting.', '/operators/defaultIfEmpty', false),
      ]),
    },
    {
      label: 'Choose between two Observables based on a runtime condition',
      next: leaf('conditional-iif', [
        op('iif', 'Subscribe to one of two Observables based on a boolean condition at subscribe time.', '/operators/iif'),
      ]),
    },
  ],
}

// ── ⑩ Hot vs Cold / Subjects ───────────────────────────────────────────────
const HOT_COLD: QuestionNode = {
  kind: 'question',
  id: 'hotcold',
  question: 'What do you need from the Subject?',
  hint: 'Subjects are both Observables and Observers — they bridge imperative and reactive code.',
  branches: [
    {
      label: 'Dispatch values imperatively with no initial value',
      next: leaf('hotcold-Subject', [
        op('Subject', 'A multicast Observable that allows imperative dispatch via next().', '/subjects/Subject'),
      ]),
    },
    {
      label: 'Late subscribers need the current value immediately',
      next: leaf('hotcold-BehaviorSubject', [
        op('BehaviorSubject', 'Holds the current value and replays it immediately to new subscribers.', '/subjects/BehaviorSubject'),
      ]),
    },
    {
      label: 'Late subscribers need the last N emitted values',
      next: leaf('hotcold-ReplaySubject', [
        op('ReplaySubject(n)', 'Replay the last n emissions to any new subscriber.', '/subjects/ReplaySubject'),
      ]),
    },
    {
      label: 'Convert a cold Observable into a hot shared one',
      next: leaf('hotcold-share', [
        op('share()', 'Make a cold Observable hot by sharing one execution among all current subscribers.', '/operators/share'),
        op('shareReplay(1)', 'Make hot and replay the last value to late subscribers.', '/operators/shareReplay', false),
        op('publish', 'Multicast to a Subject — use with connect() for manual control.', '/operators/publish', false),
      ]),
    },
  ],
}

// ── ⑪ Inspection / Side Effects ────────────────────────────────────────────
const INSPECTION: QuestionNode = {
  kind: 'question',
  id: 'inspection',
  question: 'What do you need to inspect or intercept in the stream?',
  branches: [
    {
      label: 'Log or trigger a side effect without changing values',
      next: leaf('inspection-tap', [
        op('tap', 'Run a side effect (logging, debugging) at any point in the pipe without altering values.', '/operators/tap'),
      ]),
    },
    {
      label: 'Convert next/error/complete notifications into value objects',
      next: leaf('inspection-materialize', [
        op('materialize', 'Wrap each notification (next, error, complete) into a Notification<T> value object.', '/operators/materialize'),
      ]),
    },
    {
      label: 'Unwrap Notification objects back into stream signals',
      next: leaf('inspection-dematerialize', [
        op('dematerialize', 'Convert a stream of Notification objects back into a regular Observable stream.', '/operators/dematerialize'),
      ]),
    },
    {
      label: 'Run cleanup code when the stream ends for any reason',
      next: leaf('inspection-finalize', [
        op('finalize', 'Run a callback when the source completes, errors, or is unsubscribed — like try/finally for streams.', '/operators/finalize'),
      ]),
    },
  ],
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export const ROOT: QuestionNode = {
  kind: 'question',
  id: 'root',
  question: 'How many Observables do you have?',
  hint: 'The number of streams shapes every operator choice. Choose a concern on the left if none of the first four apply.',
  branches: [
    { label: 'None — I need to create an Observable', next: CREATE },
    { label: 'One Observable', next: ONE },
    { label: 'Many Observables to combine', next: MANY },
    { label: 'One that emits Observables (nested / higher-order)', next: NESTED },
    { label: 'Error handling', next: ERROR },
    { label: 'Multicasting — share one source among subscribers', next: MULTICAST },
    { label: 'Aggregation — fold or accumulate values', next: AGGREGATION },
    { label: 'Conditional — boolean query about the stream', next: CONDITIONAL },
    { label: 'Hot vs Cold — Subjects and sharing', next: HOT_COLD },
    { label: 'Inspection — tap into the stream without changing it', next: INSPECTION },
  ],
}
```

- [ ] **Step 2: Type-check and run tests**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: 0 type errors, 5 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/tree/tree.config.ts
git commit -m "feat: complete tree config — all 11 branches and ROOT"
```

---

## Task 7: HTML Layout + CSS

**Files:**
- Modify: `index.html`
- Replace: `src/style.css`
- Delete: `src/counter.ts`, `src/typescript.svg`

- [ ] **Step 1: Replace index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RxJS Decision Tree</title>
  </head>
  <body>
    <header class="site-header">
      <span class="logo">RxJS Decision Tree</span>
      <nav class="top-nav">
        <a href="#" id="nav-reset">↺ Start over</a>
      </nav>
    </header>
    <div class="app-layout">
      <aside id="sidebar" class="sidebar"></aside>
      <main id="panel" class="panel"></main>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Replace src/style.css**

```css
:root {
  --bg:           #0f172a;
  --surface:      #1e293b;
  --surface-2:    #334155;
  --text:         #e2e8f0;
  --text-muted:   #94a3b8;
  --text-dim:     #64748b;
  --accent:       #7c3aed;
  --accent-light: #a78bfa;
  --blue:         #0ea5e9;
  --blue-light:   #7dd3fc;
  --green:        #10b981;
  --green-light:  #86efac;
  --border:       #1e293b;
  --sidebar-w:    240px;
  --header-h:     52px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ─────────────────────────────────────────── */
.site-header {
  height: var(--header-h);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  gap: 2rem;
  flex-shrink: 0;
}

.logo {
  color: var(--accent-light);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

.top-nav a {
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.82rem;
  transition: color 0.12s;
}

.top-nav a:hover { color: var(--text-muted); }

/* ── Two-panel layout ────────────────────────────────── */
.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 0.75rem 0;
  display: flex;
  flex-direction: column;
}

.panel {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 2.5rem;
}

/* ── Sidebar items ───────────────────────────────────── */
.sidebar-item {
  padding: 0.28rem 0.75rem 0.28rem calc(0.75rem + var(--indent, 0) * 1rem);
  font-size: 0.76rem;
  color: var(--text-dim);
  line-height: 1.4;
  border-left: 2px solid transparent;
  transition: color 0.1s, border-color 0.1s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-item.on-path  { color: var(--text-muted); }
.sidebar-item.active   { color: var(--blue-light); border-left-color: var(--blue); background: rgba(14,165,233,0.07); }
.sidebar-item.active-leaf { color: var(--green-light); border-left-color: var(--green); background: rgba(16,185,129,0.07); }

.sidebar-reset {
  margin-top: auto;
  padding: 0.75rem 0.75rem 0.25rem;
  border-top: 1px solid var(--border);
}

.reset-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

.reset-btn:hover { color: var(--text-muted); }

/* ── Breadcrumb ──────────────────────────────────────── */
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
  margin-bottom: 1.75rem;
}

.bc-chip {
  background: var(--surface);
  color: var(--blue-light);
  padding: 0.18rem 0.55rem;
  border-radius: 12px;
  font-size: 0.7rem;
}

.bc-chip.current {
  background: var(--accent);
  color: white;
}

.bc-chip.result {
  background: var(--green);
  color: white;
}

.bc-sep { color: var(--text-dim); font-size: 0.78rem; }

/* ── Question view ───────────────────────────────────── */
.q-heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.35rem;
}

.q-hint {
  color: var(--text-dim);
  font-size: 0.82rem;
  margin-bottom: 1.5rem;
}

.answer-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  max-width: 560px;
}

.answer-btn {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--surface-2);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  text-align: left;
  cursor: pointer;
  font-size: 0.84rem;
  font-family: inherit;
  transition: border-color 0.12s, color 0.12s;
}

.answer-btn:hover {
  border-color: var(--accent);
  color: var(--accent-light);
}

/* ── Result / leaf view ──────────────────────────────── */
.result-primary {
  background: var(--surface);
  border-left: 3px solid var(--green);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  max-width: 560px;
}

.op-name {
  font-family: monospace;
  font-size: 1.15rem;
  color: var(--green-light);
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.op-oneliner {
  color: var(--text-muted);
  font-size: 0.84rem;
  margin-bottom: 0.5rem;
}

.wiki-link {
  color: var(--blue-light);
  font-size: 0.76rem;
  text-decoration: none;
}

.wiki-link:hover { text-decoration: underline; }

.result-alt {
  background: var(--surface);
  border-left: 3px solid var(--surface-2);
  border-radius: 8px;
  padding: 0.55rem 1rem;
  margin-bottom: 0.45rem;
  max-width: 560px;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.alt-name { font-family: monospace; font-size: 0.88rem; color: var(--text-muted); }
.alt-desc { font-size: 0.76rem; color: var(--text-dim); }
.alt-link { font-size: 0.7rem; color: var(--text-dim); text-decoration: none; margin-left: auto; }
.alt-link:hover { color: var(--blue-light); }

/* ── Nav actions ─────────────────────────────────────── */
.nav-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1.25rem;
}

.nav-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.76rem;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

.nav-btn:hover { color: var(--text-muted); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
```

- [ ] **Step 3: Delete scaffold leftovers**

```bash
rm src/counter.ts src/typescript.svg
```

- [ ] **Step 4: Verify dev server starts with no errors**

```bash
npm run dev
```

Open `http://localhost:5173`. Expect: blank dark two-panel page (no JS yet).

- [ ] **Step 5: Commit**

```bash
git add index.html src/style.css
git rm src/counter.ts src/typescript.svg
git commit -m "feat: two-panel HTML layout and dark theme CSS"
```

---

## Task 8: sidebar.ts

**Files:**
- Create: `src/ui/sidebar.ts`

- [ ] **Step 1: Create sidebar.ts**

```typescript
// src/ui/sidebar.ts
import { ROOT } from '../tree/tree.config'
import { action$ } from '../state/tree.state'
import type { TreeNode, TreeState } from '../tree/tree.types'

export function renderSidebar(container: HTMLElement, state: TreeState): void {
  const activeIds = new Set(state.breadcrumb.map(s => s.nodeId))

  container.innerHTML = `
    <div class="sidebar-tree">
      ${renderNode(ROOT, 0, activeIds, state.currentNode)}
    </div>
    <div class="sidebar-reset">
      <button class="reset-btn">↺ Start over</button>
    </div>
  `

  container.querySelector('.reset-btn')!.addEventListener('click', () => {
    action$.next({ kind: 'reset' })
  })
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

function renderNode(
  node: TreeNode,
  depth: number,
  activeIds: Set<string>,
  current: TreeNode,
): string {
  const isCurrent = node === current
  const isOnPath  = activeIds.has(node.id)
  const style     = `style="--indent: ${depth}"`

  if (node.kind === 'leaf') {
    const cls = `sidebar-item leaf${isCurrent ? ' active-leaf' : ''}`
    const label = node.operators[0].name
    return `<div class="${cls}" ${style}>● ${label}</div>`
  }

  const expanded = depth === 0 || isOnPath || isCurrent
  const arrow    = expanded ? '▼' : '▷'
  const label    = truncate(node.question, 30)
  const cls      = [
    'sidebar-item question',
    isCurrent ? 'active' : '',
    isOnPath  ? 'on-path' : '',
  ].filter(Boolean).join(' ')

  const children = expanded
    ? node.branches.map(b => renderNode(b.next, depth + 1, activeIds, current)).join('')
    : ''

  return `<div class="${cls}" ${style}>${arrow} ${label}</div>${children}`
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/ui/sidebar.ts
git commit -m "feat: sidebar renderer — full tree with active path highlight"
```

---

## Task 9: panel.ts

**Files:**
- Create: `src/ui/panel.ts`

- [ ] **Step 1: Create panel.ts**

```typescript
// src/ui/panel.ts
import { WIKI_BASE } from '../tree/tree.config'
import { action$ } from '../state/tree.state'
import type { TreeState, LeafNode, QuestionNode, OperatorResult } from '../tree/tree.types'

export function renderPanel(container: HTMLElement, state: TreeState): void {
  const { currentNode, breadcrumb, history } = state

  if (currentNode.kind === 'question') {
    renderQuestion(container, currentNode, breadcrumb, history.length)
  } else {
    renderLeaf(container, currentNode, breadcrumb, history.length)
  }
}

function renderBreadcrumb(
  breadcrumb: TreeState['breadcrumb'],
  terminalLabel: string,
  terminalClass: string,
): string {
  const chips = breadcrumb.map(step =>
    `<span class="bc-chip">${step.label}</span><span class="bc-sep">›</span>`
  ).join('')
  return `<div class="breadcrumb">${chips}<span class="bc-chip ${terminalClass}">${terminalLabel}</span></div>`
}

function renderQuestion(
  container: HTMLElement,
  node: QuestionNode,
  breadcrumb: TreeState['breadcrumb'],
  historyLen: number,
): void {
  const bc = renderBreadcrumb(breadcrumb, node.question, 'current')
  const hint = node.hint ? `<p class="q-hint">${node.hint}</p>` : ''
  const buttons = node.branches.map((branch, i) =>
    `<button class="answer-btn" data-branch="${i}">${branch.label}</button>`
  ).join('')

  container.innerHTML = `
    ${bc}
    <h1 class="q-heading">${node.question}</h1>
    ${hint}
    <div class="answer-list">${buttons}</div>
    <div class="nav-actions">
      <button class="nav-btn" id="back-btn" ${historyLen === 0 ? 'disabled' : ''}>← Back</button>
    </div>
  `

  container.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number((btn as HTMLButtonElement).dataset['branch'])
      const branch = node.branches[i]
      action$.next({ kind: 'answer', next: branch.next, label: branch.label })
    })
  })

  container.querySelector('#back-btn')?.addEventListener('click', () => {
    action$.next({ kind: 'back' })
  })
}

function renderOperator(op: OperatorResult, primary: boolean): string {
  const href = `${WIKI_BASE}${op.wikiPath}`
  if (primary) {
    return `
      <div class="result-primary">
        <div class="op-name">${op.name}</div>
        <div class="op-oneliner">${op.oneliner}</div>
        <a class="wiki-link" href="${href}" target="_blank" rel="noopener">
          Learn more in the RxJS wiki →
        </a>
      </div>`
  }
  return `
    <div class="result-alt">
      <span class="alt-name">${op.name}</span>
      <span class="alt-desc">— ${op.oneliner}</span>
      <a class="alt-link" href="${href}" target="_blank" rel="noopener">Wiki →</a>
    </div>`
}

function renderLeaf(
  container: HTMLElement,
  node: LeafNode,
  breadcrumb: TreeState['breadcrumb'],
  historyLen: number,
): void {
  const bc = renderBreadcrumb(breadcrumb, '✓ Result', 'result')
  const ops = node.operators.map(op => renderOperator(op, op.primary)).join('')

  container.innerHTML = `
    ${bc}
    ${ops}
    <div class="nav-actions">
      <button class="nav-btn" id="back-btn" ${historyLen === 0 ? 'disabled' : ''}>← Back</button>
      <button class="nav-btn" id="reset-btn">↺ Start over</button>
    </div>
  `

  container.querySelector('#back-btn')?.addEventListener('click', () => {
    action$.next({ kind: 'back' })
  })

  container.querySelector('#reset-btn')?.addEventListener('click', () => {
    action$.next({ kind: 'reset' })
  })
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/ui/panel.ts
git commit -m "feat: panel renderer — question and leaf result views"
```

---

## Task 10: main.ts — Wire Everything Up

**Files:**
- Replace: `src/main.ts`

- [ ] **Step 1: Replace src/main.ts**

```typescript
// src/main.ts
import './style.css'
import { state$, action$ } from './state/tree.state'
import { renderSidebar } from './ui/sidebar'
import { renderPanel } from './ui/panel'

const sidebar = document.getElementById('sidebar')!
const panel   = document.getElementById('panel')!
const navReset = document.getElementById('nav-reset')!

state$.subscribe(state => {
  renderSidebar(sidebar, state)
  renderPanel(panel, state)
})

navReset.addEventListener('click', e => {
  e.preventDefault()
  action$.next({ kind: 'reset' })
})
```

- [ ] **Step 2: Run type-check and tests**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: 0 errors, 5 tests passed.

- [ ] **Step 3: Start dev server and verify manually**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
- [ ] Root question `"How many Observables do you have?"` is displayed in the panel
- [ ] All 10 branches are shown as answer buttons
- [ ] Sidebar shows the full tree structure with ROOT expanded
- [ ] Clicking an answer navigates to the next question and the breadcrumb chip appears
- [ ] Back button returns to the previous question and removes the chip
- [ ] Navigating to a leaf shows the primary operator (green border), one-liner, and wiki link
- [ ] Alternative operators render muted below the primary
- [ ] Reset (header link, sidebar button, leaf panel button) returns to root
- [ ] Sidebar highlights the active path as you navigate

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 5: Commit**

```bash
git add src/main.ts
git commit -m "feat: wire state$ subscriptions — decision tree fully interactive"
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Task covering it |
|---|---|
| Purpose / dual audience (learners + experts) | Tasks 7–10: hint text, sidebar overview |
| Architecture: 3 layers | Tasks 2–10: types → state → UI |
| TypeScript types | Task 2 |
| treeReducer + MVU | Task 3 (TDD) |
| tree.config: all 11 branches | Tasks 4–6 |
| Sidebar: full tree + active path | Task 8 |
| Panel: question + leaf views | Task 9 |
| Breadcrumb chips | Task 9 (`renderBreadcrumb`) |
| Primary + secondary operators | Task 9 (`renderOperator`) |
| Wiki link | Task 9 (`WIKI_BASE + wikiPath`) |
| Back / Reset actions | Tasks 9–10 |
| Testing: reducer pure fn | Task 3 |
| No nested subscriptions | Task 10: one `state$.subscribe` drives both renderers |
| No framework | All tasks: vanilla TS + RxJS only |

**No placeholders:** All steps include actual code. ✓

**Type consistency:**
- `treeReducer` → `makeReducer` factory: used consistently in Task 3 and Task 6 (`tree.state.ts`)
- `renderSidebar(container, state)` in Task 8 matches call in Task 10
- `renderPanel(container, state)` in Task 9 matches call in Task 10
- `action$.next({ kind: 'reset' })` used consistently across Tasks 8, 9, 10
- `WIKI_BASE` exported from `tree.config.ts` (Task 4), imported in `panel.ts` (Task 9) ✓
