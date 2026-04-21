# RxJS Operator Family Navigator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a VitePress site with a three-panel drill-down navigator that routes experienced developers from operator family → sub-family → individual operator detail page.

**Architecture:** A single `src/taxonomy.ts` file defines the full 14-family hierarchy and is imported by the `ThreePanelNavigator.vue` component at compile time. Operator detail pages are VitePress markdown files with frontmatter. The `OperatorBreadcrumb.vue` global component reads that frontmatter via `useData()` to render navigation context on every operator page.

**Tech Stack:** VitePress 1.x, Vue 3 (via VitePress), TypeScript 5.9, Vitest 4.x

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Replace Vite scripts with VitePress scripts; add test script |
| `vitest.config.ts` | Create | Vitest config with `@taxonomy` alias |
| `src/taxonomy.ts` | Create | Typed hierarchy: 14 families → sub-families → operators |
| `src/taxonomy.test.ts` | Create | Structure integrity tests for the taxonomy data |
| `docs/.vitepress/config.ts` | Create | VitePress config: `@taxonomy` alias, no sidebar |
| `docs/.vitepress/theme/index.ts` | Create | Register `ThreePanelNavigator` and `OperatorBreadcrumb` globally |
| `docs/.vitepress/components/ThreePanelNavigator.vue` | Create | Three-panel UI; reads taxonomy; navigates to operator pages |
| `docs/.vitepress/components/OperatorBreadcrumb.vue` | Create | Reads page frontmatter; renders breadcrumb + back link |
| `docs/index.md` | Create | Home page; embeds `<ThreePanelNavigator />` |
| `docs/operators/switchMap.md` | Create | Exemplar operator page (Flattening / Only latest) |
| `docs/operators/map.md` | Create | Exemplar operator page (Projection / Value projection) |
| `docs/operators/filter.md` | Create | Exemplar operator page (Filtering / Filter by predicate) |

---

## Task 1: Configure VitePress and Test Runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `docs/.vitepress/config.ts`
- Create: `docs/.vitepress/theme/index.ts`

- [ ] **Step 1: Update package.json scripts**

Replace the content of `package.json` with:

```json
{
  "name": "rxjs-operator-families-lexical-semantical",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "test": "vitest run src"
  },
  "devDependencies": {
    "typescript": "~5.9.3",
    "vite": "^7.2.4"
  },
  "dependencies": {
    "rxjs": "^7.8.2",
    "vitepress": "^1.6.4",
    "vitest": "^4.1.4"
  }
}
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@taxonomy': resolve(__dirname, 'src/taxonomy.ts')
    }
  }
})
```

- [ ] **Step 3: Create docs/.vitepress/config.ts**

```ts
import { defineConfig } from 'vitepress'
import { resolve } from 'path'

export default defineConfig({
  title: 'RxJS Operator Families',
  description: 'Navigate RxJS operators by semantic family',
  vite: {
    resolve: {
      alias: {
        '@taxonomy': resolve(__dirname, '../../src/taxonomy.ts')
      }
    }
  },
  themeConfig: {
    nav: [
      { text: 'Navigator', link: '/' }
    ],
    sidebar: []
  }
})
```

- [ ] **Step 4: Create docs/.vitepress/theme/index.ts**

```ts
import DefaultTheme from 'vitepress/theme'
import ThreePanelNavigator from '../components/ThreePanelNavigator.vue'
import OperatorBreadcrumb from '../components/OperatorBreadcrumb.vue'
import type { App } from 'vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component('ThreePanelNavigator', ThreePanelNavigator)
    app.component('OperatorBreadcrumb', OperatorBreadcrumb)
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts docs/.vitepress/config.ts docs/.vitepress/theme/index.ts
git commit -m "feat: configure VitePress site and test runner"
```

---

## Task 2: Build Taxonomy Data with Tests

**Files:**
- Create: `src/taxonomy.ts`
- Create: `src/taxonomy.test.ts`

- [ ] **Step 1: Write the failing taxonomy structure tests**

