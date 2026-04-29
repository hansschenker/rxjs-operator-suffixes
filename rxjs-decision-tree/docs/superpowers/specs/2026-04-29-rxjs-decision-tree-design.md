# RxJS Decision Tree — Design Spec

**Date:** 2026-04-29  
**Status:** Approved  
**Project:** `rxjs-decision-tree`

---

## 1. Purpose & Audience

An interactive decision tree that guides developers to the right RxJS operator based on the nature of their problem. The tool serves two audiences simultaneously:

- **Learners** — explanatory mode: breadcrumb trail, hints on each question, full one-liner on results
- **Experts** — fast mode: sidebar shows the full tree structure at a glance; a few clicks reach any leaf

Both modes use the same UI. The sidebar tree gives experts spatial awareness of the entire operator space; the step-by-step main panel gives learners a focused, low-noise path.

---

## 2. Architecture

Three decoupled layers connected by a single observable stream.

```
tree.config.ts          ← pure data: nodes, branches, leaf operators
      ↓ read by
tree.state.ts           ← Subject<Action> → scan(reducer) → state$ (shareReplay)
      ↓ subscribed by
sidebar.ts              ← renders full tree, highlights active path
panel.ts                ← renders current question or result
      ↑ dispatches to
button click handlers   ← action$.next(...) — the only coupling point
```

### File structure

```
src/
  tree/
    tree.config.ts      ← all nodes, branches, and operator results
    tree.types.ts       ← TypeScript types for all shapes
  state/
    tree.state.ts       ← action$, state$, treeReducer (exported pure fn)
  ui/
    sidebar.ts          ← renders collapsible tree nav from config + state
    panel.ts            ← renders question or leaf result
    main.ts             ← wires all subscriptions, mounts to DOM
  style.css
index.html
```

---

## 3. TypeScript Data Model

### Node types

```typescript
type TreeNode = QuestionNode | LeafNode

interface QuestionNode {
  kind:     'question'
  id:       string          // e.g. 'root', 'one-values-lossy'
  question: string          // displayed as the main panel heading
  hint?:    string          // sub-text shown to learners
  branches: Branch[]
}

interface Branch {
  label: string             // answer button text
  next:  TreeNode           // inline child — tree is a real object graph, no ID lookups
}

interface LeafNode {
  kind:      'leaf'
  id:        string
  operators: OperatorResult[]   // first is primary, rest are alternatives
}

interface OperatorResult {
  name:     string          // e.g. 'switchMap'
  oneliner: string          // displayed in result panel
  wikiPath: string          // e.g. '/operators/switchMap' — relative to wiki base URL
  primary:  boolean         // primary = bold/green border; false = muted alternative
}
```

### State & actions

```typescript
interface TreeState {
  currentNode: TreeNode
  history:     TreeNode[]        // stack — enables Back navigation
  breadcrumb:  BreadcrumbStep[]  // answered steps shown as chips above the question
}

interface BreadcrumbStep {
  nodeId: string
  label:  string                 // the branch label the user chose
}

type Action =
  | { kind: 'answer'; next: TreeNode; label: string }
  | { kind: 'back' }
  | { kind: 'reset' }
```

---

## 4. State Management (MVU)

```typescript
// tree.state.ts
export const action$ = new Subject<Action>()

const initial: TreeState = {
  currentNode: ROOT,
  history:     [],
  breadcrumb:  [],
}

export function treeReducer(state: TreeState, action: Action): TreeState {
  switch (action.kind) {
    case 'answer': return {
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
    case 'reset': return initial
  }
}

export const state$ = action$.pipe(
  scan(treeReducer, initial),
  startWith(initial),
  shareReplay(1),
)
```

`treeReducer` is a plain exported function — Vitest tests require zero DOM setup and zero subscriptions.

---

## 5. UI Layout

**Two-panel layout** — sidebar (fixed left) + main panel (flex-fill right).

### Sidebar (`sidebar.ts`)

