# DebounceTimePlayground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive, animated Vue 3 VitePress component (`DebounceTimePlayground.vue`) that teaches `debounceTime`'s timer-reset behaviour through draggable source marbles, live playback, and a ghost output marble.

**Architecture:** A single `.vue` SFC in `docs/.vitepress/theme/components/`, globally registered, embedded in `docs/operators/encyclopedia/debounceTime.md`. Pure helpers extracted into sibling `.ts` files for testability. RxJS `Subject` feeds the real `debounceTime` operator through a custom virtual scheduler driven by `requestAnimationFrame`. Styled with Vue scoped CSS using VitePress theme variables.

**Tech Stack:** Vue 3 Composition API, TypeScript, RxJS 7.8 (already installed), Vitest 4.1 (already installed), `@vue/test-utils` (new dep), `happy-dom` (new dep). No new runtime deps.

**Project root (all relative paths below are relative to):** `C:/Users/HP/Web/Frontend/rxjs/rxjs-technical-documentation-claude/`

**Spec reference:** `specs/2026-04-17-debounceTime-playground-design.md`

---

## File Structure

Files to create or modify, with single-responsibility per file:

**New files:**
- `docs/.vitepress/theme/components/DebounceTimePlayground.vue` — the SFC
- `docs/.vitepress/theme/components/debounce-playground/types.ts` — shared TS interfaces
- `docs/.vitepress/theme/components/debounce-playground/helpers.ts` — pure helpers (`computeGhost`, `relabelMarbles`)
- `docs/.vitepress/theme/components/debounce-playground/presets.ts` — the 6 preset scenarios
- `docs/.vitepress/theme/components/debounce-playground/virtual-scheduler.ts` — custom `SchedulerLike`
- `docs/.vitepress/theme/components/debounce-playground/__tests__/helpers.spec.ts`
- `docs/.vitepress/theme/components/debounce-playground/__tests__/presets.spec.ts`
- `docs/.vitepress/theme/components/debounce-playground/__tests__/virtual-scheduler.spec.ts`
- `docs/.vitepress/theme/components/debounce-playground/__tests__/pipeline.spec.ts` — marble tests for all 6 presets
- `docs/.vitepress/theme/components/debounce-playground/__tests__/DebounceTimePlayground.spec.ts` — component smoke test
- `vitest.config.ts` — test runner config

**Modified files:**
- `package.json` — add `@vue/test-utils`, `happy-dom` to devDependencies; add `test` / `test:run` scripts
- `docs/.vitepress/theme/index.ts` — register `DebounceTimePlayground` component globally
- `docs/operators/encyclopedia/debounceTime.md` — insert `<DebounceTimePlayground />` tag above the "Classification" section

---

## Task 1: Set up test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `docs/.vitepress/theme/components/debounce-playground/__tests__/smoke.spec.ts` (temporary)

- [ ] **Step 1: Add test dependencies**

Run:
```bash
cd C:/Users/HP/Web/Frontend/rxjs/rxjs-technical-documentation-claude
npm install --save-dev @vue/test-utils happy-dom
```

Expected: installed with no errors.

- [ ] **Step 2: Add test scripts to `package.json`**

Modify the `scripts` block to add:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: 'happy-dom',
		globals: false,
		include: ['docs/**/__tests__/**/*.spec.ts'],
	},
})
```

(Note: `@vitejs/plugin-vue` is bundled with `vite` which is already a dep.)

- [ ] **Step 4: Create a smoke test to verify the pipeline works**

Create `docs/.vitepress/theme/components/debounce-playground/__tests__/smoke.spec.ts`:
```typescript
import { describe, test, expect } from 'vitest'

describe('test infrastructure', (): void => {
	test('vitest is wired correctly', (): void => {
		expect(1 + 1).toBe(2)
	})
})
```

- [ ] **Step 5: Run tests to verify setup**

Run: `npm run test:run`
Expected: PASS — 1 test passed.

- [ ] **Step 6: Delete the smoke test and commit**

Delete `docs/.vitepress/theme/components/debounce-playground/__tests__/smoke.spec.ts` (real tests will replace it).

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "test: set up vitest + @vue/test-utils + happy-dom for docs site"
```

---

## Task 2: Define shared types

**Files:**
- Create: `docs/.vitepress/theme/components/debounce-playground/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// docs/.vitepress/theme/components/debounce-playground/types.ts

export interface SourceMarble {
	readonly id: string
	readonly label: string
	readonly time: number
}

export interface OutputMarble {
	readonly id: string
	readonly sourceLabel: string
	readonly time: number
}

export interface GhostMarble {
	readonly sourceLabel: string
	readonly firesAt: number
}

export interface Preset {
	readonly name: string
	readonly description: string
	readonly marbles: readonly Array<{ label: string; time: number }>
}
```

- [ ] **Step 2: Commit**

```bash
git add docs/.vitepress/theme/components/debounce-playground/types.ts
git commit -m "feat: add shared types for DebounceTimePlayground"
```

---

## Task 3: Implement `computeGhost` (TDD)

**Files:**
- Test: `docs/.vitepress/theme/components/debounce-playground/__tests__/helpers.spec.ts`
- Create: `docs/.vitepress/theme/components/debounce-playground/helpers.ts`

- [ ] **Step 1: Write failing tests**

Create `docs/.vitepress/theme/components/debounce-playground/__tests__/helpers.spec.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { computeGhost } from '../helpers'
import type { SourceMarble, OutputMarble } from '../types'

describe('computeGhost', (): void => {
	test('returns null when no source marble has been consumed', (): void => {
		const marbles: SourceMarble[] = [{ id: '1', label: 'a', time: 500 }]
		expect(computeGhost(marbles, 100, 300, [])).toBeNull()
	})

	test('points at latestConsumed.time + debounceMs', (): void => {
		const marbles: SourceMarble[] = [{ id: '1', label: 'a', time: 500 }]
		expect(computeGhost(marbles, 600, 300, [])).toEqual({
			sourceLabel: 'a',
			firesAt: 800,
		})
	})

	test('returns null after the predicted emission has already fired', (): void => {
		const marbles: SourceMarble[] = [{ id: '1', label: 'a', time: 500 }]
		const output: OutputMarble[] = [{ id: 'o1', sourceLabel: 'a', time: 800 }]
		expect(computeGhost(marbles, 900, 300, output)).toBeNull()
	})

	test('tracks the latest-consumed marble when multiple are in range', (): void => {
		const marbles: SourceMarble[] = [
			{ id: '1', label: 'a', time: 100 },
			{ id: '2', label: 'b', time: 200 },
		]
		expect(computeGhost(marbles, 250, 300, [])).toEqual({
			sourceLabel: 'b',
			firesAt: 500,
		})
	})

	test('ignores marbles not yet consumed by currentTime', (): void => {
		const marbles: SourceMarble[] = [
			{ id: '1', label: 'a', time: 100 },
			{ id: '2', label: 'b', time: 500 },
		]
		expect(computeGhost(marbles, 200, 300, [])).toEqual({
			sourceLabel: 'a',
			firesAt: 400,
		})
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run`
Expected: FAIL with "Cannot find module '../helpers'".