Create `src/taxonomy.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { taxonomy } from './taxonomy'

describe('taxonomy structure', () => {
  it('has 14 families', () => {
    expect(taxonomy).toHaveLength(14)
  })

  it('all families have unique letters', () => {
    const letters = taxonomy.map(f => f.letter)
    expect(new Set(letters).size).toBe(letters.length)
  })

  it('all families have at least one subFamily', () => {
    for (const family of taxonomy) {
      expect(family.subFamilies.length).toBeGreaterThan(0)
    }
  })

  it('all subFamilies have at least one operator', () => {
    for (const family of taxonomy) {
      for (const sub of family.subFamilies) {
        expect(sub.operators.length).toBeGreaterThan(0)
      }
    }
  })

  it('all operator slugs are unique across the taxonomy', () => {
    const slugs = taxonomy.flatMap(f =>
      f.subFamilies.flatMap(s => s.operators.map(o => o.slug))
    )
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('all operator slugs match camelCase identifier pattern', () => {
    const slugs = taxonomy.flatMap(f =>
      f.subFamilies.flatMap(s => s.operators.map(o => o.slug))
    )
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/)
    }
  })

  it('all operators have non-empty taglines', () => {
    for (const family of taxonomy) {
      for (const sub of family.subFamilies) {
        for (const op of sub.operators) {
          expect(op.tagline.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('operator name matches slug for all operators', () => {
    for (const family of taxonomy) {
      for (const sub of family.subFamilies) {
        for (const op of sub.operators) {
          expect(op.slug).toBe(op.name)
        }
      }
    }
  })
})
```

- [ ] **Step 2: Run tests — expect failure (taxonomy.ts does not exist yet)**

```bash
npm test
```

Expected: `Error: Cannot find module './taxonomy'`

- [ ] **Step 3: Create src/taxonomy.ts**