- Renders the full tree statically from `ROOT` in `tree.config.ts`
- Subscribes to `state$` to highlight the active path (breadcrumb trail)
- Collapsible branches — top-level nodes always visible; children expand as the user navigates
- Reset link at the bottom
- Active node marked with `●`; ancestors on the active path shown expanded

### Main panel (`panel.ts`)

- Subscribes to `state$`
- **Question view:**
  - Breadcrumb chips at the top (one chip per answered step)
  - Question heading + optional hint text
  - Answer buttons (one per branch)
  - Back link (disabled/hidden at root)
- **Result view (leaf):**
  - Breadcrumb chips + `✓ Result` terminal chip
  - Primary operator: name (`monospace`, green border), one-liner, `Learn more in the RxJS wiki →` link
  - 1–2 secondary alternatives: muted, name + brief label + wiki link
  - Back + Start over links

### Wiki link format

```typescript
// src/tree/tree.config.ts — top of file, one place to change
export const WIKI_BASE = 'http://localhost:5174'   // dev: local VitePress wiki server
                                                    // prod: update to deployed wiki URL
const href = `${WIKI_BASE}${operator.wikiPath}`
```

---

## 6. Complete Decision Tree — 11 Branches

### ① Create — No Observable yet

**Question:** What is the source?

| Answer | Primary | Alternatives |
|--------|---------|--------------|
| Single / multiple static values | `of` | `from([...])` |
| Array / iterable / Promise | `from` | |
| DOM event / EventEmitter | `fromEvent` | |
| Timer / interval | `interval` | `timer` |
| Custom subscribe logic | `new Observable()` | |
| Condition / deferred factory | `defer` | `iif` |
| Completes immediately | `EMPTY` | |
| Never emits | `NEVER` | |

---

### ② One Observable — Value queries

**Question:** Query on emitted VALUES or TIMING?

**→ Values — Lossy (filter / drop)**
- `filter` — predicate gate *(alt: `distinctUntilChanged`, `distinct`)*

**→ Values — Non-lossy**

| Answer | Primary | Alternatives |
|--------|---------|--------------|
| Change shape of each value | `map` | |
| Accumulate state, emit each step | `scan` | |
| Reduce to one value on complete | `reduce` | `toArray`, `count` |
| Expand each value into many | `mergeMap(x => of(a,b,c))` | |

**→ Timing — Lossy (rate-limit)**

| Answer | Primary | Alternatives |
|--------|---------|--------------|
| Wait for silence (last wins) | `debounceTime` | `debounce` |
| First in window wins | `throttleTime` | `throttle` |
| Last in window wins (trailing) | `auditTime` | `sampleTime`, `sample` |

**→ Timing — Non-lossy (buffer / delay)**

| Answer | Primary | Alternatives |
|--------|---------|--------------|
| Collect into arrays | `bufferTime` | `bufferCount`, `buffer` |
| Window into Observables | `windowTime` | `windowCount` |
| Delay all emissions | `delay` | `delayWhen` |

---

### ③ One Observable — Subscription Lifecycle

**Question:** How should the subscription end?

| Answer | Primary | Alternatives |
|--------|---------|--------------|
| After N values | `take(n)` | `first`, `last` |
| While condition holds | `takeWhile` | |
| When a notifier emits | `takeUntil` | |
| Skip N values at start | `skip(n)` | `skipWhile`, `skipUntil` |

---

### ④ Many Observables — Combination

**Question:** What matters — completion timing or latest values?

| Answer | Primary | Notes |
|--------|---------|-------|
| Wait for all to complete | `forkJoin` | Like `Promise.all` |
| Combined latest on any emission | `combineLatest` | |
| Emit from whichever emits | `merge` | |
| Strict sequence (one then next) | `concat` | |
| Race — fastest source only | `race` | |
| Pair values by index | `zip` | |
| Sample primary with secondary's timing | `withLatestFrom` | |

---

### ⑤ Nested Observable — Concurrency Strategy

**Question:** Lossy (drop/ignore inner) or non-lossy (keep all)?