- [ ] **Step 3: Implement `computeGhost`**

Create `docs/.vitepress/theme/components/debounce-playground/helpers.ts`:
```typescript
import type { SourceMarble, OutputMarble, GhostMarble } from './types'

const FIRED_TOLERANCE_MS = 1

export function computeGhost(
	marbles: readonly SourceMarble[],
	currentTime: number,
	debounceMs: number,
	output: readonly OutputMarble[]
): GhostMarble | null {
	const consumed = marbles.filter((m: SourceMarble): boolean => m.time <= currentTime)
	const latest = consumed.at(-1)
	if (!latest) return null

	const firesAt = latest.time + debounceMs
	const alreadyFired = output.some(
		(o: OutputMarble): boolean =>
			o.sourceLabel === latest.label && o.time >= firesAt - FIRED_TOLERANCE_MS
	)
	if (alreadyFired) return null

	return { sourceLabel: latest.label, firesAt }
}
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `npm run test:run`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/components/debounce-playground/helpers.ts docs/.vitepress/theme/components/debounce-playground/__tests__/helpers.spec.ts
git commit -m "feat: implement computeGhost helper with tests"
```

---

## Task 4: Implement `relabelMarbles` (TDD)

**Files:**
- Modify: `docs/.vitepress/theme/components/debounce-playground/__tests__/helpers.spec.ts`
- Modify: `docs/.vitepress/theme/components/debounce-playground/helpers.ts`

- [ ] **Step 1: Add failing tests**

Append to `helpers.spec.ts`:
```typescript
import { relabelMarbles } from '../helpers'

describe('relabelMarbles', (): void => {
	test('labels marbles a, b, c… in time order', (): void => {
		const input: SourceMarble[] = [
			{ id: '1', label: 'x', time: 300 },
			{ id: '2', label: 'y', time: 100 },
			{ id: '3', label: 'z', time: 200 },
		]
		const result = relabelMarbles(input)
		expect(result.map((m: SourceMarble): string => m.label)).toEqual(['a', 'b', 'c'])
		expect(result.map((m: SourceMarble): number => m.time)).toEqual([100, 200, 300])
	})

	test('handles empty input', (): void => {
		expect(relabelMarbles([])).toEqual([])
	})

	test('caps at 26 marbles (rest unlabeled)', (): void => {
		const input: SourceMarble[] = Array.from({ length: 30 }, (_, i: number): SourceMarble => ({
			id: String(i),
			label: '?',
			time: i * 10,
		}))
		const result = relabelMarbles(input)
		expect(result[25].label).toBe('z')
		expect(result.length).toBe(26) // drops overflow
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run`
Expected: FAIL with "relabelMarbles is not a function".

- [ ] **Step 3: Implement `relabelMarbles`**

Append to `helpers.ts`:
```typescript
const MAX_MARBLES = 26

export function relabelMarbles(marbles: readonly SourceMarble[]): SourceMarble[] {
	return [...marbles]
		.sort((a: SourceMarble, b: SourceMarble): number => a.time - b.time)
		.slice(0, MAX_MARBLES)
		.map((m: SourceMarble, i: number): SourceMarble => ({
			...m,
			label: String.fromCharCode(97 + i), // 'a' + i
		}))
}
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `npm run test:run`
Expected: PASS — 8 tests total.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/components/debounce-playground/helpers.ts docs/.vitepress/theme/components/debounce-playground/__tests__/helpers.spec.ts
git commit -m "feat: implement relabelMarbles helper with tests"
```

---

## Task 5: Define preset scenarios

**Files:**
- Create: `docs/.vitepress/theme/components/debounce-playground/presets.ts`
- Create: `docs/.vitepress/theme/components/debounce-playground/__tests__/presets.spec.ts`

- [ ] **Step 1: Create presets file**

```typescript
// docs/.vitepress/theme/components/debounce-playground/presets.ts
import type { Preset } from './types'

export const PRESETS: readonly Preset[] = [
	{
		name: 'Typing burst',
		description: 'Rapid inputs collapse into a single trailing emission.',
		marbles: [
			{ label: 'a', time: 200 },
			{ label: 'b', time: 350 },
			{ label: 'c', time: 500 },
			{ label: 'd', time: 650 },
			{ label: 'e', time: 800 },
		],
	},
	{
		name: 'Steady typing',
		description: 'Spacing greater than debounceMs — every input emits.',
		marbles: [
			{ label: 'a', time: 200 },
			{ label: 'b', time: 700 },
			{ label: 'c', time: 1200 },
			{ label: 'd', time: 1700 },
			{ label: 'e', time: 2200 },
		],
	},
	{
		name: 'Two bursts',
		description: 'Bursts separated by silence — one emission per burst.',
		marbles: [
			{ label: 'a', time: 150 },
			{ label: 'b', time: 300 },
			{ label: 'c', time: 1200 },
			{ label: 'd', time: 1350 },
		],
	},
	{
		name: 'Firehose',
		description: 'Continuous input never fires until it stops.',
		marbles: Array.from({ length: 15 }, (_, i: number): { label: string; time: number } => ({
			label: String.fromCharCode(97 + i),
			time: 100 + i * 150,
		})),
	},
	{
		name: 'Lone click',
		description: 'Single input — standard deadline semantics.',
		marbles: [{ label: 'a', time: 1000 }],
	},
	{
		name: 'Emit on complete',
		description: 'Source completion flushes any pending value, bypassing the silence wait.',
		marbles: [
			{ label: 'a', time: 2500 },
			{ label: 'b', time: 2700 },
		],
	},
]

export const DEFAULT_PRESET_INDEX = 0
```

- [ ] **Step 2: Write invariant tests**