```ts
export interface Operator {
  name: string
  slug: string
  tagline: string
}

export interface SubFamily {
  label: string
  operators: Operator[]
}

export interface Family {
  label: string
  letter: string
  subFamilies: SubFamily[]
}

export const taxonomy: Family[] = [
  {
    label: 'Creation / Adaptation',
    letter: 'B',
    subFamilies: [
      {
        label: 'Web callbacks',
        operators: [
          { name: 'fromEvent', slug: 'fromEvent', tagline: 'Create stream from DOM or Node.js event' },
          { name: 'fromEventPattern', slug: 'fromEventPattern', tagline: 'Wrap add/remove handler pairs as Observable' },
          { name: 'bindCallback', slug: 'bindCallback', tagline: 'Convert Node-style callback function to Observable factory' },
          { name: 'bindNodeCallback', slug: 'bindNodeCallback', tagline: 'Convert Node-style error-first callback to Observable factory' },
        ]
      },
      {
        label: 'Create on subscription',
        operators: [
          { name: 'defer', slug: 'defer', tagline: 'Create a fresh Observable for each subscriber' },
        ]
      },
      {
        label: 'From values / containers',
        operators: [
          { name: 'of', slug: 'of', tagline: 'Emit a fixed list of values then complete' },
          { name: 'from', slug: 'from', tagline: 'Convert array, Promise, iterable or Observable-like to Observable' },
          { name: 'fromFetch', slug: 'fromFetch', tagline: 'Wrap fetch() with cancellation on unsubscribe' },
        ]
      },
      {
        label: 'Generate values',
        operators: [
          { name: 'interval', slug: 'interval', tagline: 'Emit incrementing integers on a fixed timer' },
          { name: 'timer', slug: 'timer', tagline: 'Emit after a delay, optionally repeat on interval' },
          { name: 'range', slug: 'range', tagline: 'Emit a sequential range of integers synchronously' },
          { name: 'generate', slug: 'generate', tagline: 'Emit values produced by a custom iterator-like loop' },
        ]
      },
      {
        label: 'Create terminal / empty',
        operators: [
          { name: 'throwError', slug: 'throwError', tagline: 'Create an Observable that immediately errors' },
          { name: 'EMPTY', slug: 'EMPTY', tagline: 'Observable that completes immediately without emitting' },
          { name: 'NEVER', slug: 'NEVER', tagline: 'Observable that never emits, errors, or completes' },
        ]
      },
      {
        label: 'Conditional creation',
        operators: [
          { name: 'iif', slug: 'iif', tagline: 'Subscribe to one of two Observables based on a condition' },
        ]
      },
    ]
  },
  {
    label: 'Static Multi-Source Combination',
    letter: 'C',
    subFamilies: [
      {
        label: 'Latest values from all',
        operators: [
          { name: 'combineLatest', slug: 'combineLatest', tagline: 'Emit array of latest values whenever any source emits' },
          { name: 'combineLatestWith', slug: 'combineLatestWith', tagline: 'Pipe-friendly combineLatest with one other source' },
          { name: 'combineLatestAll', slug: 'combineLatestAll', tagline: 'Flatten higher-order Observable using combineLatest' },
        ]
      },
      {
        label: 'One after another',
        operators: [
          { name: 'concat', slug: 'concat', tagline: 'Subscribe to sources in sequence, wait for each to complete' },
          { name: 'concatWith', slug: 'concatWith', tagline: 'Pipe-friendly concat with one or more sources' },
        ]
      },
      {
        label: 'As values arrive',
        operators: [
          { name: 'merge', slug: 'merge', tagline: 'Subscribe to all sources at once, emit as values arrive' },
          { name: 'mergeWith', slug: 'mergeWith', tagline: 'Pipe-friendly merge with one or more sources' },
        ]
      },
      {
        label: 'First source wins',
        operators: [
          { name: 'race', slug: 'race', tagline: 'Mirror the first source to emit, ignore the rest' },
          { name: 'raceWith', slug: 'raceWith', tagline: 'Pipe-friendly race against one or more sources' },
        ]
      },
      {
        label: 'Align by position',
        operators: [
          { name: 'zip', slug: 'zip', tagline: 'Pair nth values from each source into arrays' },
          { name: 'zipWith', slug: 'zipWith', tagline: 'Pipe-friendly zip with one or more sources' },
          { name: 'zipAll', slug: 'zipAll', tagline: 'Flatten higher-order Observable using zip semantics' },
        ]
      },
      {
        label: 'Final values after all complete',
        operators: [
          { name: 'forkJoin', slug: 'forkJoin', tagline: 'Emit last value from each source once all complete' },
        ]
      },
    ]
  },
  {
    label: 'Projection / Shape Change',
    letter: 'D',
    subFamilies: [
      {
        label: 'Value projection',
        operators: [
          { name: 'map', slug: 'map', tagline: 'Transform each value with a projection function' },
          { name: 'mapTo', slug: 'mapTo', tagline: 'Replace every emitted value with a constant' },
          { name: 'pairwise', slug: 'pairwise', tagline: 'Emit [previous, current] pairs on each emission' },
        ]
      },
      {
        label: 'Collect values into arrays',
        operators: [
          { name: 'bufferCount', slug: 'bufferCount', tagline: 'Collect N values then emit as array' },
          { name: 'bufferTime', slug: 'bufferTime', tagline: 'Collect values for a time window then emit as array' },
          { name: 'bufferWhen', slug: 'bufferWhen', tagline: 'Collect values until a closing Observable emits' },
          { name: 'bufferToggle', slug: 'bufferToggle', tagline: 'Open/close buffer windows with separate Observables' },
          { name: 'buffer', slug: 'buffer', tagline: 'Collect values until a notifier Observable emits' },
        ]
      },
      {
        label: 'Cut stream into inner Observables',
        operators: [
          { name: 'windowCount', slug: 'windowCount', tagline: 'Emit inner Observables of N values each' },
          { name: 'windowTime', slug: 'windowTime', tagline: 'Emit inner Observables for each time window' },
          { name: 'windowWhen', slug: 'windowWhen', tagline: 'Open new inner Observable when closing Observable emits' },
          { name: 'windowToggle', slug: 'windowToggle', tagline: 'Open/close inner Observable windows with separate Observables' },
          { name: 'window', slug: 'window', tagline: 'Cut source into inner Observables on each notifier emission' },
        ]
      },
    ]
  },
  {
    label: 'Filtering / Selection',
    letter: 'E',
    subFamilies: [
      {
        label: 'Filter by predicate',
        operators: [
          { name: 'filter', slug: 'filter', tagline: 'Pass only values that satisfy a predicate' },
        ]
      },
      {
        label: 'Global uniqueness',
        operators: [
          { name: 'distinct', slug: 'distinct', tagline: 'Suppress values already seen anywhere in the stream' },
        ]
      },
      {
        label: 'Neighbor-based uniqueness',
        operators: [
          { name: 'distinctUntilChanged', slug: 'distinctUntilChanged', tagline: 'Suppress consecutive duplicate values' },
          { name: 'distinctUntilKeyChanged', slug: 'distinctUntilKeyChanged', tagline: 'Suppress consecutive duplicates by object key' },
        ]
      },
      {
        label: 'Select a particular value',
        operators: [
          { name: 'first', slug: 'first', tagline: 'Emit only the first value (or first matching predicate)' },
          { name: 'last', slug: 'last', tagline: 'Emit only the last value before completion' },
          { name: 'elementAt', slug: 'elementAt', tagline: 'Emit only the value at a specific index' },
          { name: 'single', slug: 'single', tagline: 'Emit the only value; error if zero or more than one match' },
        ]
      },
      {
        label: 'Suppress all values',
        operators: [
          { name: 'ignoreElements', slug: 'ignoreElements', tagline: 'Pass through only error and complete notifications' },
        ]
      },
      {
        label: 'Filter by position / lifetime',
        operators: [
          { name: 'take', slug: 'take', tagline: 'Emit the first N values then complete' },
          { name: 'takeLast', slug: 'takeLast', tagline: 'Emit the last N values when source completes' },
          { name: 'takeUntil', slug: 'takeUntil', tagline: 'Complete when a notifier Observable emits' },
          { name: 'takeWhile', slug: 'takeWhile', tagline: 'Complete as soon as predicate returns false' },
          { name: 'skip', slug: 'skip', tagline: 'Ignore the first N values' },
          { name: 'skipLast', slug: 'skipLast', tagline: 'Ignore the last N values' },
          { name: 'skipUntil', slug: 'skipUntil', tagline: 'Ignore values until a notifier Observable emits' },
          { name: 'skipWhile', slug: 'skipWhile', tagline: 'Ignore values while predicate holds true' },
        ]
      },
      {
        label: 'Search-like selection',
        operators: [
          { name: 'find', slug: 'find', tagline: 'Emit the first value matching a predicate then complete' },
          { name: 'findIndex', slug: 'findIndex', tagline: 'Emit the index of the first value matching a predicate' },
        ]
      },
    ]
  },
  {
    label: 'Flattening Policies',
    letter: 'F',
    subFamilies: [
      {
        label: 'Allow overlap',
        operators: [
          { name: 'mergeMap', slug: 'mergeMap', tagline: 'Subscribe to every inner Observable concurrently' },
          { name: 'mergeAll', slug: 'mergeAll', tagline: 'Flatten higher-order Observable with unlimited concurrency' },
        ]
      },
      {
        label: 'Queue — preserve order',
        operators: [
          { name: 'concatMap', slug: 'concatMap', tagline: 'Wait for each inner Observable to complete before next' },
          { name: 'concatAll', slug: 'concatAll', tagline: 'Flatten higher-order Observable sequentially' },
        ]
      },
      {
        label: 'Only latest',
        operators: [
          { name: 'switchMap', slug: 'switchMap', tagline: 'Cancel previous inner Observable, subscribe to latest' },
          { name: 'switchAll', slug: 'switchAll', tagline: 'Flatten higher-order Observable, always switching to latest' },
          { name: 'switchScan', slug: 'switchScan', tagline: 'Accumulate state with switchMap flattening policy' },
        ]
      },
      {
        label: 'Ignore while busy',
        operators: [
          { name: 'exhaustMap', slug: 'exhaustMap', tagline: 'Ignore new source values while inner Observable is active' },
          { name: 'exhaustAll', slug: 'exhaustAll', tagline: 'Flatten higher-order Observable, dropping while busy' },
        ]
      },
    ]
  },
  {
    label: 'State / Accumulation / Reduction',
    letter: 'G',
    subFamilies: [
      {
        label: 'Continuous accumulation',
        operators: [
          { name: 'scan', slug: 'scan', tagline: 'Emit running accumulated state on every value' },
        ]
      },
      {
        label: 'Final reduction',
        operators: [
          { name: 'reduce', slug: 'reduce', tagline: 'Emit a single accumulated result when source completes' },
        ]
      },
      {
        label: 'Stateful higher-order reducers',
        operators: [
          { name: 'mergeScan', slug: 'mergeScan', tagline: 'Accumulate state where each step returns an Observable' },
        ]
      },
    ]
  },
  {
    label: 'Grouping / Branching / Recursive Expansion',
    letter: 'H',
    subFamilies: [
      {
        label: 'Split into two branches',
        operators: [
          { name: 'partition', slug: 'partition', tagline: 'Split one Observable into [truthy, falsy] tuple' },
        ]
      },
      {
        label: 'Group into keyed inner streams',
        operators: [
          { name: 'groupBy', slug: 'groupBy', tagline: 'Emit GroupedObservable per unique key value' },
        ]
      },
      {
        label: 'Recursive expansion',
        operators: [
          { name: 'expand', slug: 'expand', tagline: 'Recursively project values into Observables and merge' },
        ]
      },
    ]
  },
  {
    label: 'Time Control',
    letter: 'I',
    subFamilies: [
      {
        label: 'Time shifting — non-lossy',
        operators: [
          { name: 'delay', slug: 'delay', tagline: 'Shift all emissions forward in time by a fixed duration' },
          { name: 'delayWhen', slug: 'delayWhen', tagline: 'Delay each value by a duration returned per-value' },
        ]
      },
      {
        label: 'Lossy time-based gating',
        operators: [
          { name: 'debounce', slug: 'debounce', tagline: 'Emit value only after silence period from a notifier' },
          { name: 'debounceTime', slug: 'debounceTime', tagline: 'Emit value only after N ms of silence' },
          { name: 'throttle', slug: 'throttle', tagline: 'Emit first value then ignore for duration from notifier' },
          { name: 'throttleTime', slug: 'throttleTime', tagline: 'Emit first value then suppress for N ms' },
          { name: 'audit', slug: 'audit', tagline: 'Emit latest value after silence from a notifier Observable' },
          { name: 'auditTime', slug: 'auditTime', tagline: 'Emit latest value after N ms window' },
          { name: 'sample', slug: 'sample', tagline: 'Emit latest value whenever a notifier Observable emits' },
          { name: 'sampleTime', slug: 'sampleTime', tagline: 'Emit latest value on a fixed timer interval' },
        ]
      },
      {
        label: 'Time metadata / measurement',
        operators: [
          { name: 'timeInterval', slug: 'timeInterval', tagline: 'Annotate each value with the elapsed time since previous' },
          { name: 'timestamp', slug: 'timestamp', tagline: 'Annotate each value with the wall-clock time of emission' },
        ]
      },
    ]
  },
  {
    label: 'Combination by Context / Sequence Augmentation',
    letter: 'J',
    subFamilies: [
      {
        label: 'Combine with latest side input',
        operators: [
          { name: 'withLatestFrom', slug: 'withLatestFrom', tagline: 'Sample a second stream on each source emission' },
        ]
      },
      {
        label: 'Add values at boundaries',
        operators: [
          { name: 'startWith', slug: 'startWith', tagline: 'Prepend one or more values before source emissions' },
          { name: 'endWith', slug: 'endWith', tagline: 'Append one or more values after source completes' },
        ]
      },
    ]
  },
  {
    label: 'Sharing / Multicasting',
    letter: 'K',
    subFamilies: [
      {
        label: 'Explicit multicast / connectable',
        operators: [
          { name: 'publish', slug: 'publish', tagline: 'Make Observable connectable with a Subject' },
          { name: 'publishBehavior', slug: 'publishBehavior', tagline: 'Connectable Observable backed by a BehaviorSubject' },
          { name: 'publishLast', slug: 'publishLast', tagline: 'Connectable Observable backed by an AsyncSubject' },
          { name: 'publishReplay', slug: 'publishReplay', tagline: 'Connectable Observable backed by a ReplaySubject' },
          { name: 'multicast', slug: 'multicast', tagline: 'Multicast through a provided Subject' },
          { name: 'connectable', slug: 'connectable', tagline: 'Create a connectable Observable from any source' },
        ]
      },
      {
        label: 'Automatic shared execution',
        operators: [
          { name: 'share', slug: 'share', tagline: 'Share a single subscription among multiple subscribers' },
          { name: 'shareReplay', slug: 'shareReplay', tagline: 'Share and replay last N values to late subscribers' },
        ]
      },
    ]
  },
  {
    label: 'Inspection / Notification Conversion',
    letter: 'L',
    subFamilies: [
      {
        label: 'Peek without changing stream',
        operators: [
          { name: 'tap', slug: 'tap', tagline: 'Perform side effects on each emission without altering values' },
          { name: 'finalize', slug: 'finalize', tagline: 'Execute a callback when the Observable terminates for any reason' },
        ]
      },
      {
        label: 'Convert notifications ↔ values',
        operators: [
          { name: 'materialize', slug: 'materialize', tagline: 'Wrap each notification as a Notification value object' },
          { name: 'dematerialize', slug: 'dematerialize', tagline: 'Unwrap Notification objects back into notifications' },
        ]
      },
    ]
  },
  {
    label: 'Scheduler Control',
    letter: 'M',
    subFamilies: [
      {
        label: 'Shift downstream notifications',
        operators: [
          { name: 'observeOn', slug: 'observeOn', tagline: 'Deliver all notifications on a specified scheduler' },
        ]
      },
      {
        label: 'Shift subscription side effects',
        operators: [
          { name: 'subscribeOn', slug: 'subscribeOn', tagline: 'Perform subscription on a specified scheduler' },
        ]
      },
    ]
  },
  {
    label: 'Error / Recovery / Timeout',
    letter: 'N',
    subFamilies: [
      {
        label: 'Recover from error',
        operators: [
          { name: 'catchError', slug: 'catchError', tagline: 'Replace an errored stream with a recovery Observable' },
          { name: 'onErrorResumeNextWith', slug: 'onErrorResumeNextWith', tagline: 'Continue with next source regardless of error or completion' },
        ]
      },
      {
        label: 'Retry policy',
        operators: [
          { name: 'retry', slug: 'retry', tagline: 'Re-subscribe on error, up to N times' },
          { name: 'retryWhen', slug: 'retryWhen', tagline: 'Re-subscribe on error when a notifier Observable emits' },
          { name: 'repeat', slug: 'repeat', tagline: 'Re-subscribe after completion, up to N times' },
          { name: 'repeatWhen', slug: 'repeatWhen', tagline: 'Re-subscribe after completion when a notifier Observable emits' },
        ]
      },
      {
        label: 'Fail on timing condition',
        operators: [
          { name: 'timeout', slug: 'timeout', tagline: 'Error if no value arrives within a time limit' },
          { name: 'timeoutWith', slug: 'timeoutWith', tagline: 'Switch to a fallback Observable if no value arrives in time' },
        ]
      },
    ]
  },
  {
    label: 'Interop / Boundary Conversion',
    letter: 'O',
    subFamilies: [
      {
        label: 'Convert out of Observable world',
        operators: [
          { name: 'toArray', slug: 'toArray', tagline: 'Collect all values into an array, emit on completion' },
          { name: 'firstValueFrom', slug: 'firstValueFrom', tagline: 'Await the first value as a Promise' },
          { name: 'lastValueFrom', slug: 'lastValueFrom', tagline: 'Await the last value as a Promise' },
          { name: 'forEach', slug: 'forEach', tagline: 'Iterate over values in sequence returning a Promise' },
        ]
      },
    ]
  },
]
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test
```