| Answer | Primary | Use case |
|--------|---------|----------|
| Lossy: cancel previous on new outer | `switchMap` | Live search, cancellation |
| Lossy: ignore new while inner active | `exhaustMap` | Form submit, login |
| Non-lossy: queue (ordered) | `concatMap` | Animations, sequential ops |
| Non-lossy: all concurrent | `mergeMap` | Parallel, order irrelevant |

---

### ⑥ Error Handling

**Question:** What should happen when the stream errors?

| Answer | Primary | Alternatives |
|--------|---------|--------------|
| Replace with fallback Observable | `catchError` | |
| Retry the source | `retry(n)` | `retryWhen` |
| Continue with next Observable | `onErrorResumeNextWith` | |
| Error if no value within time limit | `timeout` | |

---

### ⑦ Multicasting / Sharing

**Question:** Do late subscribers need cached values?

| Answer | Primary | Notes |
|--------|---------|-------|
| Yes — replay last value | `shareReplay(1)` | Default for state streams |
| No — share execution only | `share` | |

---

### ⑧ Aggregation / Accumulation

**Question:** Emit during the stream or after it completes?

| Answer | Primary | Alternatives |
|--------|---------|--------------|
| Emit each accumulated step | `scan` | |
| Single value on complete | `reduce` | `toArray`, `count` |

---

### ⑨ Conditional / Boolean Query

**Question:** What yes/no question about the stream?

| Answer | Primary | Alternatives |
|--------|---------|--------------|
| Does every value match? | `every` | |
| Find first matching value | `find` | `findIndex` |
| Is the stream empty? | `isEmpty` | `defaultIfEmpty` |
| Choose between two Observables | `iif` | |

---

### ⑩ Hot vs Cold / Subject Creation

**Question:** What do you need from the Subject?

| Answer | Primary | Notes |
|--------|---------|-------|
| Imperative dispatch only | `Subject` | |
| Late subscribers get current value | `BehaviorSubject` | MVU state holder |
| Late subscribers get last N values | `ReplaySubject(n)` | |
| Convert cold Observable to hot | `share()` | alt: `shareReplay`, `publish` |

---

### ⑪ Inspection / Side Effects

**Question:** What do you need to inspect or intercept?

| Answer | Primary | Notes |
|--------|---------|-------|
| Log / debug without changing values | `tap` | Side effect at any point in pipe |
| Convert notifications to value objects | `materialize` | Wraps next/error/complete as `Notification<T>` |
| Unwrap Notification objects back to stream | `dematerialize` | Inverse of `materialize` |
| Run cleanup when stream ends (any reason) | `finalize` | Like `try/finally` for streams |

---

## 7. Testing

- `treeReducer` tested as a pure function in Vitest — no DOM, no subscriptions
- One test per action type (`answer`, `back`, `reset`)
- Key invariants: `back` at root is a no-op; `breadcrumb.length === history.length` always; `reset` returns the exact initial object

```typescript
test('answer pushes node to history and label to breadcrumb', () => {
  const branch = ROOT.branches[0]
  const next = treeReducer(initial, { kind: 'answer', next: branch.next, label: branch.label })
  expect(next.currentNode).toBe(branch.next)
  expect(next.history).toEqual([ROOT])
  expect(next.breadcrumb).toEqual([{ nodeId: ROOT.id, label: branch.label }])
})

test('back at root is a no-op', () => {
  expect(treeReducer(initial, { kind: 'back' })).toBe(initial)
})

test('reset returns initial state', () => {
  const afterAnswer = treeReducer(initial, { kind: 'answer', next: ROOT.branches[0].next, label: 'x' })
  expect(treeReducer(afterAnswer, { kind: 'reset' })).toBe(initial)
})
```

---

## 8. Key Constraints

- **No framework** — vanilla TypeScript + RxJS only; no Vue, React, or Angular
- **No nested subscriptions** — sidebar and panel each hold one `state$` subscription, cleaned up with `takeUntil(destroy$)`
- **Wiki link base URL** is a single configurable constant — switching wiki domains requires one edit
- **`treeReducer` never mutates** — always returns a new object; spread all arrays
- **Vitest** configured when tests are added; no Jest