```typescript
// docs/.vitepress/theme/components/debounce-playground/__tests__/presets.spec.ts
import { describe, test, expect } from 'vitest'
import { PRESETS, DEFAULT_PRESET_INDEX } from '../presets'

describe('PRESETS', (): void => {
	test('every preset has a unique name', (): void => {
		const names = PRESETS.map((p): string => p.name)
		expect(new Set(names).size).toBe(names.length)
	})

	test('every preset has at least one marble', (): void => {
		for (const p of PRESETS) {
			expect(p.marbles.length).toBeGreaterThan(0)
		}
	})

	test('every preset marble has a label and non-negative time', (): void => {
		for (const p of PRESETS) {
			for (const m of p.marbles) {
				expect(m.label).toMatch(/^[a-z]$/)
				expect(m.time).toBeGreaterThanOrEqual(0)
			}
		}
	})

	test('no marble exceeds the timeline duration of 3000ms', (): void => {
		for (const p of PRESETS) {
			for (const m of p.marbles) {
				expect(m.time).toBeLessThanOrEqual(3000)
			}
		}
	})

	test('DEFAULT_PRESET_INDEX points at "Typing burst"', (): void => {
		expect(PRESETS[DEFAULT_PRESET_INDEX].name).toBe('Typing burst')
	})
})
```

- [ ] **Step 3: Run tests**

Run: `npm run test:run`
Expected: PASS — 13 tests total.

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/theme/components/debounce-playground/presets.ts docs/.vitepress/theme/components/debounce-playground/__tests__/presets.spec.ts
git commit -m "feat: define 6 preset scenarios with invariant tests"
```

---

## Task 6: Implement virtual scheduler (TDD)

**Files:**
- Create: `docs/.vitepress/theme/components/debounce-playground/virtual-scheduler.ts`
- Create: `docs/.vitepress/theme/components/debounce-playground/__tests__/virtual-scheduler.spec.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// docs/.vitepress/theme/components/debounce-playground/__tests__/virtual-scheduler.spec.ts
import { describe, test, expect } from 'vitest'
import { createVirtualScheduler } from '../virtual-scheduler'

describe('createVirtualScheduler', (): void => {
	test('now() returns the current virtual time', (): void => {
		const sched = createVirtualScheduler()
		expect(sched.now()).toBe(0)
		sched.advanceTo(500)
		expect(sched.now()).toBe(500)
	})

	test('schedule runs action at now + delay when flushed', (): void => {
		const sched = createVirtualScheduler()
		const calls: number[] = []
		sched.schedule((): void => calls.push(sched.now()), 300)
		sched.advanceTo(200)
		expect(calls).toEqual([]) // not yet
		sched.advanceTo(300)
		expect(calls).toEqual([300])
	})

	test('unsubscribing a scheduled action prevents execution', (): void => {
		const sched = createVirtualScheduler()
		const calls: number[] = []
		const sub = sched.schedule((): void => calls.push(sched.now()), 300)
		sub.unsubscribe()
		sched.advanceTo(500)
		expect(calls).toEqual([])
	})

	test('scheduled actions run in time order', (): void => {
		const sched = createVirtualScheduler()
		const calls: string[] = []
		sched.schedule((): void => calls.push('late'), 500)
		sched.schedule((): void => calls.push('early'), 100)
		sched.advanceTo(600)
		expect(calls).toEqual(['early', 'late'])
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run`
Expected: FAIL — "Cannot find module '../virtual-scheduler'".

- [ ] **Step 3: Implement the scheduler**

```typescript
// docs/.vitepress/theme/components/debounce-playground/virtual-scheduler.ts
import type { SchedulerAction, SchedulerLike, Subscription } from 'rxjs'

interface ScheduledItem {
	firesAt: number
	action: () => void
	cancelled: boolean
}

export interface VirtualScheduler extends SchedulerLike {
	advanceTo(time: number): void
	reset(): void
}

export function createVirtualScheduler(): VirtualScheduler {
	let currentTime = 0
	let queue: ScheduledItem[] = []

	const flushDue = (): void => {
		queue.sort((a: ScheduledItem, b: ScheduledItem): number => a.firesAt - b.firesAt)
		while (queue.length > 0 && queue[0].firesAt <= currentTime) {
			const item = queue.shift()!
			if (!item.cancelled) item.action()
		}
	}

	return {
		now(): number {
			return currentTime
		},
		schedule<T>(
			work: (this: SchedulerAction<T>, state?: T) => void,
			delay: number = 0,
			_state?: T
		): Subscription {
			const item: ScheduledItem = {
				firesAt: currentTime + delay,
				action: (): void => {
					// We don't use the SchedulerAction machinery here — just invoke work.
					;(work as (state?: T) => void)(undefined)
				},
				cancelled: false,
			}
			queue.push(item)
			const sub: Subscription = {
				closed: false,
				unsubscribe(): void {
					item.cancelled = true
					sub.closed = true
				},
				add(): void {},
				remove(): void {},
			} as unknown as Subscription
			return sub
		},
		advanceTo(time: number): void {
			if (time < currentTime) {
				// Going backwards means a reset; caller should call reset() instead.
				return
			}
			currentTime = time
			flushDue()
		},
		reset(): void {
			currentTime = 0
			queue = []
		},
	}
}
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `npm run test:run`
Expected: PASS — 17 tests total.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/components/debounce-playground/virtual-scheduler.ts docs/.vitepress/theme/components/debounce-playground/__tests__/virtual-scheduler.spec.ts
git commit -m "feat: implement custom VirtualScheduler driven by advanceTo()"
```

---

## Task 7: Marble-test the pipeline against all 6 presets

**Files:**
- Create: `docs/.vitepress/theme/components/debounce-playground/__tests__/pipeline.spec.ts`

- [ ] **Step 1: Write marble tests for each preset**

```typescript
// docs/.vitepress/theme/components/debounce-playground/__tests__/pipeline.spec.ts
import { describe, test, expect } from 'vitest'
import { Subject, debounceTime } from 'rxjs'
import { createVirtualScheduler } from '../virtual-scheduler'
import { PRESETS } from '../presets'
import type { Preset } from '../types'

/**
 * Drive a preset through the virtual scheduler and capture emissions.
 */
function runPreset(preset: Preset, debounceMs: number, timelineMs: number): Array<{ label: string; time: number }> {
	const sched = createVirtualScheduler()
	const subject = new Subject<string>()
	const emissions: Array<{ label: string; time: number }> = []

	const sub = subject.pipe(debounceTime(debounceMs, sched)).subscribe({
		next: (label: string): void => {
			emissions.push({ label, time: sched.now() })
		},
	})

	// Interleave marble emissions with scheduler advancement.
	let idx = 0
	for (let t = 0; t <= timelineMs; t += 10) {
		sched.advanceTo(t)
		while (idx < preset.marbles.length && preset.marbles[idx].time <= t) {
			subject.next(preset.marbles[idx].label)
			idx++
		}
	}
	subject.complete()
	sub.unsubscribe()
	return emissions
}

describe('debounceTime pipeline with virtual scheduler', (): void => {
	test('preset "Typing burst" emits once: e at ~1100', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Typing burst')!
		const result = runPreset(preset, 300, 3000)
		expect(result).toHaveLength(1)
		expect(result[0].label).toBe('e')
		expect(result[0].time).toBeGreaterThanOrEqual(1100)
		expect(result[0].time).toBeLessThanOrEqual(1110)
	})

	test('preset "Steady typing" emits 5 times', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Steady typing')!
		const result = runPreset(preset, 300, 3000)
		expect(result.map((r): string => r.label)).toEqual(['a', 'b', 'c', 'd', 'e'])
	})

	test('preset "Two bursts" emits b at ~600 and d at ~1650', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Two bursts')!
		const result = runPreset(preset, 300, 3000)
		expect(result.map((r): string => r.label)).toEqual(['b', 'd'])
	})

	test('preset "Firehose" emits once: o at ~2500', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Firehose')!
		const result = runPreset(preset, 300, 3000)
		expect(result).toHaveLength(1)
		expect(result[0].label).toBe('o')
		expect(result[0].time).toBeGreaterThanOrEqual(2500)
		expect(result[0].time).toBeLessThanOrEqual(2510)
	})

	test('preset "Lone click" emits a at ~1300', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Lone click')!
		const result = runPreset(preset, 300, 3000)
		expect(result).toHaveLength(1)
		expect(result[0].label).toBe('a')
		expect(result[0].time).toBeGreaterThanOrEqual(1300)
		expect(result[0].time).toBeLessThanOrEqual(1310)
	})

	test('preset "Emit on complete" emits b when source completes, bypassing wait', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Emit on complete')!
		const result = runPreset(preset, 300, 3000)
		expect(result).toHaveLength(1)
		expect(result[0].label).toBe('b')
		// b@2700 + 300 = 3000 → fires at/around 3000 (either via deadline or completion)
		expect(result[0].time).toBeGreaterThanOrEqual(2999)
		expect(result[0].time).toBeLessThanOrEqual(3010)
	})
})
```

- [ ] **Step 2: Run the tests**

Run: `npm run test:run`
Expected: PASS — 23 tests total. (If any preset fails, the spec's claimed output is wrong or the scheduler has a bug — debug before proceeding.)

- [ ] **Step 3: Commit**

```bash
git add docs/.vitepress/theme/components/debounce-playground/__tests__/pipeline.spec.ts
git commit -m "test: add marble tests for all 6 preset scenarios"
```

---

## Task 8: Create component skeleton and register it

**Files:**
- Create: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/operators/encyclopedia/debounceTime.md`