Expected output:
```
✓ src/taxonomy.test.ts (8)
  ✓ taxonomy structure (8)
    ✓ has 14 families
    ✓ all families have unique letters
    ✓ all families have at least one subFamily
    ✓ all subFamilies have at least one operator
    ✓ all operator slugs are unique across the taxonomy
    ✓ all operator slugs match camelCase identifier pattern
    ✓ all operators have non-empty taglines
    ✓ operator name matches slug for all operators

Test Files  1 passed (1)
Tests       8 passed (8)
```

- [ ] **Step 5: Commit**

```bash
git add src/taxonomy.ts src/taxonomy.test.ts
git commit -m "feat: add taxonomy data model and structure tests"
```

---

## Task 3: Build ThreePanelNavigator Component

**Files:**
- Create: `docs/.vitepress/components/ThreePanelNavigator.vue`

- [ ] **Step 1: Create the component**

Create `docs/.vitepress/components/ThreePanelNavigator.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vitepress'
import { taxonomy } from '@taxonomy'
import type { Family, SubFamily, Operator } from '@taxonomy'

const router = useRouter()

const selectedFamily = ref<Family>(taxonomy[0])
const selectedSubFamily = ref<SubFamily | null>(null)
const selectedOperator = ref<Operator | null>(null)

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const letter = params.get('family')
  if (letter) {
    const found = taxonomy.find(f => f.letter === letter)
    if (found) {
      selectedFamily.value = found
    }
  }
})

function selectFamily(family: Family): void {
  selectedFamily.value = family
  selectedSubFamily.value = null
  selectedOperator.value = null
}

function selectSubFamily(sub: SubFamily): void {
  selectedSubFamily.value = sub
  selectedOperator.value = null
}

function selectOperator(op: Operator): void {
  selectedOperator.value = op
  router.go(`/operators/${op.slug}`)
}
</script>

<template>
  <div class="navigator">
    <div class="panel">
      <div class="panel-header">Family</div>
      <ul>
        <li
          v-for="family in taxonomy"
          :key="family.letter"
          :class="{ active: selectedFamily.letter === family.letter }"
          @click="selectFamily(family)"
        >
          {{ family.label }}
        </li>
      </ul>
    </div>

    <div class="panel">
      <div class="panel-header">Sub-Family</div>
      <ul>
        <li
          v-for="sub in selectedFamily.subFamilies"
          :key="sub.label"
          :class="{ active: selectedSubFamily?.label === sub.label }"
          @click="selectSubFamily(sub)"
        >
          {{ sub.label }}
        </li>
      </ul>
    </div>

    <div class="panel">
      <div class="panel-header">Operators</div>
      <ul v-if="selectedSubFamily">
        <li
          v-for="op in selectedSubFamily.operators"
          :key="op.slug"
          :class="{ active: selectedOperator?.slug === op.slug }"
          @click="selectOperator(op)"
        >
          <span class="op-name">{{ op.name }}</span>
          <span class="op-tagline">{{ op.tagline }}</span>
        </li>
      </ul>
      <div v-else class="empty-hint">← Select a sub-family</div>
    </div>
  </div>
</template>

<style scoped>
.navigator {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  height: 600px;
  margin: 24px 0;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--vp-c-divider);
}

.panel:last-child {
  border-right: none;
}

.panel-header {
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  flex-shrink: 0;
}

ul {
  list-style: none;
  margin: 0;
  padding: 6px 0;
  overflow-y: auto;
  flex: 1;
}

li {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: background 0.1s;
}

li:hover {
  background: var(--vp-c-bg-soft);
}

li.active {
  background: var(--vp-c-brand-soft);
}

li.active .op-name,
li.active {
  color: var(--vp-c-brand-1);
}

.op-name {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 500;
}

.op-tagline {
  font-size: 11px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

li.active .op-tagline {
  color: var(--vp-c-brand-2);
}

.empty-hint {
  padding: 24px 16px;
  font-size: 13px;
  color: var(--vp-c-text-3);
  font-style: italic;
}
</style>
```

- [ ] **Step 2: Start the dev server and verify the navigator renders**

```bash
npm run docs:dev
```

Open `http://localhost:5173` (or the port printed in terminal).

Expected: Three-panel layout with 14 families in left column, sub-families appearing on click, operators appearing in right column.

- [ ] **Step 3: Commit**

```bash
git add docs/.vitepress/components/ThreePanelNavigator.vue
git commit -m "feat: add ThreePanelNavigator Vue component"
```

---

## Task 4: Build OperatorBreadcrumb Component

**Files:**
- Create: `docs/.vitepress/components/OperatorBreadcrumb.vue`

- [ ] **Step 1: Create the component**

Create `docs/.vitepress/components/OperatorBreadcrumb.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRouter } from 'vitepress'
import { taxonomy } from '@taxonomy'

const { frontmatter } = useData()
const router = useRouter()

const familyLetter = computed<string>(() => {
  const found = taxonomy.find(f => f.label === frontmatter.value.family)
  return found?.letter ?? ''
})

function backToNavigator(): void {
  router.go(`/?family=${familyLetter.value}`)
}
</script>

<template>
  <div class="breadcrumb-bar">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <a class="back-link" href="/" @click.prevent="backToNavigator">← Navigator</a>
      <span class="sep">›</span>
      <span class="crumb">{{ frontmatter.family }}</span>
      <span class="sep">›</span>
      <span class="crumb">{{ frontmatter.subFamily }}</span>
      <span class="sep">›</span>
      <code class="current">{{ frontmatter.title }}</code>
    </nav>
  </div>
</template>

<style scoped>
.breadcrumb-bar {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
}

.back-link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.sep {
  color: var(--vp-c-text-3);
}

.crumb {
  color: var(--vp-c-text-2);
}

.current {
  color: var(--vp-c-text-1);
  font-size: 13px;
  background: var(--vp-c-bg-soft);
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add docs/.vitepress/components/OperatorBreadcrumb.vue
git commit -m "feat: add OperatorBreadcrumb Vue component"
```