- [ ] **Step 1: Create the component skeleton**

```vue
<!-- docs/.vitepress/theme/components/DebounceTimePlayground.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { PRESETS, DEFAULT_PRESET_INDEX } from './debounce-playground/presets'
import type { Preset } from './debounce-playground/types'

const presetIndex = ref<number>(DEFAULT_PRESET_INDEX)
const currentPreset = (): Preset => PRESETS[presetIndex.value]
</script>

<template>
	<div class="debounce-playground" data-testid="playground-root">
		<div class="caption" data-testid="preset-description">
			{{ currentPreset().description }}
		</div>
	</div>
</template>

<style scoped>
.debounce-playground {
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	padding: 1rem;
	background: var(--vp-c-bg-soft);
	margin: 1.5rem 0;
}
.caption {
	font-size: 0.9rem;
	color: var(--vp-c-text-2);
	font-style: italic;
}
</style>
```

- [ ] **Step 2: Register the component globally**

Modify `docs/.vitepress/theme/index.ts`:
```typescript
import DefaultTheme from 'vitepress/theme'
import { type EnhanceAppContext } from 'vitepress'
import OperatorTree from './OperatorTree.vue'
import DebounceTimePlayground from './components/DebounceTimePlayground.vue'

export default {
	extends: DefaultTheme,
	enhanceApp({ app }: EnhanceAppContext) {
		app.component('OperatorTree', OperatorTree)
		app.component('DebounceTimePlayground', DebounceTimePlayground)
	},
}
```

- [ ] **Step 3: Embed in `debounceTime.md`**

In `docs/operators/encyclopedia/debounceTime.md`, insert after the `> Waits for the source ...` one-line summary (around line 14) and before the first `---` divider:

```markdown
<DebounceTimePlayground />
```

- [ ] **Step 4: Verify docs build**

Run: `npm run docs:build`
Expected: build succeeds with no errors. The encyclopedia page now renders a bordered caption box.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue docs/.vitepress/theme/index.ts docs/operators/encyclopedia/debounceTime.md
git commit -m "feat: register DebounceTimePlayground skeleton and embed in encyclopedia"
```

---

## Task 9: Build controls row + component smoke test

**Files:**
- Modify: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`
- Create: `docs/.vitepress/theme/components/debounce-playground/__tests__/DebounceTimePlayground.spec.ts`

- [ ] **Step 1: Write failing smoke test**

```typescript
// docs/.vitepress/theme/components/debounce-playground/__tests__/DebounceTimePlayground.spec.ts
import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DebounceTimePlayground from '../../DebounceTimePlayground.vue'

describe('DebounceTimePlayground', (): void => {
	test('renders preset selector with the default preset name', (): void => {
		const wrapper = mount(DebounceTimePlayground)
		const selector = wrapper.find('[data-testid="preset-selector"]')
		expect(selector.exists()).toBe(true)
		expect((selector.element as HTMLSelectElement).value).toBe('0')
	})

	test('renders play, reset, debounce slider controls', (): void => {
		const wrapper = mount(DebounceTimePlayground)
		expect(wrapper.find('[data-testid="play-button"]').exists()).toBe(true)
		expect(wrapper.find('[data-testid="reset-button"]').exists()).toBe(true)
		expect(wrapper.find('[data-testid="debounce-ms-slider"]').exists()).toBe(true)
	})

	test('debounceMs slider default is 300', (): void => {
		const wrapper = mount(DebounceTimePlayground)
		const slider = wrapper.find('[data-testid="debounce-ms-slider"]')
		expect((slider.element as HTMLInputElement).value).toBe('300')
	})
})
```

- [ ] **Step 2: Run test, confirm failure**

Run: `npm run test:run`
Expected: FAIL — preset-selector element not found.

- [ ] **Step 3: Add controls to the component**

Replace the `<script setup>` and `<template>` in `DebounceTimePlayground.vue`:
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PRESETS, DEFAULT_PRESET_INDEX } from './debounce-playground/presets'
import type { Preset } from './debounce-playground/types'