---

## Task 5: Wire Up Home Page

**Files:**
- Create: `docs/index.md`

- [ ] **Step 1: Create the home page**

Create `docs/index.md`:

```md
---
layout: page
title: RxJS Operator Families Navigator
---

# RxJS Operator Families

Navigate from intent to operator in three clicks. Select a **family**, then a **sub-family**, then the operator you need.

<ThreePanelNavigator />
```

- [ ] **Step 2: Verify in dev server**

With `npm run docs:dev` running, open the root URL.

Expected: Heading + descriptive line + three-panel navigator below it.

- [ ] **Step 3: Commit**

```bash
git add docs/index.md
git commit -m "feat: add home page with three-panel navigator"
```

---

## Task 6: Create Exemplar Operator Pages

**Files:**
- Create: `docs/operators/switchMap.md`
- Create: `docs/operators/map.md`
- Create: `docs/operators/filter.md`

- [ ] **Step 1: Create docs/operators/switchMap.md**

```md
---
title: switchMap
family: Flattening Policies
subFamily: Only latest
tagline: Cancel previous inner observable, subscribe to the latest
---

<OperatorBreadcrumb />

## Signature

```ts
switchMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>
): OperatorFunction<T, R>
```

## What it does

Projects each source value to an inner Observable and subscribes to it. When the next source value arrives, the current inner Observable is **unsubscribed** before the new one is created. Only the most recently projected Observable is active at any time.

## Marble diagram

```
source:     --a-----------b---------c--|
project(a): ----1--2--3|
project(b):               ----4--5|
project(c):                         ----6--7|
result:     ----1--2--3-------4--5------6--7|
```

## When to use

- **Search typeahead** — cancel the in-flight HTTP request every time the user types a new character
- **Route data loading** — cancel pending fetch when the user navigates to a different route
- **Live form validation** — cancel stale validation request when the field value changes again

## Related operators

- [exhaustMap](/operators/exhaustMap) — ignore new values while one inner Observable is still active
- [concatMap](/operators/concatMap) — queue inner Observables, complete one before starting the next
- [mergeMap](/operators/mergeMap) — run all inner Observables concurrently with no cancellation
```

- [ ] **Step 2: Create docs/operators/map.md**

```md
---
title: map
family: Projection / Shape Change
subFamily: Value projection
tagline: Transform each value with a projection function
---

<OperatorBreadcrumb />

## Signature

```ts
map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>
```

## What it does

Applies a projection function to each emitted value and passes the result downstream. The function receives the value and its zero-based index. One input always produces exactly one output — map never filters or delays.

## Marble diagram

```
source: --1---2---3---4--|
map(x => x * 10)
result: --10--20--30--40--|
```

## When to use

- Extract a property from each emitted object: `map(user => user.name)`
- Convert units or formats: `map(ms => ms / 1000)`
- Add computed fields: `map(item => ({ ...item, total: item.price * item.qty }))`

## Related operators

- [mapTo](/operators/mapTo) — replace every value with the same constant (no function needed)
- [pairwise](/operators/pairwise) — emit [previous, current] on each value instead of transforming
- [switchMap](/operators/switchMap) — project to an Observable instead of a plain value
```

- [ ] **Step 3: Create docs/operators/filter.md**

```md
---
title: filter
family: Filtering / Selection
subFamily: Filter by predicate
tagline: Pass only values that satisfy a predicate
---

<OperatorBreadcrumb />

## Signature

```ts
filter<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>
```

## What it does

Evaluates each emitted value against a predicate function. Values for which the predicate returns `true` pass through; values that return `false` are silently discarded. The output stream preserves the TypeScript type of the input (it is a `MonoTypeOperatorFunction`), but type-guard predicates can narrow it.

## Marble diagram

```
source:              --1--2--3--4--5--|
filter(x => x % 2 === 0)
result:              -----2-----4-----|
```

## When to use

- Remove `null`/`undefined` entries: `filter((v): v is T => v != null)`
- Gate on a condition: `filter(event => event.key === 'Enter')`
- Drop loading/error states in a union stream: `filter(isSuccess)`

## Related operators

- [first](/operators/first) — like filter but takes only the first match and completes
- [find](/operators/find) — emit the first matching value as a one-shot Observable
- [distinctUntilChanged](/operators/distinctUntilChanged) — drop consecutive duplicates rather than arbitrary values
```