const presetIndex = ref<number>(DEFAULT_PRESET_INDEX)
const debounceMs = ref<number>(300)
const isPlaying = ref<boolean>(false)

const currentPreset = (): Preset => PRESETS[presetIndex.value]

function onPlayPause(): void {
	isPlaying.value = !isPlaying.value
}

function onReset(): void {
	isPlaying.value = false
}
</script>

<template>
	<div class="debounce-playground" data-testid="playground-root">
		<div class="controls">
			<label>
				Preset:
				<select v-model="presetIndex" data-testid="preset-selector">
					<option v-for="(p, i) in PRESETS" :key="p.name" :value="i">{{ p.name }}</option>
				</select>
			</label>
			<label class="slider-label">
				debounceTime:
				<input
					type="range"
					min="0"
					max="1000"
					step="10"
					v-model.number="debounceMs"
					data-testid="debounce-ms-slider"
				/>
				<span class="slider-value">{{ debounceMs }}ms</span>
			</label>
			<button type="button" @click="onPlayPause" data-testid="play-button">
				{{ isPlaying ? '⏸ Pause' : '▶ Play' }}
			</button>
			<button type="button" @click="onReset" data-testid="reset-button">
				↻ Reset
			</button>
		</div>
		<div class="caption" data-testid="preset-description">
			{{ currentPreset().description }}
		</div>
	</div>
</template>

<style scoped>
.debounce-playground {
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	padding: 1rem;
	background: var(--vp-c-bg-soft);
	margin: 1.5rem 0;
	font-family: var(--vp-font-family-base);
}
.controls {
	display: flex;
	gap: 1rem;
	align-items: center;
	flex-wrap: wrap;
	margin-bottom: 0.75rem;
}
.slider-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}
.slider-value {
	font-variant-numeric: tabular-nums;
	min-width: 48px;
}
button {
	padding: 0.4rem 0.8rem;
	border: 1px solid var(--vp-c-divider);
	border-radius: 4px;
	background: var(--vp-c-bg);
	cursor: pointer;
	color: var(--vp-c-text-1);
}
button:hover {
	background: var(--vp-c-bg-elv);
}
.caption {
	font-size: 0.9rem;
	color: var(--vp-c-text-2);
	font-style: italic;
}
</style>
```

- [ ] **Step 4: Run tests, confirm pass**

Run: `npm run test:run`
Expected: PASS — 26 tests total (23 existing + 3 new smoke tests).

- [ ] **Step 5: Verify docs build**

Run: `npm run docs:build`
Expected: build succeeds, encyclopedia page shows controls row.

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue docs/.vitepress/theme/components/debounce-playground/__tests__/DebounceTimePlayground.spec.ts
git commit -m "feat: add controls row (preset, slider, play/pause, reset) + smoke tests"
```

---

## Task 10: Render source lane with preset marbles

**Files:**
- Modify: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`
- Modify: `docs/.vitepress/theme/components/debounce-playground/__tests__/DebounceTimePlayground.spec.ts`

- [ ] **Step 1: Add failing test**

Append to the smoke test file:
```typescript
test('renders source marbles matching the default preset count', (): void => {
	const wrapper = mount(DebounceTimePlayground)
	const marbles = wrapper.findAll('[data-testid="source-marble"]')
	// Default preset "Typing burst" has 5 marbles
	expect(marbles).toHaveLength(5)
})

test('source marble labels match preset ordering', (): void => {
	const wrapper = mount(DebounceTimePlayground)
	const labels = wrapper.findAll('[data-testid="source-marble-label"]').map(
		(w): string => w.text()
	)
	expect(labels).toEqual(['a', 'b', 'c', 'd', 'e'])
})
```

- [ ] **Step 2: Run test, confirm failure**

Run: `npm run test:run`
Expected: FAIL — 0 elements found.

- [ ] **Step 3: Add source lane rendering**

In `DebounceTimePlayground.vue`, modify `<script setup>` to add reactive `source`:
```typescript
import { ref, computed, watch } from 'vue'
import { PRESETS, DEFAULT_PRESET_INDEX } from './debounce-playground/presets'
import { relabelMarbles } from './debounce-playground/helpers'
import type { Preset, SourceMarble } from './debounce-playground/types'

const TIMELINE_DURATION_MS = 3000

const presetIndex = ref<number>(DEFAULT_PRESET_INDEX)
const debounceMs = ref<number>(300)
const isPlaying = ref<boolean>(false)
const source = ref<SourceMarble[]>([])

function loadPreset(index: number): void {
	const preset: Preset = PRESETS[index]
	source.value = relabelMarbles(
		preset.marbles.map((m: { label: string; time: number }): SourceMarble => ({
			id: crypto.randomUUID(),
			label: m.label,
			time: m.time,
		}))
	)
	isPlaying.value = false
}

watch(presetIndex, (i: number): void => loadPreset(i), { immediate: true })

const currentPreset = (): Preset => PRESETS[presetIndex.value]
function marbleXPercent(time: number): number {
	return (time / TIMELINE_DURATION_MS) * 100
}

function onPlayPause(): void {
	isPlaying.value = !isPlaying.value
}
function onReset(): void {
	isPlaying.value = false
}
</script>
```

Add the source lane to the `<template>` (between `.caption` and the closing `</div>`):
```vue
<div class="lane source-lane" data-testid="source-lane">
	<div class="lane-label">source$</div>
	<div class="lane-track">
		<div
			v-for="m in source"
			:key="m.id"
			class="marble source-marble"
			:style="{ left: `${marbleXPercent(m.time)}%` }"
			data-testid="source-marble"
		>
			<span class="marble-label" data-testid="source-marble-label">{{ m.label }}</span>
		</div>
	</div>
</div>
```

Add styles:
```css
.lane {
	position: relative;
	padding: 0.5rem 0;
	margin: 0.5rem 0;
}
.lane-label {
	font-size: 0.85rem;
	color: var(--vp-c-text-2);
	margin-bottom: 0.25rem;
	font-family: var(--vp-font-family-mono);
}
.lane-track {
	position: relative;
	height: 32px;
	background: var(--vp-c-bg);
	border-radius: 4px;
	border: 1px solid var(--vp-c-divider);
}
.marble {
	position: absolute;
	top: 50%;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.8rem;
	font-weight: bold;
	cursor: pointer;
	user-select: none;
}
.source-marble {
	background: var(--vp-c-brand-1);
	color: var(--vp-c-bg);
}
.marble-label {
	pointer-events: none;
}
```

- [ ] **Step 4: Run tests, confirm pass**

Run: `npm run test:run`
Expected: PASS — 28 tests total.

- [ ] **Step 5: Visual check via docs dev server**

Run: `npm run docs:dev` and navigate to the encyclopedia debounceTime page. Confirm 5 green circles appear on the source lane in the correct horizontal positions (`a` leftmost at 200ms, `e` at 800ms).

Stop the dev server (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue docs/.vitepress/theme/components/debounce-playground/__tests__/DebounceTimePlayground.spec.ts
git commit -m "feat: render source lane with preset marbles"
```