- [ ] **Step 4: Verify navigation flow end-to-end in dev server**

With `npm run docs:dev` running:

1. Open root URL — three-panel navigator should render
2. Click **Flattening Policies** in column 1 — sub-families appear in column 2
3. Click **Only latest** in column 2 — `switchMap`, `switchAll`, `switchScan` appear in column 3
4. Click **switchMap** — navigates to `/operators/switchMap`
5. Page shows breadcrumb: `Navigator › Flattening Policies › Only latest › switchMap`
6. Click `← Navigator` in breadcrumb — returns to `/?family=F` with Flattening Policies pre-selected

- [ ] **Step 5: Commit**

```bash
git add docs/operators/switchMap.md docs/operators/map.md docs/operators/filter.md
git commit -m "feat: add three exemplar operator detail pages"
```

---

## Task 7: Production Build Verification

**Files:** none (verification only)

- [ ] **Step 1: Run production build**

```bash
npm run docs:build
```

Expected: Build completes with no TypeScript errors and no broken links. Output in `docs/.vitepress/dist/`.

- [ ] **Step 2: Preview the production build**

```bash
npm run docs:preview
```

Open the printed URL and repeat the end-to-end navigation check from Task 6 Step 4.

- [ ] **Step 3: Run tests one final time**

```bash
npm test
```

Expected: 8 tests passing.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete operator navigator — VitePress site with taxonomy, three-panel navigator, exemplar operator pages"
```