---

## Task 11: Click-to-add and shift-click-to-remove source marbles

**Files:**
- Modify: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`

- [ ] **Step 1: Add click-to-add handler**

In `<script setup>`, add:
```typescript
function onLaneClick(event: MouseEvent): void {
	// Only add if the click was on the track itself, not on a marble
	const target = event.target as HTMLElement
	if (target.classList.contains('marble')) return

	const track = event.currentTarget as HTMLElement
	const rect = track.getBoundingClientRect()
	const xRatio = (event.clientX - rect.left) / rect.width
	const time = Math.round(xRatio * TIMELINE_DURATION_MS)
	if (time < 0 || time > TIMELINE_DURATION_MS) return

	const nextLabel = String.fromCharCode(97 + source.value.length)
	source.value = relabelMarbles([
		...source.value,
		{ id: crypto.randomUUID(), label: nextLabel, time },
	])
	isPlaying.value = false
}

function onMarbleClick(event: MouseEvent, marbleId: string): void {
	if (event.shiftKey || event.button === 2) {
		event.preventDefault()
		event.stopPropagation()
		source.value = relabelMarbles(source.value.filter((m: SourceMarble): boolean => m.id !== marbleId))
		isPlaying.value = false
	}
}
```

Update the `<template>` source lane:
```vue
<div
	class="lane-track"
	@click="onLaneClick"
	@contextmenu.prevent
>
	<div
		v-for="m in source"
		:key="m.id"
		class="marble source-marble"
		:style="{ left: `${marbleXPercent(m.time)}%` }"
		data-testid="source-marble"
		@click.stop="onMarbleClick($event, m.id)"
		@contextmenu.prevent="onMarbleClick($event, m.id)"
	>
		<span class="marble-label" data-testid="source-marble-label">{{ m.label }}</span>
	</div>
</div>
```

- [ ] **Step 2: Verify manually**

Run: `npm run docs:dev`. On the encyclopedia page: click the empty source track → new marble appears. Shift-click an existing marble → it disappears. Labels re-sort alphabetically.

- [ ] **Step 3: Verify tests still pass**

Run: `npm run test:run`
Expected: 28 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue
git commit -m "feat: click-to-add and shift-click-to-remove source marbles"
```

---

## Task 12: Drag-to-reposition source marbles

**Files:**
- Modify: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`

- [ ] **Step 1: Add pointer-drag handlers**

In `<script setup>`, add:
```typescript
const draggingMarbleId = ref<string | null>(null)

function onMarblePointerDown(event: PointerEvent, marbleId: string): void {
	if (event.shiftKey || event.button === 2) return
	event.preventDefault()
	draggingMarbleId.value = marbleId
	;(event.target as HTMLElement).setPointerCapture(event.pointerId)
}

function onMarblePointerMove(event: PointerEvent): void {
	if (!draggingMarbleId.value) return
	const track = (event.currentTarget as HTMLElement).closest('.lane-track') as HTMLElement | null
	if (!track) return
	const rect = track.getBoundingClientRect()
	const xRatio = Math.min(Math.max(0, (event.clientX - rect.left) / rect.width), 1)
	const newTime = Math.round(xRatio * TIMELINE_DURATION_MS)
	source.value = source.value.map(
		(m: SourceMarble): SourceMarble =>
			m.id === draggingMarbleId.value ? { ...m, time: newTime } : m
	)
}

function onMarblePointerUp(): void {
	if (!draggingMarbleId.value) return
	draggingMarbleId.value = null
	source.value = relabelMarbles(source.value)
	isPlaying.value = false
}
```

Update each marble to wire up the pointer events:
```vue
<div
	v-for="m in source"
	:key="m.id"
	class="marble source-marble"
	:class="{ dragging: draggingMarbleId === m.id }"
	:style="{ left: `${marbleXPercent(m.time)}%` }"
	data-testid="source-marble"
	@click.stop="onMarbleClick($event, m.id)"
	@contextmenu.prevent="onMarbleClick($event, m.id)"
	@pointerdown="onMarblePointerDown($event, m.id)"
	@pointermove="onMarblePointerMove($event)"
	@pointerup="onMarblePointerUp"
	@pointercancel="onMarblePointerUp"
>
	<span class="marble-label" data-testid="source-marble-label">{{ m.label }}</span>
</div>
```

Add dragging style:
```css
.marble.dragging {
	transform: translate(-50%, -50%) scale(1.2);
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	z-index: 10;
}
```

- [ ] **Step 2: Verify manually**

Run `npm run docs:dev`. Drag a marble horizontally — it moves smoothly, then snaps and relabels on release.

- [ ] **Step 3: Verify tests still pass**

Run: `npm run test:run`
Expected: 28 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue
git commit -m "feat: drag-to-reposition source marbles with pointer events"
```

---

## Task 13: Output lane with computed marbles and ghost

**Files:**
- Modify: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`
- Modify: `docs/.vitepress/theme/components/debounce-playground/__tests__/DebounceTimePlayground.spec.ts`

- [ ] **Step 1: Write failing test**

```typescript
test('renders an output lane (initially empty)', (): void => {
	const wrapper = mount(DebounceTimePlayground)
	expect(wrapper.find('[data-testid="output-lane"]').exists()).toBe(true)
	expect(wrapper.findAll('[data-testid="output-marble"]')).toHaveLength(0)
})
```

- [ ] **Step 2: Run test, confirm failure**

Run: `npm run test:run`
Expected: FAIL — output-lane not found.

- [ ] **Step 3: Add reactive state and ghost computation**

In `<script setup>`, add after the `source` ref:
```typescript
import { computeGhost } from './debounce-playground/helpers'
import type { OutputMarble, GhostMarble } from './debounce-playground/types'

const currentTime = ref<number>(0)
const output = ref<OutputMarble[]>([])

const ghost = computed((): GhostMarble | null =>
	computeGhost(source.value, currentTime.value, debounceMs.value, output.value)
)

// Expose so template resetPlayback helpers can clear output:
function clearPlaybackState(): void {
	currentTime.value = 0
	output.value = []
}

// Update onReset and loadPreset to clear playback state too
function onReset(): void {
	isPlaying.value = false
	clearPlaybackState()
}
```

Modify `loadPreset`:
```typescript
function loadPreset(index: number): void {
	const preset: Preset = PRESETS[index]
	source.value = relabelMarbles(
		preset.marbles.map((m: { label: string; time: number }): SourceMarble => ({
			id: crypto.randomUUID(),
			label: m.label,
			time: m.time,
		}))
	)
	isPlaying.value = false
	clearPlaybackState()
}
```

Also call `clearPlaybackState()` inside `onLaneClick`, `onMarbleClick` (remove branch), and `onMarblePointerUp` right after each edit.

Add the output lane to the `<template>`, after the source lane:
```vue
<div class="lane output-lane" data-testid="output-lane">
	<div class="lane-label">output$</div>
	<div class="lane-track">
		<div
			v-for="o in output"
			:key="o.id"
			class="marble output-marble"
			:style="{ left: `${marbleXPercent(o.time)}%` }"
			data-testid="output-marble"
		>
			<span class="marble-label">{{ o.sourceLabel }}</span>
		</div>
		<div
			v-if="ghost"
			class="marble ghost-marble"
			:style="{ left: `${marbleXPercent(ghost.firesAt)}%` }"
			data-testid="ghost-marble"
			:title="`fires at t=${ghost.firesAt}ms`"
		>
			<span class="marble-label">{{ ghost.sourceLabel }}</span>
		</div>
	</div>
</div>
```

Add styles:
```css
.output-marble {
	background: var(--vp-c-tip-1);
	color: var(--vp-c-bg);
}
.ghost-marble {
	background: transparent;
	border: 2px dashed var(--vp-c-tip-1);
	color: var(--vp-c-tip-1);
	opacity: 0.6;
}
```

- [ ] **Step 4: Run test, confirm pass**

Run: `npm run test:run`
Expected: PASS — 29 tests total.

- [ ] **Step 5: Visual check**

Run: `npm run docs:dev`. On the encyclopedia page, the output lane appears below the source lane. With 5 source marbles at rest, no output or ghost marble yet (because `currentTime = 0`; nothing consumed).

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue docs/.vitepress/theme/components/debounce-playground/__tests__/DebounceTimePlayground.spec.ts
git commit -m "feat: render output lane with emitted marbles and ghost marble"
```

---

## Task 14: Playback loop with time cursor and RxJS pipeline

**Files:**
- Modify: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`

- [ ] **Step 1: Import RxJS + scheduler**

Update imports at the top of `<script setup>`:
```typescript
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Subject, debounceTime, type Subscription } from 'rxjs'
import { createVirtualScheduler, type VirtualScheduler } from './debounce-playground/virtual-scheduler'
```

- [ ] **Step 2: Add playback loop and pipeline state**

**Replace the existing `onReset` function** (defined in Task 13) with the fuller version below, and add the new `buildPipeline` / `tick` / `startPlayback` / `onPlayPause` / lifecycle code after the existing refs:
```typescript
const PLAYBACK_DURATION_MS = 6000
const statusMessage = ref<string>('idle — waiting for input')

let scheduler: VirtualScheduler | null = null
let pipelineSubject: Subject<SourceMarble> | null = null
let pipelineSubscription: Subscription | null = null
let nextSourceIdx = 0
let playStartWall = 0
let animationFrameId: number | null = null

function buildPipeline(): void {
	scheduler?.reset()
	pipelineSubscription?.unsubscribe()
	pipelineSubject?.complete()

	scheduler = createVirtualScheduler()
	pipelineSubject = new Subject<SourceMarble>()
	pipelineSubscription = pipelineSubject
		.pipe(debounceTime(debounceMs.value, scheduler))
		.subscribe({
			next: (marble: SourceMarble): void => {
				output.value.push({
					id: crypto.randomUUID(),
					sourceLabel: marble.label,
					time: scheduler!.now(),
				})
				statusMessage.value = `emitted '${marble.label}' at t=${Math.round(scheduler!.now())}ms`
			},
		})
	nextSourceIdx = 0
}

function tick(): void {
	if (!isPlaying.value || !scheduler || !pipelineSubject) return
	const wallElapsed = performance.now() - playStartWall
	const virtualTime = Math.min(
		TIMELINE_DURATION_MS,
		wallElapsed * (TIMELINE_DURATION_MS / PLAYBACK_DURATION_MS)
	)
	currentTime.value = virtualTime
	scheduler.advanceTo(virtualTime)

	while (nextSourceIdx < source.value.length && source.value[nextSourceIdx].time <= virtualTime) {
		pipelineSubject.next(source.value[nextSourceIdx])
		nextSourceIdx++
	}

	if (virtualTime >= TIMELINE_DURATION_MS) {
		pipelineSubject.complete()
		scheduler.advanceTo(TIMELINE_DURATION_MS)
		isPlaying.value = false
		return
	}
	animationFrameId = requestAnimationFrame(tick)
}

function startPlayback(): void {
	buildPipeline()
	clearPlaybackState()
	playStartWall = performance.now()
	isPlaying.value = true
	animationFrameId = requestAnimationFrame(tick)
}

function onPlayPause(): void {
	if (isPlaying.value) {
		isPlaying.value = false
		if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
	} else {
		startPlayback()
	}
}

function onReset(): void {
	isPlaying.value = false
	if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
	scheduler?.reset()
	pipelineSubscription?.unsubscribe()
	pipelineSubject?.complete()
	scheduler = null
	pipelineSubject = null
	pipelineSubscription = null
	clearPlaybackState()
	statusMessage.value = 'idle — waiting for input'
}

onBeforeUnmount((): void => {
	if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
	pipelineSubscription?.unsubscribe()
	pipelineSubject?.complete()
})
```

- [ ] **Step 3: Add time cursor to template**

Inside each `.lane-track` (both source and output lanes), add at the end:
```vue
<div
	v-if="isPlaying || currentTime > 0"
	class="time-cursor"
	:style="{ left: `${marbleXPercent(currentTime)}%` }"
	data-testid="time-cursor"
/>
```

Add status caption below the output lane:
```vue
<div class="status-caption" data-testid="status-caption">
	{{ statusMessage }}
</div>
```

Add styles:
```css
.time-cursor {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 1px;
	background: var(--vp-c-text-2);
	pointer-events: none;
}
.status-caption {
	font-size: 0.85rem;
	color: var(--vp-c-text-2);
	font-family: var(--vp-font-family-mono);
	margin-top: 0.5rem;
	min-height: 1.2em;
}
```

- [ ] **Step 4: Verify manually**

Run: `npm run docs:dev`. Click ▶ Play. A cursor sweeps left-to-right across both lanes (takes 6 seconds). As source marbles are crossed, the ghost marble updates. When the debounce window elapses, a solid output marble appears.

- [ ] **Step 5: Verify tests still pass**

Run: `npm run test:run`
Expected: PASS — 29 tests.

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue
git commit -m "feat: animated playback loop with time cursor and RxJS pipeline"
```

---

## Task 15: Live-update `debounceMs` slider during playback

**Files:**
- Modify: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`

- [ ] **Step 1: Add watcher to rebuild pipeline on slider change**

In `<script setup>`, add after the other `watch` calls:
```typescript
watch(debounceMs, (): void => {
	if (!isPlaying.value) return
	// Rebuild the pipeline with the new debounce value, preserving current virtual time.
	const resumeTime = currentTime.value
	pipelineSubscription?.unsubscribe()
	pipelineSubject?.complete()
	scheduler = createVirtualScheduler()
	pipelineSubject = new Subject<SourceMarble>()
	pipelineSubscription = pipelineSubject
		.pipe(debounceTime(debounceMs.value, scheduler))
		.subscribe({
			next: (marble: SourceMarble): void => {
				output.value.push({
					id: crypto.randomUUID(),
					sourceLabel: marble.label,
					time: scheduler!.now(),
				})
				statusMessage.value = `emitted '${marble.label}' at t=${Math.round(scheduler!.now())}ms`
			},
		})
	scheduler.advanceTo(resumeTime)
	// Replay consumed marbles so the operator's internal state is correct at resumeTime
	nextSourceIdx = 0
	while (nextSourceIdx < source.value.length && source.value[nextSourceIdx].time <= resumeTime) {
		pipelineSubject.next(source.value[nextSourceIdx])
		nextSourceIdx++
	}
})
```

**Note on the duplicated pipeline construction:** this is a known DRY violation — `buildPipeline` and this watcher share setup. If the file grows, extract both into a single helper (e.g., `rebuildPipelineAt(time: number)`). Deferred to v2 to keep this task focused.

- [ ] **Step 2: Verify manually**

Run: `npm run docs:dev`. Click Play. While playing, drag the `debounceMs` slider. The ghost marble should jump to reflect the new deadline. Output stays consistent — no duplicate emissions.

- [ ] **Step 3: Verify tests still pass**

Run: `npm run test:run`
Expected: PASS — 29 tests.

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue
git commit -m "feat: live-update debounceMs slider rebuilds pipeline mid-playback"
```

---

## Task 16: Update status caption with live silence-timer countdown

**Files:**
- Modify: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`

- [ ] **Step 1: Derive status message from state**

Replace the `statusMessage` ref with a computed:
```typescript
// Remove: const statusMessage = ref<string>('idle — waiting for input')
// Remove: statusMessage.value = ... assignments inside subscribe, onReset

const lastEmittedLabel = ref<string | null>(null)
const justEmittedFlash = ref<number>(0) // timestamp of last emission

// Inside the subscribe next handler, REPLACE the statusMessage.value line with:
//   lastEmittedLabel.value = marble.label
//   justEmittedFlash.value = scheduler!.now()

const statusMessage = computed((): string => {
	// Just-emitted flash (500ms virtual window)
	if (lastEmittedLabel.value && currentTime.value - justEmittedFlash.value < 300) {
		return `emitted '${lastEmittedLabel.value}' at t=${Math.round(justEmittedFlash.value)}ms`
	}
	// Active silence timer
	if (ghost.value) {
		const remaining = Math.max(0, ghost.value.firesAt - currentTime.value)
		return `silence active · ${Math.round(remaining)}ms until next emit${
			lastEmittedLabel.value ? ` · last emit: '${lastEmittedLabel.value}'` : ''
		}`
	}
	return 'idle — waiting for input'
})
```

Also clear `lastEmittedLabel` in `onReset` and `loadPreset`:
```typescript
function clearPlaybackState(): void {
	currentTime.value = 0
	output.value = []
	lastEmittedLabel.value = null
	justEmittedFlash.value = 0
}
```

- [ ] **Step 2: Verify manually**

Run: `npm run docs:dev`. Click Play. Watch the caption narrate: `idle` → `silence active · NNms until next emit` → `emitted 'e' at t=1100ms` → `idle`. The countdown ticks down smoothly.

- [ ] **Step 3: Verify tests still pass**

Run: `npm run test:run`
Expected: PASS — 29 tests.

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue
git commit -m "feat: live silence-timer countdown in status caption"
```

---

## Task 17: Final visual polish and documentation

**Files:**
- Modify: `docs/.vitepress/theme/components/DebounceTimePlayground.vue`
- Modify: `docs/operators/encyclopedia/debounceTime.md`

- [ ] **Step 1: Tighten spacing and alignment**

In the component's `<style scoped>`, refine the overall layout:
```css
.debounce-playground {
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	padding: 1.25rem;
	background: var(--vp-c-bg-soft);
	margin: 1.5rem 0;
	font-family: var(--vp-font-family-base);
	max-width: 100%;
	overflow-x: auto;
}
.lane-track {
	min-width: 500px; /* prevent crush on narrow screens */
}
```

- [ ] **Step 2: Add a short heading above the playground in the markdown**

In `docs/operators/encyclopedia/debounceTime.md`, change the embedded line from:
```markdown
<DebounceTimePlayground />
```
to:
```markdown
#### Interactive Playground

Drag the marbles on the source lane, adjust the `debounceTime(ms)` slider, and press ▶ Play to see how the silence-timer resets as each new source value arrives. Shift-click a marble to remove it.

<DebounceTimePlayground />
```

- [ ] **Step 3: Full docs build**

Run: `npm run docs:build`
Expected: build succeeds, no errors.

- [ ] **Step 4: Run full test suite**

Run: `npm run test:run`
Expected: PASS — 29 tests total.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/components/DebounceTimePlayground.vue docs/operators/encyclopedia/debounceTime.md
git commit -m "polish: tighten playground spacing + add usage heading in debounceTime.md"
```

---

## Done

At this point:
- 29 tests passing (5 helpers + 3 presets + 4 scheduler + 6 pipeline + 11 component)
- Component renders correctly in `docs/operators/encyclopedia/debounceTime.md`
- Full `npm run docs:build` passes
- Every interaction (preset, slider, play, pause, reset, click-to-add, drag, shift-click-remove) works
- Ghost marble visibly jumps when new source marbles arrive during playback

**Deferred to v2 (tracked in the spec's Open Questions section):**
- Playback speed slider
- Keyboard shortcuts (Space / R / ←→)
- Keyboard-accessible marble dragging
- DRY refactor of pipeline construction (extract shared helper)
