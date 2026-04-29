# Inline Operator Detail Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user reaches a leaf node and clicks an operator name, the panel is replaced by a rich detail view showing the gold-standard SVG marble, a code sample, and expandable gotchas/related sections — all bundled at build time, no external requests.

**Architecture:** MVU state gains `detailView: { operatorName, oneliner } | null`. Two new actions (`open-detail`, `close-detail`) drive it. SVG marble renderers are pure TS functions ported from `rxjs-operator-documentation/docs/components/`. Text content (code, gotchas, related) is pre-extracted from the `rxjs-operator-explain-claude/` cache into a committed TS data file.

**Tech Stack:** Vanilla TypeScript, RxJS 7.8, Vite 7, Vitest 4

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `src/tree/tree.types.ts` | Modify | Add `DetailView` type + 2 action variants |
| `src/state/tree.reducer.ts` | Modify | Handle `open-detail`, `close-detail`; clear `detailView` in `back`/`reset` |
| `src/state/tree.state.test.ts` | Modify | Tests for new reducer cases |
| `src/marble/marble.types.ts` | Create | `FirstOrderDiagramConfig` + `MarbleDiagramConfig` interfaces |
| `src/marble/render-first-order.ts` | Create | `renderFirstOrderSVG(config): string` |
| `src/marble/render-higher-order.ts` | Create | `renderHigherOrderSVG(config): string` |
| `src/marble/configs/switchMap.ts` | Create | Higher-order config (ported) |
| `src/marble/configs/mergeMap.ts` | Create | Higher-order config (ported) |
| `src/marble/configs/concatMap.ts` | Create | Higher-order config (ported) |
| `src/marble/configs/exhaustMap.ts` | Create | Higher-order config (ported) |
| `src/marble/configs/<op>.ts` | Create | One first-order config per remaining tree operator |
| `src/marble/configs/index.ts` | Create | Registry + `getMarbleSVG(wikiPath): string \| null` |
| `src/data/explanations.ts` | Create | Generated — code/gotchas/related per operator |
| `scripts/extract-explanations.ts` | Create | Node script that reads cache and writes `explanations.ts` |
| `src/ui/detail.ts` | Create | `renderDetail(container, detailView): void` |
| `src/ui/panel.ts` | Modify | Route to `renderDetail`; operator name → `<button>` |
| `src/style.css` | Modify | Detail panel styles |

---

## Task 1: Extend types

**Files:**
- Modify: `src/tree/tree.types.ts`

- [ ] **Replace the file contents:**

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

export interface DetailView {
	operatorName: string
	oneliner:     string
	wikiPath:     string
}

export interface TreeState {
	currentNode: TreeNode
	history:     QuestionNode[]
	breadcrumb:  BreadcrumbStep[]
	detailView:  DetailView | null
}

export interface BreadcrumbStep {
	nodeId: string
	label:  string
}

export type Action =
	| { kind: 'answer'; next: TreeNode; label: string }
	| { kind: 'back' }
	| { kind: 'reset' }
	| { kind: 'open-detail';  operatorName: string; oneliner: string; wikiPath: string }
	| { kind: 'close-detail' }
```

> Note: `wikiPath` is added to `open-detail` so the marble registry can use it directly as a lookup key (e.g. `/operators/switchMap` → `switchMap`), avoiding name normalisation for variants like `take(n)`.

- [ ] **Commit:**

```bash
git add src/tree/tree.types.ts
git commit -m "feat: add DetailView type and open-detail/close-detail actions"
```

---

## Task 2: Extend reducer (TDD)

**Files:**
- Modify: `src/state/tree.state.test.ts`
- Modify: `src/state/tree.reducer.ts`

- [ ] **Update `mockInitial` in `src/state/tree.state.test.ts`** — add the new `detailView` field so it satisfies the updated `TreeState` type:

```typescript
const mockInitial: TreeState = {
	currentNode: MOCK_ROOT,
	history:     [],
	breadcrumb:  [],
	detailView:  null,   // ADD THIS LINE
}
```

- [ ] **Add tests to `src/state/tree.state.test.ts`** (append after the existing `describe` block):

```typescript
describe('treeReducer — detailView', () => {
	const mockInitialWithDetail: TreeState = {
		...mockInitial,
		detailView: null,
	}
	const reducerWithDetail = makeReducer(mockInitialWithDetail)

	test('open-detail sets detailView, leaves currentNode unchanged', () => {
		const next = reducerWithDetail(mockInitialWithDetail, {
			kind: 'open-detail',
			operatorName: 'filter',
			oneliner: 'Emit only matching values.',
			wikiPath: '/operators/filter',
		})
		expect(next.detailView).toEqual({
			operatorName: 'filter',
			oneliner: 'Emit only matching values.',
			wikiPath: '/operators/filter',
		})
		expect(next.currentNode).toBe(MOCK_ROOT)
	})

	test('close-detail clears detailView', () => {
		const withDetail: TreeState = {
			...mockInitialWithDetail,
			detailView: { operatorName: 'filter', oneliner: 'x', wikiPath: '/operators/filter' },
		}
		const next = reducerWithDetail(withDetail, { kind: 'close-detail' })
		expect(next.detailView).toBeNull()
	})

	test('back clears detailView', () => {
		const afterAnswer = reducerWithDetail(mockInitialWithDetail, {
			kind: 'answer', next: MOCK_LEAF, label: 'Answer A',
		})
		const withDetail: TreeState = {
			...afterAnswer,
			detailView: { operatorName: 'of', oneliner: 'x', wikiPath: '/operators/of' },
		}
		const afterBack = reducerWithDetail(withDetail, { kind: 'back' })
		expect(afterBack.detailView).toBeNull()
	})

	test('reset clears detailView', () => {
		const withDetail: TreeState = {
			...mockInitialWithDetail,
			detailView: { operatorName: 'map', oneliner: 'x', wikiPath: '/operators/map' },
		}
		const afterReset = reducerWithDetail(withDetail, { kind: 'reset' })
		expect(afterReset.detailView).toBeNull()
	})
})
```

- [ ] **Run tests — expect failures:**

```bash
npm test
```

Expected: `open-detail` and `close-detail` cases fail (not yet implemented).

- [ ] **Update `src/state/tree.reducer.ts`:**

```typescript
// src/state/tree.reducer.ts
import type { Action, TreeState } from '../tree/tree.types'

export function makeReducer(initial: TreeState): (state: TreeState, action: Action) => TreeState {
	return function treeReducer(state: TreeState, action: Action): TreeState {
		switch (action.kind) {
			case 'answer': {
				if (state.currentNode.kind !== 'question') return state
				return {
					currentNode: action.next,
					history:     [...state.history, state.currentNode],
					breadcrumb:  [...state.breadcrumb, { nodeId: state.currentNode.id, label: action.label }],
					detailView:  null,
				}
			}
			case 'back':
				if (state.history.length === 0) return state
				return {
					currentNode: state.history.at(-1)!,
					history:     state.history.slice(0, -1),
					breadcrumb:  state.breadcrumb.slice(0, -1),
					detailView:  null,
				}
			case 'reset':
				return initial
			case 'open-detail':
				return {
					...state,
					detailView: {
						operatorName: action.operatorName,
						oneliner:     action.oneliner,
						wikiPath:     action.wikiPath,
					},
				}
			case 'close-detail':
				return { ...state, detailView: null }
		}
	}
}
```

- [ ] **Update `src/state/tree.state.ts`** — add `detailView: null` to initial state:

```typescript
// src/state/tree.state.ts
import { Subject, scan, startWith, shareReplay } from 'rxjs'
import { ROOT } from '../tree/tree.config'
import { makeReducer } from './tree.reducer'
import type { Action, TreeState } from '../tree/tree.types'

export const action$ = new Subject<Action>()

export const initial: TreeState = {
	currentNode: ROOT,
	history:     [],
	breadcrumb:  [],
	detailView:  null,
}

const treeReducer = makeReducer(initial)

export const state$ = action$.pipe(
	scan(treeReducer, initial),
	startWith(initial),
	shareReplay(1),
)
```

- [ ] **Run tests — all pass:**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Commit:**

```bash
git add src/tree/tree.types.ts src/state/tree.reducer.ts src/state/tree.state.ts src/state/tree.state.test.ts
git commit -m "feat: reducer handles open-detail and close-detail actions"
```

---

## Task 3: Marble types

**Files:**
- Create: `src/marble/marble.types.ts`

- [ ] **Create the file:**

```typescript
// src/marble/marble.types.ts

// ── First-order (single source → result) ──────────────────────────────────

export interface FirstOrderValue {
	time:         number
	label:        string
	color:        string
	active:       boolean       // true → solid + drop line + result; false → dimmed (filtered)
	resultTime?:  number        // where result circle lands (defaults to same time)
	resultLabel?: string        // label in result circle (defaults to same label)
}

export interface FirstOrderDiagramConfig {
	title?:       string
	operatorName: string
	totalTime:    number
	source: {
		values:       FirstOrderValue[]
		completedAt?: number
	}
	result: {
		completedAt?: number
	}
}

// ── Higher-order (source spawns inner Observables) ────────────────────────

export interface SourceEmission {
	time:              number
	label:             string
	color:             string
	spawnsInnerIndex?: number | null
}

export interface InnerValue {
	time:   number
	label:  string
	active: boolean
}

export interface InnerObservable {
	color:        string
	startTime:    number
	cancelledAt?: number
	completedAt?: number
	values:       InnerValue[]
}

export interface ResultValue {
	time:  number
	label: string
	color: string
}

export interface MarbleDiagramConfig {
	title?:       string
	operatorName: string
	totalTime:    number
	source: {
		emissions:    SourceEmission[]
		completedAt?: number
	}
	inners:  InnerObservable[]
	result: {
		values:       ResultValue[]
		completedAt?: number
	}
}
```

- [ ] **Commit:**

```bash
git add src/marble/marble.types.ts
git commit -m "feat: add marble diagram config types"
```

---

## Task 4: First-order SVG renderer

**Files:**
- Create: `src/marble/render-first-order.ts`
- Create: `src/marble/render-first-order.test.ts`

- [ ] **Write the failing test first:**

```typescript
// src/marble/render-first-order.test.ts
import { describe, test, expect } from 'vitest'
import { renderFirstOrderSVG } from './render-first-order'
import type { FirstOrderDiagramConfig } from './marble.types'

const config: FirstOrderDiagramConfig = {
	operatorName: 'filter',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 5, label: 'b', color: '#34d399', active: false },
			{ time: 8, label: 'c', color: '#fb923c', active: true },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}

describe('renderFirstOrderSVG', () => {
	test('returns a string starting with <svg', () => {
		expect(renderFirstOrderSVG(config)).toMatch(/^<svg/)
	})
	test('contains operator name', () => {
		expect(renderFirstOrderSVG(config)).toContain('filter')
	})
	test('contains 3 source circles', () => {
		const svg = renderFirstOrderSVG(config)
		expect((svg.match(/class="src-circle/g) ?? []).length).toBe(3)
	})
	test('active values have opacity 1; inactive have opacity 0.25', () => {
		const svg = renderFirstOrderSVG(config)
		expect(svg).toContain('opacity="1"')
		expect(svg).toContain('opacity="0.25"')
	})
})
```

- [ ] **Run test to confirm failure:**

```bash
npm test src/marble/render-first-order.test.ts
```

Expected: `Cannot find module './render-first-order'`

- [ ] **Create `src/marble/render-first-order.ts`:**

```typescript
// src/marble/render-first-order.ts
import type { FirstOrderDiagramConfig, FirstOrderValue } from './marble.types'

const SVG_W    = 900
const LABEL_X  = 104
const TL_START = 110
const TL_END   = 830
const ARROW_END = TL_END + 40
const CIRCLE_R = 14
const SOURCE_Y = 80
const RESULT_Y = 200
const OP_BOX_Y = 118
const SVG_H    = 260

function x(t: number, totalTime: number): number {
	return TL_START + (t / totalTime) * (TL_END - TL_START)
}

function isShifted(v: FirstOrderValue): boolean {
	return v.resultTime !== undefined && v.resultTime !== v.time
}

export function renderFirstOrderSVG(config: FirstOrderDiagramConfig): string {
	const tt = config.totalTime
	const active = config.source.values.filter(v => v.active)

	const sourceCircles = config.source.values.map(v => {
		const cx = x(v.time, tt)
		const op = v.active ? 1 : 0.25
		const sw = v.active ? 2.5 : 1.5
		const fw = v.active ? 600 : 400
		return `<g>
			<circle class="src-circle" cx="${cx}" cy="${SOURCE_Y}" r="${CIRCLE_R}"
				fill="#0f172a" stroke="${v.color}" stroke-width="${sw}" opacity="${op}"/>
			<text x="${cx}" y="${SOURCE_Y + 4}" text-anchor="middle"
				fill="${v.color}" font-size="11" font-weight="${fw}" opacity="${op}">${v.label}</text>
		</g>`
	}).join('\n')

	const completionSource = config.source.completedAt
		? `<line x1="${x(config.source.completedAt, tt)}" y1="${SOURCE_Y - 12}"
			x2="${x(config.source.completedAt, tt)}" y2="${SOURCE_Y + 12}"
			stroke="#475569" stroke-width="2.5"/>`
		: ''

	const dropLines = active.map(v => {
		const x1 = x(v.time, tt)
		const x2 = x(v.resultTime ?? v.time, tt)
		return `<line x1="${x1}" y1="${SOURCE_Y + CIRCLE_R}"
			x2="${x2}" y2="${RESULT_Y - CIRCLE_R}"
			stroke="${v.color}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.45"/>`
	}).join('\n')

	const resultCircles = active.map(v => {
		const cx = x(v.resultTime ?? v.time, tt)
		return `<g>
			<circle cx="${cx}" cy="${RESULT_Y}" r="${CIRCLE_R}"
				fill="#0f172a" stroke="${v.color}" stroke-width="2.5"/>
			<text x="${cx}" y="${RESULT_Y + 4}" text-anchor="middle"
				fill="${v.color}" font-size="11" font-weight="600">${v.resultLabel ?? v.label}</text>
		</g>`
	}).join('\n')

	const completionResult = config.result.completedAt
		? `<line x1="${x(config.result.completedAt, tt)}" y1="${RESULT_Y - 12}"
			x2="${x(config.result.completedAt, tt)}" y2="${RESULT_Y + 12}"
			stroke="#475569" stroke-width="2.5"/>`
		: ''

	const title = config.title ?? `${config.operatorName} — marble diagram`

	return `<svg width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}"
		xmlns="http://www.w3.org/2000/svg"
		font-family="ui-monospace,'Cascadia Code','JetBrains Mono',monospace"
		font-size="12" role="img" aria-label="${config.operatorName} marble diagram">
	<defs>
		<marker id="arr-fo" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
			<polygon points="0 0,10 3.5,0 7" fill="#475569"/>
		</marker>
	</defs>
	<rect width="${SVG_W}" height="${SVG_H}" fill="#0f172a" rx="12"/>
	<text x="${SVG_W / 2}" y="30" text-anchor="middle" fill="#e2e8f0"
		font-size="14" font-weight="600" letter-spacing="0.5">${title}</text>
	<text x="${LABEL_X}" y="${SOURCE_Y}" text-anchor="end" dominant-baseline="middle"
		fill="#64748b" font-size="11">source</text>
	<text x="${LABEL_X}" y="${RESULT_Y}" text-anchor="end" dominant-baseline="middle"
		fill="#64748b" font-size="11">result</text>
	<line x1="${TL_START}" y1="${SOURCE_Y}" x2="${ARROW_END}" y2="${SOURCE_Y}"
		stroke="#475569" stroke-width="1.5" marker-end="url(#arr-fo)"/>
	${sourceCircles}
	${completionSource}
	${dropLines}
	<rect x="${SVG_W / 2 - 155}" y="${OP_BOX_Y}" width="310" height="28"
		rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
	<text x="${SVG_W / 2}" y="${OP_BOX_Y + 14}" text-anchor="middle" dominant-baseline="middle"
		fill="#94a3b8" font-size="12" letter-spacing="2" font-weight="500">${config.operatorName}</text>
	<line x1="${TL_START}" y1="${RESULT_Y}" x2="${ARROW_END}" y2="${RESULT_Y}"
		stroke="#475569" stroke-width="1.5" marker-end="url(#arr-fo)"/>
	${resultCircles}
	${completionResult}
	<g transform="translate(110,${SVG_H - 22})" fill="#475569" font-size="10">
		<circle cx="6" cy="5" r="5" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
		<text x="16" y="9">passes to result</text>
		<circle cx="170" cy="5" r="5" fill="none" stroke="#94a3b8" stroke-width="1" opacity="0.3"/>
		<text x="180" y="9" opacity="0.45">filtered / dropped</text>
		<line x1="340" y1="5" x2="365" y2="5"
			stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.5"/>
		<text x="372" y="9">drop line</text>
	</g>
</svg>`
}
```

- [ ] **Run tests — all pass:**

```bash
npm test src/marble/render-first-order.test.ts
```

- [ ] **Commit:**

```bash
git add src/marble/render-first-order.ts src/marble/render-first-order.test.ts
git commit -m "feat: first-order SVG marble renderer"
```

---

## Task 5: Higher-order SVG renderer

**Files:**
- Create: `src/marble/render-higher-order.ts`
- Create: `src/marble/render-higher-order.test.ts`

- [ ] **Write the failing test:**

```typescript
// src/marble/render-higher-order.test.ts
import { describe, test, expect } from 'vitest'
import { renderHigherOrderSVG } from './render-higher-order'
import type { MarbleDiagramConfig } from './marble.types'

const config: MarbleDiagramConfig = {
	operatorName: 'switchMap',
	totalTime: 9,
	source: {
		emissions: [
			{ time: 1, label: 'A', color: '#a78bfa' },
			{ time: 3, label: 'B', color: '#fb923c' },
		],
	},
	inners: [
		{
			color: '#a78bfa', startTime: 1, cancelledAt: 3,
			values: [{ time: 2, label: 'a1', active: true }],
		},
		{
			color: '#fb923c', startTime: 3, completedAt: 9,
			values: [{ time: 5, label: 'b1', active: true }],
		},
	],
	result: {
		values: [
			{ time: 2, label: 'a1', color: '#a78bfa' },
			{ time: 5, label: 'b1', color: '#fb923c' },
		],
	},
}

describe('renderHigherOrderSVG', () => {
	test('returns a string starting with <svg', () => {
		expect(renderHigherOrderSVG(config)).toMatch(/^<svg/)
	})
	test('contains operator name', () => {
		expect(renderHigherOrderSVG(config)).toContain('switchMap')
	})
	test('contains cancellation marks for cancelled inners', () => {
		expect(renderHigherOrderSVG(config)).toContain('class="cancel-mark"')
	})
})
```

- [ ] **Run to confirm failure:**

```bash
npm test src/marble/render-higher-order.test.ts
```

- [ ] **Create `src/marble/render-higher-order.ts`:**

```typescript
// src/marble/render-higher-order.ts
import type { MarbleDiagramConfig, SourceEmission, InnerObservable } from './marble.types'

const SVG_W         = 900
const LABEL_X       = 104
const TL_START      = 110
const TL_END        = 830
const ARROW_END     = TL_END + 40
const CIRCLE_R      = 14
const SOURCE_Y      = 80
const FIRST_INNER_Y = 185
const INNER_SPACING = 90
const QUEUE_CHANNEL_Y = SOURCE_Y + 28

function x(t: number, totalTime: number): number {
	return TL_START + (t / totalTime) * (TL_END - TL_START)
}

function innerY(i: number): number {
	return FIRST_INNER_Y + i * INNER_SPACING
}

function ghostPx(totalTime: number): number {
	return 1.3 * (TL_END - TL_START) / totalTime
}

function resolveSpawn(em: SourceEmission, ei: number): number | null {
	if (em.spawnsInnerIndex === null) return null
	if (typeof em.spawnsInnerIndex === 'number') return em.spawnsInnerIndex
	return ei
}

function spawnPath(em: SourceEmission, innerIdx: number, inners: InnerObservable[], tt: number): string {
	const x1 = x(em.time, tt)
	const y1 = SOURCE_Y + CIRCLE_R
	const x2 = x(inners[innerIdx].startTime, tt)
	const y2 = innerY(innerIdx) - CIRCLE_R
	if (em.time === inners[innerIdx].startTime) {
		return `M ${x1},${y1} V ${y2}`
	}
	return `M ${x1},${y1} V ${QUEUE_CHANNEL_Y} H ${x2} V ${y2}`
}

function innerLabel(i: number): string {
	return `inner ${String.fromCharCode(65 + i)}`
}

export function renderHigherOrderSVG(config: MarbleDiagramConfig): string {
	const tt = config.totalTime
	const numInners = config.inners.length
	const lastInnerY = FIRST_INNER_Y + (numInners - 1) * INNER_SPACING
	const resultY = lastInnerY + 100
	const operatorBoxY = lastInnerY + 28
	const svgH = resultY + 55
	const ghost = ghostPx(tt)

	const sourceCircles = config.source.emissions.map((em, ei) => {
		const spawned = resolveSpawn(em, ei)
		const op = spawned !== null ? 1 : 0.25
		const sw = spawned !== null ? 2.5 : 1.5
		const cx = x(em.time, tt)
		return `<g>
			<circle cx="${cx}" cy="${SOURCE_Y}" r="${CIRCLE_R}"
				fill="#0f172a" stroke="${em.color}" stroke-width="${sw}" opacity="${op}"/>
			<text x="${cx}" y="${SOURCE_Y + 4}" text-anchor="middle"
				fill="${em.color}" font-weight="700" opacity="${op}">${em.label}</text>
		</g>`
	}).join('\n')

	const sourceCompletion = config.source.completedAt
		? `<line x1="${x(config.source.completedAt, tt)}" y1="${SOURCE_Y - 12}"
			x2="${x(config.source.completedAt, tt)}" y2="${SOURCE_Y + 12}"
			stroke="#475569" stroke-width="2.5"/>`
		: ''

	const spawnLines = config.source.emissions.map((em, ei) => {
		const idx = resolveSpawn(em, ei)
		if (idx === null) return ''
		return `<path d="${spawnPath(em, idx, config.inners, tt)}"
			stroke="${em.color}" stroke-width="1.5" stroke-dasharray="4,3" fill="none" opacity="0.6"/>`
	}).join('\n')

	const innerLanes = config.inners.map((inner, i) => {
		const iy = innerY(i)
		const endX = x(inner.cancelledAt ?? inner.completedAt ?? tt, tt)

		const cancelMark = inner.cancelledAt !== undefined ? `
			<line class="cancel-mark" x1="${x(inner.cancelledAt, tt) - 8}" y1="${iy - 8}"
				x2="${x(inner.cancelledAt, tt) + 8}" y2="${iy + 8}"
				stroke="${inner.color}" stroke-width="2.5"/>
			<line x1="${x(inner.cancelledAt, tt) + 8}" y1="${iy - 8}"
				x2="${x(inner.cancelledAt, tt) - 8}" y2="${iy + 8}"
				stroke="${inner.color}" stroke-width="2.5"/>
			<line x1="${x(inner.cancelledAt, tt)}" y1="${iy}"
				x2="${x(inner.cancelledAt, tt) + ghost}" y2="${iy}"
				stroke="${inner.color}" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.22"/>` : ''

		const completeMark = inner.completedAt !== undefined ? `
			<line x1="${x(inner.completedAt, tt)}" y1="${iy - 12}"
				x2="${x(inner.completedAt, tt)}" y2="${iy + 12}"
				stroke="${inner.color}" stroke-width="2.5"/>` : ''

		const values = inner.values.map(val => {
			const vx = x(val.time, tt)
			const vop = val.active ? 1 : 0.22
			const vsw = val.active ? 2.5 : 1.5
			const vfw = val.active ? 600 : 400
			const dropLine = val.active
				? `<line x1="${vx}" y1="${iy + CIRCLE_R}" x2="${vx}" y2="${resultY - CIRCLE_R}"
					stroke="${inner.color}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.45"/>`
				: ''
			return `<g>
				<circle cx="${vx}" cy="${iy}" r="${CIRCLE_R}"
					fill="#0f172a" stroke="${inner.color}" stroke-width="${vsw}" opacity="${vop}"/>
				<text x="${vx}" y="${iy + 4}" text-anchor="middle"
					fill="${inner.color}" font-size="11" font-weight="${vfw}" opacity="${vop}">${val.label}</text>
				${dropLine}
			</g>`
		}).join('\n')

		return `<g>
			<text x="${LABEL_X}" y="${iy}" text-anchor="end" dominant-baseline="middle"
				fill="${inner.color}" font-size="11">${innerLabel(i)}</text>
			<line x1="${x(inner.startTime, tt)}" y1="${iy}" x2="${endX}" y2="${iy}"
				stroke="${inner.color}" stroke-width="2"/>
			${cancelMark}${completeMark}${values}
		</g>`
	}).join('\n')

	const resultCircles = config.result.values.map(val => {
		const cx = x(val.time, tt)
		return `<g>
			<circle cx="${cx}" cy="${resultY}" r="${CIRCLE_R}"
				fill="#0f172a" stroke="${val.color}" stroke-width="2.5"/>
			<text x="${cx}" y="${resultY + 4}" text-anchor="middle"
				fill="${val.color}" font-size="11" font-weight="600">${val.label}</text>
		</g>`
	}).join('\n')

	const resultCompletion = config.result.completedAt
		? `<line x1="${x(config.result.completedAt, tt)}" y1="${resultY - 12}"
			x2="${x(config.result.completedAt, tt)}" y2="${resultY + 12}"
			stroke="#475569" stroke-width="2.5"/>`
		: ''

	const laneLabels = config.inners.map((_, i) => '').join('')
	const title = config.title ?? `${config.operatorName} — marble diagram`

	return `<svg width="${SVG_W}" height="${svgH}" viewBox="0 0 ${SVG_W} ${svgH}"
		xmlns="http://www.w3.org/2000/svg"
		font-family="ui-monospace,'Cascadia Code','JetBrains Mono',monospace"
		font-size="12" role="img" aria-label="${config.operatorName} marble diagram">
	<defs>
		<marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
			<polygon points="0 0,10 3.5,0 7" fill="#475569"/>
		</marker>
	</defs>
	<rect width="${SVG_W}" height="${svgH}" fill="#0f172a" rx="12"/>
	<text x="${SVG_W / 2}" y="30" text-anchor="middle" fill="#e2e8f0"
		font-size="14" font-weight="600" letter-spacing="0.5">${title}</text>
	<text x="${LABEL_X}" y="${SOURCE_Y}" text-anchor="end" dominant-baseline="middle"
		fill="#64748b" font-size="11">source</text>
	<text x="${LABEL_X}" y="${resultY}" text-anchor="end" dominant-baseline="middle"
		fill="#64748b" font-size="11">result</text>
	<line x1="${TL_START}" y1="${SOURCE_Y}" x2="${ARROW_END}" y2="${SOURCE_Y}"
		stroke="#475569" stroke-width="1.5" marker-end="url(#arr)"/>
	${sourceCircles}
	${sourceCompletion}
	${spawnLines}
	${innerLanes}
	<rect x="${SVG_W / 2 - 155}" y="${operatorBoxY}" width="310" height="28"
		rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
	<text x="${SVG_W / 2}" y="${operatorBoxY + 14}" text-anchor="middle" dominant-baseline="middle"
		fill="#94a3b8" font-size="12" letter-spacing="2" font-weight="500">${config.operatorName}</text>
	<line x1="${TL_START}" y1="${resultY}" x2="${ARROW_END}" y2="${resultY}"
		stroke="#475569" stroke-width="1.5" marker-end="url(#arr)"/>
	${resultCircles}
	${resultCompletion}
</svg>`
}
```

- [ ] **Run tests — all pass:**

```bash
npm test src/marble/render-higher-order.test.ts
```

- [ ] **Commit:**

```bash
git add src/marble/render-higher-order.ts src/marble/render-higher-order.test.ts
git commit -m "feat: higher-order SVG marble renderer"
```

---

## Task 6: Higher-order marble configs

**Files:**
- Create: `src/marble/configs/switchMap.ts`
- Create: `src/marble/configs/mergeMap.ts`
- Create: `src/marble/configs/concatMap.ts`
- Create: `src/marble/configs/exhaustMap.ts`

Port directly from `C:\Users\HP\Web\Frontend\rxjs\rxjs-operator-documentation\docs\components\configs\`. The types are identical — just change the import path.

- [ ] **Create `src/marble/configs/switchMap.ts`** — copy content from the source file, replace import:

```typescript
// src/marble/configs/switchMap.ts
import type { MarbleDiagramConfig } from '../marble.types'

export const switchMapConfig: MarbleDiagramConfig = {
	operatorName: 'switchMap',
	totalTime: 9,
	source: {
		emissions: [
			{ time: 1, label: 'A', color: '#a78bfa' },
			{ time: 3, label: 'B', color: '#fb923c' },
			{ time: 6, label: 'C', color: '#34d399' },
		],
		completedAt: 9,
	},
	inners: [
		{
			color: '#a78bfa', startTime: 1, cancelledAt: 3,
			values: [
				{ time: 2,   label: 'a1', active: true  },
				{ time: 3.5, label: 'a2', active: false },
			],
		},
		{
			color: '#fb923c', startTime: 3, cancelledAt: 6,
			values: [
				{ time: 4,   label: 'b1', active: true  },
				{ time: 5,   label: 'b2', active: true  },
				{ time: 6.5, label: 'b3', active: false },
			],
		},
		{
			color: '#34d399', startTime: 6, completedAt: 9,
			values: [
				{ time: 7, label: 'c1', active: true },
				{ time: 8, label: 'c2', active: true },
			],
		},
	],
	result: {
		values: [
			{ time: 2, label: 'a1', color: '#a78bfa' },
			{ time: 4, label: 'b1', color: '#fb923c' },
			{ time: 5, label: 'b2', color: '#fb923c' },
			{ time: 7, label: 'c1', color: '#34d399' },
			{ time: 8, label: 'c2', color: '#34d399' },
		],
		completedAt: 9,
	},
}
```

- [ ] **Create `src/marble/configs/mergeMap.ts`** — port from source file (same shape, change import):

```typescript
// src/marble/configs/mergeMap.ts
import type { MarbleDiagramConfig } from '../marble.types'

export const mergeMapConfig: MarbleDiagramConfig = {
	operatorName: 'mergeMap',
	totalTime: 9,
	source: {
		emissions: [
			{ time: 1, label: 'A', color: '#a78bfa' },
			{ time: 3, label: 'B', color: '#fb923c' },
			{ time: 6, label: 'C', color: '#34d399' },
		],
		completedAt: 9,
	},
	inners: [
		{
			color: '#a78bfa', startTime: 1, completedAt: 5,
			values: [
				{ time: 2, label: 'a1', active: true },
				{ time: 4, label: 'a2', active: true },
			],
		},
		{
			color: '#fb923c', startTime: 3, completedAt: 7,
			values: [
				{ time: 3.5, label: 'b1', active: true },
				{ time: 5,   label: 'b2', active: true },
				{ time: 6.5, label: 'b3', active: true },
			],
		},
		{
			color: '#34d399', startTime: 6, completedAt: 9,
			values: [
				{ time: 7, label: 'c1', active: true },
				{ time: 8, label: 'c2', active: true },
			],
		},
	],
	result: {
		values: [
			{ time: 2,   label: 'a1', color: '#a78bfa' },
			{ time: 3.5, label: 'b1', color: '#fb923c' },
			{ time: 4,   label: 'a2', color: '#a78bfa' },
			{ time: 5,   label: 'b2', color: '#fb923c' },
			{ time: 6.5, label: 'b3', color: '#fb923c' },
			{ time: 7,   label: 'c1', color: '#34d399' },
			{ time: 8,   label: 'c2', color: '#34d399' },
		],
		completedAt: 9,
	},
}
```

- [ ] **Read and port `concatMap.ts` and `exhaustMap.ts`** from `C:\Users\HP\Web\Frontend\rxjs\rxjs-operator-documentation\docs\components\configs\` — same procedure: copy content, change import to `'../marble.types'`.

- [ ] **Commit:**

```bash
git add src/marble/configs/
git commit -m "feat: port higher-order marble configs (switchMap, mergeMap, concatMap, exhaustMap)"
```

---

## Task 7: First-order marble configs — creation + simple operators

**Files:** `src/marble/configs/of.ts`, `from.ts`, `fromEvent.ts`, `interval.ts`, `timer.ts`, `EMPTY.ts`, `NEVER.ts`, `defer.ts`, `Observable.ts`

These are all pass-through or simple emission operators. Use colors from this palette (cycle as needed): `#a78bfa`, `#34d399`, `#fb923c`, `#38bdf8`, `#f87171`, `#fbbf24`.

- [ ] **Create `src/marble/configs/of.ts`:**

```typescript
import type { FirstOrderDiagramConfig } from '../marble.types'
export const ofConfig: FirstOrderDiagramConfig = {
	operatorName: 'of',
	totalTime: 5,
	source: {
		values: [
			{ time: 1, label: '1', color: '#a78bfa', active: true },
			{ time: 2, label: '2', color: '#34d399', active: true },
			{ time: 3, label: '3', color: '#fb923c', active: true },
		],
		completedAt: 3.5,
	},
	result: { completedAt: 3.5 },
}
```

- [ ] **Create the remaining configs** following the same pattern — key visual characteristics for each:

| Operator | File | Source values | Notes |
|---|---|---|---|
| `from` | `from.ts` | `[a,b,c]` all active, completedAt | Array items emitted sequentially |
| `fromEvent` | `fromEvent.ts` | `[click,click,click]` active, no completion | DOM events — never completes |
| `interval` | `interval.ts` | `[0,1,2,3]` active at t=2,4,6,8 | Periodic, no completion |
| `timer` | `timer.ts` | `[0]` active at t=3, completedAt=3.5 | Delay then emit once |
| `EMPTY` | `EMPTY.ts` | `[]` no values, completedAt=1 | Immediately completes |
| `NEVER` | `NEVER.ts` | `[]` no values, no completion | Never emits |
| `defer` | `defer.ts` | `[a,b,c]` active, completedAt | Same as `of` visually |
| `Observable` | `Observable.ts` | `[a,b]` active | Custom subscribe logic |

For `EMPTY` — `source.values: []`, `source.completedAt: 1`, `result.completedAt: 1`. For `NEVER` — `source.values: []`, no `completedAt`.

- [ ] **Commit:**

```bash
git add src/marble/configs/
git commit -m "feat: first-order marble configs — creation operators"
```

---

## Task 8: First-order marble configs — transformation + filter operators

**Files:** `map.ts`, `scan.ts`, `reduce.ts`, `toArray.ts`, `count.ts`, `filter.ts`, `distinctUntilChanged.ts`, `distinct.ts`, `iif.ts`

- [ ] **Create `src/marble/configs/filter.ts`:**

```typescript
import type { FirstOrderDiagramConfig } from '../marble.types'
export const filterConfig: FirstOrderDiagramConfig = {
	operatorName: 'filter',
	totalTime: 10,
	source: {
		values: [
			{ time: 1, label: '1', color: '#a78bfa', active: false },
			{ time: 3, label: '2', color: '#34d399', active: true  },
			{ time: 5, label: '3', color: '#fb923c', active: false },
			{ time: 7, label: '4', color: '#38bdf8', active: true  },
			{ time: 9, label: '5', color: '#f87171', active: false },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
```

- [ ] **Create `src/marble/configs/map.ts`:**

```typescript
import type { FirstOrderDiagramConfig } from '../marble.types'
export const mapConfig: FirstOrderDiagramConfig = {
	operatorName: 'map',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true, resultLabel: 'A' },
			{ time: 5, label: 'b', color: '#34d399', active: true, resultLabel: 'B' },
			{ time: 8, label: 'c', color: '#fb923c', active: true, resultLabel: 'C' },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
```

- [ ] **Create `src/marble/configs/scan.ts`:**

```typescript
import type { FirstOrderDiagramConfig } from '../marble.types'
export const scanConfig: FirstOrderDiagramConfig = {
	operatorName: 'scan',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: '1', color: '#a78bfa', active: true, resultLabel: '1' },
			{ time: 5, label: '2', color: '#34d399', active: true, resultLabel: '3' },
			{ time: 8, label: '3', color: '#fb923c', active: true, resultLabel: '6' },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}
```

- [ ] **Create remaining configs** following the same pattern:

| Operator | File | Source values (label/color/active) | Notes |
|---|---|---|---|
| `reduce` | `reduce.ts` | `[1,2,3]` all active, resultLabel only on last | Last value `resultLabel: '6'`; result.completedAt same as source |
| `toArray` | `toArray.ts` | `[a,b,c]` all active, resultLabel `'[a,b,c]'` on last | Only last value active in result (show as `resultTime` = completedAt) |
| `count` | `count.ts` | `[a,b,c]` all active, resultLabel `'3'` on last | Single result circle at completion |
| `distinctUntilChanged` | `distinctUntilChanged.ts` | `[1,1,2,2,3]` — 2nd `1` and 2nd `2` inactive | Consecutive duplicates dimmed |
| `distinct` | `distinct.ts` | `[a,b,a,c,b]` — 3rd and 5th inactive | All-time duplicates dimmed |
| `iif` | `iif.ts` | `[a]` active | Shows single subscriber gets one or other Observable |

For `reduce`: only emit one result value at `completedAt` time, so `resultTime: completedAt`, and only the last source value has `active: true` — no, actually all source values are consumed by reduce but only one result emits. Model it as: all source values `active: true` (they all pass through the accumulator), `resultTime: 10` on the last one only, all others have `resultLabel` omitted and `resultTime: undefined` but `active: true`. Wait, this doesn't map well to `FirstOrderDiagramConfig` since active values always produce result circles.

Better approach for `reduce`: mark all source values `active: false` except the last one, which has `active: true` and `resultTime = completedAt`. Add a comment in the config explaining this is a simplification.

- [ ] **Commit:**

```bash
git add src/marble/configs/
git commit -m "feat: first-order marble configs — transformation and filter operators"
```

---

## Task 9: First-order marble configs — timing operators

**Files:** `debounceTime.ts`, `debounce.ts`, `throttleTime.ts`, `throttle.ts`, `auditTime.ts`, `sampleTime.ts`, `sample.ts`, `delay.ts`, `delayWhen.ts`, `bufferTime.ts`, `bufferCount.ts`, `buffer.ts`, `windowTime.ts`, `windowCount.ts`

Key visual pattern for time-shifting: source values have `active: false` (dropped by the operator) except the ones that survive, which have `resultTime` set to a later time showing the delay.

- [ ] **Create `src/marble/configs/debounceTime.ts`:**

```typescript
import type { FirstOrderDiagramConfig } from '../marble.types'
export const debounceTimeConfig: FirstOrderDiagramConfig = {
	operatorName: 'debounceTime(300)',
	totalTime: 14,
	source: {
		values: [
			{ time: 1, label: 'a', color: '#a78bfa', active: false },
			{ time: 2, label: 'b', color: '#34d399', active: false },
			{ time: 3, label: 'c', color: '#fb923c', active: true, resultTime: 6  },
			{ time: 9, label: 'd', color: '#38bdf8', active: false },
			{ time: 10, label: 'e', color: '#f87171', active: true, resultTime: 13 },
		],
	},
	result: {},
}
```

- [ ] **Create `src/marble/configs/delay.ts`:**

```typescript
import type { FirstOrderDiagramConfig } from '../marble.types'
export const delayConfig: FirstOrderDiagramConfig = {
	operatorName: 'delay(200)',
	totalTime: 12,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true, resultTime: 4 },
			{ time: 5, label: 'b', color: '#34d399', active: true, resultTime: 7 },
			{ time: 8, label: 'c', color: '#fb923c', active: true, resultTime: 10 },
		],
		completedAt: 9,
	},
	result: { completedAt: 11 },
}
```

- [ ] **Create remaining timing configs** with these visual patterns:

| Operator | File | Pattern |
|---|---|---|
| `debounce` | `debounce.ts` | Same as debounceTime — a,b dimmed; c emits at resultTime |
| `throttleTime` | `throttleTime.ts` | First value active, next 2 dimmed (in window), then next active |
| `throttle` | `throttle.ts` | Same shape as throttleTime |
| `auditTime` | `auditTime.ts` | All values dimmed except last-in-window which emits at window end |
| `sampleTime` | `sampleTime.ts` | Values dimmed; periodically emit latest with resultTime at sample moment |
| `sample` | `sample.ts` | Same as sampleTime |
| `delayWhen` | `delayWhen.ts` | Same shape as delay but varying delay amounts per value |
| `bufferTime` | `bufferTime.ts` | 3 values active, resultLabel `'[a,b]'` on 2nd, `'[c]'` on 3rd — simplified |
| `bufferCount` | `bufferCount.ts` | Same pattern |
| `buffer` | `buffer.ts` | Same pattern |
| `windowTime` | `windowTime.ts` | Similar to bufferTime — resultLabel shows window notation |
| `windowCount` | `windowCount.ts` | Same shape as windowTime |

For buffer/window operators where `FirstOrderDiagramConfig` doesn't perfectly model the behavior (result is an array/Observable, not a scalar), use `resultLabel` to show the grouped value and add a `title` field explaining the simplification: `title: 'bufferTime — simplified (result is an array Observable)'`.

- [ ] **Commit:**

```bash
git add src/marble/configs/
git commit -m "feat: first-order marble configs — timing operators"
```

---

## Task 10: First-order marble configs — lifecycle, combination, error, utility

**Files:** `take.ts`, `takeWhile.ts`, `takeUntil.ts`, `skip.ts`, `skipWhile.ts`, `skipUntil.ts`, `first.ts`, `last.ts`, `forkJoin.ts`, `combineLatest.ts`, `withLatestFrom.ts`, `zip.ts`, `merge.ts`, `concat.ts`, `race.ts`, `catchError.ts`, `retry.ts`, `retryWhen.ts`, `onErrorResumeNextWith.ts`, `timeout.ts`, `shareReplay.ts`, `share.ts`, `tap.ts`, `finalize.ts`, `every.ts`, `find.ts`, `findIndex.ts`, `isEmpty.ts`, `defaultIfEmpty.ts`, `materialize.ts`, `dematerialize.ts`, `Subject.ts`, `BehaviorSubject.ts`, `ReplaySubject.ts`, `publish.ts`

- [ ] **Create `src/marble/configs/take.ts`:**

```typescript
import type { FirstOrderDiagramConfig } from '../marble.types'
export const takeConfig: FirstOrderDiagramConfig = {
	operatorName: 'take(2)',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true  },
			{ time: 5, label: 'b', color: '#34d399', active: true  },
			{ time: 7, label: 'c', color: '#fb923c', active: false },
			{ time: 9, label: 'd', color: '#38bdf8', active: false },
		],
	},
	result: { completedAt: 5.5 },
}
```

- [ ] **Create `src/marble/configs/catchError.ts`:**

```typescript
import type { FirstOrderDiagramConfig } from '../marble.types'
export const catchErrorConfig: FirstOrderDiagramConfig = {
	operatorName: 'catchError',
	title: 'catchError — switches to fallback on error',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true  },
			{ time: 4, label: 'b', color: '#34d399', active: true  },
			{ time: 6, label: '✗', color: '#f87171', active: false },
		],
	},
	result: {
		completedAt: 9,
	},
}
```

> For `catchError` the error itself is dimmed on the source (active: false) and the fallback value `'f'` appears in result at `resultTime: 7`. Since the dimmed source value can't produce a result circle in `FirstOrderDiagramConfig`, add a note that this is a visual approximation. Alternatively, show error as an active source value with `resultLabel: 'fallback'` and distinct color `#f87171` (red).

- [ ] **Create remaining configs** following established patterns:

| Operator | File | Key pattern |
|---|---|---|
| `takeWhile` | `takeWhile.ts` | First 3 active (pass predicate), last 2 dimmed; completedAt after 3rd |
| `takeUntil` | `takeUntil.ts` | First 3 active, rest dimmed; completedAt when notifier fires |
| `skip` | `skip.ts` | First 2 dimmed (skipped), rest active |
| `skipWhile` | `skipWhile.ts` | First 2 dimmed (condition holds), rest active |
| `skipUntil` | `skipUntil.ts` | First 2 dimmed, rest active after notifier |
| `first` | `first.ts` | Only first active, rest dimmed; completedAt immediately after first |
| `last` | `last.ts` | All active but only last has resultTime=completedAt; rest have active: true but no individual result shown — simplify: all dimmed except last |
| `forkJoin` | `forkJoin.ts` | 3 active values at same resultTime=9 (combined last values at completion), title: 'forkJoin — waits for all to complete' |
| `combineLatest` | `combineLatest.ts` | Values active, title: 'combineLatest — simplified (2 sources)' |
| `withLatestFrom` | `withLatestFrom.ts` | Primary values active; resultLabel shows combined pair |
| `zip` | `zip.ts` | Values paired by index; resultLabel shows pair |
| `merge` | `merge.ts` | All values from both sources interleaved, all active |
| `concat` | `concat.ts` | First source completes, then second source values |
| `race` | `race.ts` | Winner source values active, others dimmed |
| `retry` | `retry.ts` | Error → retry → success pattern |
| `retryWhen` | `retryWhen.ts` | Same shape as retry |
| `onErrorResumeNextWith` | `onErrorResumeNextWith.ts` | Error then seamless continuation |
| `timeout` | `timeout.ts` | No emission within window → error emitted |
| `shareReplay` | `shareReplay.ts` | Two subscribers shown via title annotation |
| `share` | `share.ts` | Same as shareReplay simplified |
| `tap` | `tap.ts` | All values pass through unchanged, same labels |
| `finalize` | `finalize.ts` | Values pass through; completedAt triggers cleanup |
| `every` | `every.ts` | Values active; resultLabel `'true'` or `'false'` at completion |
| `find` | `find.ts` | First matching value active, completedAt immediately; rest dimmed |
| `findIndex` | `findIndex.ts` | Same as find but resultLabel is index number |
| `isEmpty` | `isEmpty.ts` | Source completes with no values; result emits `'true'` at completedAt |
| `defaultIfEmpty` | `defaultIfEmpty.ts` | Source completes empty; result emits default value |
| `materialize` | `materialize.ts` | Values wrapped in Notification, resultLabel `'N(a)'` |
| `dematerialize` | `dematerialize.ts` | Inverse of materialize |
| `Subject` | `Subject.ts` | Values emitted imperatively; simple pass-through |
| `BehaviorSubject` | `BehaviorSubject.ts` | Initial value + subsequent; title: 'BehaviorSubject — replays current value' |
| `ReplaySubject` | `ReplaySubject.ts` | Replays last N values to late subscriber |
| `publish` | `publish.ts` | Multicast; title: 'publish — use with connect()' |

- [ ] **Commit:**

```bash
git add src/marble/configs/
git commit -m "feat: first-order marble configs — lifecycle, combination, error, utility"
```

---

## Task 11: Marble registry

**Files:**
- Create: `src/marble/configs/index.ts`

- [ ] **Create `src/marble/configs/index.ts`:**

```typescript
// src/marble/configs/index.ts
import type { FirstOrderDiagramConfig, MarbleDiagramConfig } from '../marble.types'
import { renderFirstOrderSVG } from '../render-first-order'
import { renderHigherOrderSVG } from '../render-higher-order'

import { switchMapConfig }   from './switchMap'
import { mergeMapConfig }    from './mergeMap'
import { concatMapConfig }   from './concatMap'
import { exhaustMapConfig }  from './exhaustMap'
import { ofConfig }          from './of'
import { fromConfig }        from './from'
import { fromEventConfig }   from './fromEvent'
import { intervalConfig }    from './interval'
import { timerConfig }       from './timer'
import { observableConfig }  from './Observable'
import { deferConfig }       from './defer'
import { iifConfig }         from './iif'
import { emptyConfig }       from './EMPTY'
import { neverConfig }       from './NEVER'
import { mapConfig }         from './map'
import { scanConfig }        from './scan'
import { reduceConfig }      from './reduce'
import { toArrayConfig }     from './toArray'
import { countConfig }       from './count'
import { filterConfig }      from './filter'
import { distinctUntilChangedConfig } from './distinctUntilChanged'
import { distinctConfig }    from './distinct'
import { debounceTimeConfig } from './debounceTime'
import { debounceConfig }    from './debounce'
import { throttleTimeConfig } from './throttleTime'
import { throttleConfig }    from './throttle'
import { auditTimeConfig }   from './auditTime'
import { sampleTimeConfig }  from './sampleTime'
import { sampleConfig }      from './sample'
import { bufferTimeConfig }  from './bufferTime'
import { bufferCountConfig } from './bufferCount'
import { bufferConfig }      from './buffer'
import { windowTimeConfig }  from './windowTime'
import { windowCountConfig } from './windowCount'
import { delayConfig }       from './delay'
import { delayWhenConfig }   from './delayWhen'
import { takeConfig }        from './take'
import { takeWhileConfig }   from './takeWhile'
import { takeUntilConfig }   from './takeUntil'
import { skipConfig }        from './skip'
import { skipWhileConfig }   from './skipWhile'
import { skipUntilConfig }   from './skipUntil'
import { firstConfig }       from './first'
import { lastConfig }        from './last'
import { forkJoinConfig }    from './forkJoin'
import { combineLatestConfig } from './combineLatest'
import { withLatestFromConfig } from './withLatestFrom'
import { zipConfig }         from './zip'
import { mergeConfig }       from './merge'
import { concatConfig }      from './concat'
import { raceConfig }        from './race'
import { catchErrorConfig }  from './catchError'
import { retryConfig }       from './retry'
import { retryWhenConfig }   from './retryWhen'
import { onErrorResumeNextWithConfig } from './onErrorResumeNextWith'
import { timeoutConfig }     from './timeout'
import { shareReplayConfig } from './shareReplay'
import { shareConfig }       from './share'
import { everyConfig }       from './every'
import { findConfig }        from './find'
import { findIndexConfig }   from './findIndex'
import { isEmptyConfig }     from './isEmpty'
import { defaultIfEmptyConfig } from './defaultIfEmpty'
import { materializeConfig } from './materialize'
import { dematerializeConfig } from './dematerialize'
import { subjectConfig }     from './Subject'
import { behaviorSubjectConfig } from './BehaviorSubject'
import { replaySubjectConfig }   from './ReplaySubject'
import { publishConfig }     from './publish'
import { tapConfig }         from './tap'
import { finalizeConfig }    from './finalize'

type MarbleEntry =
	| { kind: 'first-order';  config: FirstOrderDiagramConfig }
	| { kind: 'higher-order'; config: MarbleDiagramConfig }

const registry: Record<string, MarbleEntry> = {
	switchMap:             { kind: 'higher-order', config: switchMapConfig },
	mergeMap:              { kind: 'higher-order', config: mergeMapConfig },
	concatMap:             { kind: 'higher-order', config: concatMapConfig },
	exhaustMap:            { kind: 'higher-order', config: exhaustMapConfig },
	of:                    { kind: 'first-order',  config: ofConfig },
	from:                  { kind: 'first-order',  config: fromConfig },
	fromEvent:             { kind: 'first-order',  config: fromEventConfig },
	interval:              { kind: 'first-order',  config: intervalConfig },
	timer:                 { kind: 'first-order',  config: timerConfig },
	Observable:            { kind: 'first-order',  config: observableConfig },
	defer:                 { kind: 'first-order',  config: deferConfig },
	iif:                   { kind: 'first-order',  config: iifConfig },
	EMPTY:                 { kind: 'first-order',  config: emptyConfig },
	NEVER:                 { kind: 'first-order',  config: neverConfig },
	map:                   { kind: 'first-order',  config: mapConfig },
	scan:                  { kind: 'first-order',  config: scanConfig },
	reduce:                { kind: 'first-order',  config: reduceConfig },
	toArray:               { kind: 'first-order',  config: toArrayConfig },
	count:                 { kind: 'first-order',  config: countConfig },
	filter:                { kind: 'first-order',  config: filterConfig },
	distinctUntilChanged:  { kind: 'first-order',  config: distinctUntilChangedConfig },
	distinct:              { kind: 'first-order',  config: distinctConfig },
	debounceTime:          { kind: 'first-order',  config: debounceTimeConfig },
	debounce:              { kind: 'first-order',  config: debounceConfig },
	throttleTime:          { kind: 'first-order',  config: throttleTimeConfig },
	throttle:              { kind: 'first-order',  config: throttleConfig },
	auditTime:             { kind: 'first-order',  config: auditTimeConfig },
	sampleTime:            { kind: 'first-order',  config: sampleTimeConfig },
	sample:                { kind: 'first-order',  config: sampleConfig },
	bufferTime:            { kind: 'first-order',  config: bufferTimeConfig },
	bufferCount:           { kind: 'first-order',  config: bufferCountConfig },
	buffer:                { kind: 'first-order',  config: bufferConfig },
	windowTime:            { kind: 'first-order',  config: windowTimeConfig },
	windowCount:           { kind: 'first-order',  config: windowCountConfig },
	delay:                 { kind: 'first-order',  config: delayConfig },
	delayWhen:             { kind: 'first-order',  config: delayWhenConfig },
	take:                  { kind: 'first-order',  config: takeConfig },
	takeWhile:             { kind: 'first-order',  config: takeWhileConfig },
	takeUntil:             { kind: 'first-order',  config: takeUntilConfig },
	skip:                  { kind: 'first-order',  config: skipConfig },
	skipWhile:             { kind: 'first-order',  config: skipWhileConfig },
	skipUntil:             { kind: 'first-order',  config: skipUntilConfig },
	first:                 { kind: 'first-order',  config: firstConfig },
	last:                  { kind: 'first-order',  config: lastConfig },
	forkJoin:              { kind: 'first-order',  config: forkJoinConfig },
	combineLatest:         { kind: 'first-order',  config: combineLatestConfig },
	withLatestFrom:        { kind: 'first-order',  config: withLatestFromConfig },
	zip:                   { kind: 'first-order',  config: zipConfig },
	merge:                 { kind: 'first-order',  config: mergeConfig },
	concat:                { kind: 'first-order',  config: concatConfig },
	race:                  { kind: 'first-order',  config: raceConfig },
	catchError:            { kind: 'first-order',  config: catchErrorConfig },
	retry:                 { kind: 'first-order',  config: retryConfig },
	retryWhen:             { kind: 'first-order',  config: retryWhenConfig },
	onErrorResumeNextWith: { kind: 'first-order',  config: onErrorResumeNextWithConfig },
	timeout:               { kind: 'first-order',  config: timeoutConfig },
	shareReplay:           { kind: 'first-order',  config: shareReplayConfig },
	share:                 { kind: 'first-order',  config: shareConfig },
	every:                 { kind: 'first-order',  config: everyConfig },
	find:                  { kind: 'first-order',  config: findConfig },
	findIndex:             { kind: 'first-order',  config: findIndexConfig },
	isEmpty:               { kind: 'first-order',  config: isEmptyConfig },
	defaultIfEmpty:        { kind: 'first-order',  config: defaultIfEmptyConfig },
	materialize:           { kind: 'first-order',  config: materializeConfig },
	dematerialize:         { kind: 'first-order',  config: dematerializeConfig },
	Subject:               { kind: 'first-order',  config: subjectConfig },
	BehaviorSubject:       { kind: 'first-order',  config: behaviorSubjectConfig },
	ReplaySubject:         { kind: 'first-order',  config: replaySubjectConfig },
	publish:               { kind: 'first-order',  config: publishConfig },
	tap:                   { kind: 'first-order',  config: tapConfig },
	finalize:              { kind: 'first-order',  config: finalizeConfig },
}

/**
 * Returns SVG string for the operator identified by its wikiPath.
 * Uses the path's last segment as registry key (e.g. '/operators/switchMap' → 'switchMap').
 * Returns null if no config is registered for that operator.
 */
export function getMarbleSVG(wikiPath: string): string | null {
	const key = wikiPath.split('/').pop() ?? ''
	const entry = registry[key]
	if (!entry) return null
	if (entry.kind === 'higher-order') return renderHigherOrderSVG(entry.config)
	return renderFirstOrderSVG(entry.config)
}
```

- [ ] **Run full test suite to confirm no regressions:**

```bash
npm test
```

- [ ] **Commit:**

```bash
git add src/marble/configs/index.ts
git commit -m "feat: marble registry with getMarbleSVG(wikiPath)"
```

---

## Task 12: Extraction script + generate explanations.ts

**Files:**
- Create: `scripts/extract-explanations.ts`
- Create: `src/data/explanations.ts` (generated by running the script)

- [ ] **Create `scripts/extract-explanations.ts`:**

```typescript
// scripts/extract-explanations.ts
// Run with: npx tsx scripts/extract-explanations.ts
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const CACHE_DIR = 'C:/Users/HP/Web/Frontend/rxjs/rxjs-operator-explain-claude'
const OUT_FILE  = 'src/data/explanations.ts'

interface OperatorExplanation {
	code:    string
	gotchas: string[]
	related: string
	rule:    string
}

function extractSection(content: string, heading: string): string {
	const headingPattern = new RegExp(`####\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n####|\\n###|$)`)
	return (content.match(headingPattern)?.[1] ?? '').trim()
}

function extractCode(content: string): string {
	const section = extractSection(content, 'Primary Code Sample')
	const match = section.match(/```typescript\n([\s\S]*?)```/)
	return (match?.[1] ?? '').trim()
}

function extractGotchas(content: string): string[] {
	const section = extractSection(content, 'Gotchas')
	return section
		.split('\n')
		.filter(line => /^\d+\./.test(line.trim()))
		.map(line => line.replace(/^\d+\.\s*/, '').trim())
}

function extractRelated(content: string): string {
	return extractSection(content, 'Related Operators').trim()
}

function extractRule(content: string): string {
	const section = extractSection(content, 'Decision Rule')
	return section.replace(/^>\s*/gm, '').trim()
}

function stripFrontmatter(content: string): string {
	return content.replace(/^---[\s\S]*?---\n/, '')
}

const files = readdirSync(CACHE_DIR).filter(f => f.endsWith('.md') && f !== 'index.md')

const entries: Record<string, OperatorExplanation> = {}

for (const file of files) {
	const operatorName = basename(file, '.md')
	const raw = readFileSync(join(CACHE_DIR, file), 'utf-8')
	const content = stripFrontmatter(raw)

	entries[operatorName] = {
		code:    extractCode(content),
		gotchas: extractGotchas(content),
		related: extractRelated(content),
		rule:    extractRule(content),
	}
}

const output = `// src/data/explanations.ts
// Generated by scripts/extract-explanations.ts — do not edit manually.
// Re-generate with: npx tsx scripts/extract-explanations.ts

export interface OperatorExplanation {
\tcode:    string
\tgotchas: string[]
\trelated: string
\trule:    string
}

export const explanations: Record<string, OperatorExplanation> = ${JSON.stringify(entries, null, '\t')}
`

writeFileSync(OUT_FILE, output, 'utf-8')
console.log(`✓ Wrote ${Object.keys(entries).length} operators to ${OUT_FILE}`)
```

- [ ] **Add npm script to `package.json`:**

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "extract-explanations": "npx tsx scripts/extract-explanations.ts"
}
```

- [ ] **Run the script:**

```bash
npm run extract-explanations
```

Expected output: `✓ Wrote 134 operators to src/data/explanations.ts`

- [ ] **Verify the output file looks correct** — open `src/data/explanations.ts` and check a known operator like `switchMap` has `code`, `gotchas`, `related`, and `rule` fields populated.

- [ ] **Run build to confirm TypeScript is happy:**

```bash
npm run build
```

- [ ] **Commit:**

```bash
git add scripts/extract-explanations.ts src/data/explanations.ts package.json
git commit -m "feat: extraction script and generated operator explanations data"
```

---

## Task 13: Detail view renderer

**Files:**
- Create: `src/ui/detail.ts`

- [ ] **Create `src/ui/detail.ts`:**

```typescript
// src/ui/detail.ts
import { action$ } from '../state/tree.state'
import { getMarbleSVG } from '../marble/configs/index'
import { explanations } from '../data/explanations'
import { WIKI_BASE } from '../tree/tree.config'
import type { DetailView } from '../tree/tree.types'

export function renderDetail(container: HTMLElement, detail: DetailView): void {
	const { operatorName, oneliner, wikiPath } = detail

	// Registry key is wikiPath's last segment — matches operatorName in explanations
	const cacheKey = wikiPath.split('/').pop() ?? operatorName
	const explanation = explanations[cacheKey]
	const marbleSVG  = getMarbleSVG(wikiPath)

	const marbleSection = marbleSVG
		? `<div class="detail-marble">${marbleSVG}</div>`
		: ''

	const codeSection = explanation?.code
		? `<pre class="detail-code"><code>${escHtml(explanation.code)}</code></pre>`
		: ''

	const gotchasSection = explanation?.gotchas?.length
		? `<details class="detail-section">
			<summary class="detail-summary">Gotchas (${explanation.gotchas.length})</summary>
			<ol class="detail-gotchas">
				${explanation.gotchas.map(g => `<li>${escHtml(g)}</li>`).join('\n')}
			</ol>
		</details>`
		: ''

	const relatedSection = explanation?.related
		? `<details class="detail-section">
			<summary class="detail-summary">Related operators</summary>
			<div class="detail-related">${markdownTable(explanation.related)}</div>
		</details>`
		: ''

	const ruleSection = explanation?.rule
		? `<p class="detail-rule">${escHtml(explanation.rule)}</p>`
		: ''

	const wikiLink = `<a class="detail-wiki-link" href="${WIKI_BASE}${wikiPath}" target="_blank" rel="noopener">
		Full documentation →
	</a>`

	container.innerHTML = `
		<div class="detail-header">
			<button class="nav-btn" id="detail-back-btn">← Back to results</button>
			<span class="detail-op-name">${escHtml(operatorName)}</span>
		</div>
		<p class="detail-oneliner">${escHtml(oneliner)}</p>
		${marbleSection}
		${codeSection}
		${gotchasSection}
		${relatedSection}
		${ruleSection}
		${wikiLink}
	`

	container.querySelector('#detail-back-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'close-detail' })
	})
}

function escHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function markdownTable(md: string): string {
	const lines = md.trim().split('\n').filter(l => !l.match(/^\|[-| ]+\|$/))
	if (lines.length < 2) return `<pre>${escHtml(md)}</pre>`
	const [header, ...rows] = lines
	const th = header.split('|').filter(Boolean).map(c => `<th>${escHtml(c.trim())}</th>`).join('')
	const trs = rows.map(r =>
		`<tr>${r.split('|').filter(Boolean).map(c => `<td>${escHtml(c.trim())}</td>`).join('')}</tr>`
	).join('\n')
	return `<table class="detail-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`
}
```

- [ ] **Run build to confirm no TS errors:**

```bash
npm run build
```

- [ ] **Commit:**

```bash
git add src/ui/detail.ts
git commit -m "feat: detail view renderer with marble, code, gotchas, related sections"
```

---

## Task 14: Wire detail into panel.ts

**Files:**
- Modify: `src/ui/panel.ts`

- [ ] **Replace `src/ui/panel.ts`:**

```typescript
// src/ui/panel.ts
import { action$ } from '../state/tree.state'
import { renderDetail } from './detail'
import type { TreeState, LeafNode, QuestionNode, OperatorResult } from '../tree/tree.types'

export function renderPanel(container: HTMLElement, state: TreeState): void {
	if (state.detailView) {
		renderDetail(container, state.detailView)
		return
	}

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

function renderOperator(op: OperatorResult): string {
	const detailBtn = `<button class="op-detail-btn"
		data-name="${op.name}"
		data-oneliner="${op.oneliner.replace(/"/g, '&quot;')}"
		data-wiki="${op.wikiPath}">
		${op.primary ? '★ ' : ''}${op.name}
	</button>`

	if (op.primary) {
		return `
			<div class="result-primary">
				${detailBtn}
				<div class="op-oneliner">${op.oneliner}</div>
			</div>`
	}
	return `
		<div class="result-alt">
			${detailBtn}
			<span class="alt-desc">— ${op.oneliner}</span>
		</div>`
}

function renderLeaf(
	container: HTMLElement,
	node: LeafNode,
	breadcrumb: TreeState['breadcrumb'],
	historyLen: number,
): void {
	const bc = renderBreadcrumb(breadcrumb, '✓ Result', 'result')
	const ops = node.operators.map(op => renderOperator(op)).join('')

	container.innerHTML = `
		${bc}
		${ops}
		<div class="nav-actions">
			<button class="nav-btn" id="back-btn" ${historyLen === 0 ? 'disabled' : ''}>← Back</button>
			<button class="nav-btn" id="reset-btn">↺ Start over</button>
		</div>
	`

	container.querySelectorAll('.op-detail-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const el = btn as HTMLButtonElement
			action$.next({
				kind:         'open-detail',
				operatorName: el.dataset['name']!,
				oneliner:     el.dataset['oneliner']!,
				wikiPath:     el.dataset['wiki']!,
			})
		})
	})

	container.querySelector('#back-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'back' })
	})

	container.querySelector('#reset-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'reset' })
	})
}
```

- [ ] **Run build:**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Commit:**

```bash
git add src/ui/panel.ts
git commit -m "feat: wire detail view into panel — operator names are now clickable"
```

---

## Task 15: CSS for detail panel

**Files:**
- Modify: `src/style.css`

- [ ] **Append to `src/style.css`:**

```css
/* ── Detail view ──────────────────────────────────────────────────────────── */

.detail-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1rem;
	padding-bottom: 0.75rem;
	border-bottom: 1px solid #1e293b;
}

.detail-op-name {
	font-family: ui-monospace, 'Cascadia Code', 'JetBrains Mono', monospace;
	font-size: 1.1rem;
	font-weight: 700;
	color: #a78bfa;
}

.detail-oneliner {
	color: #94a3b8;
	margin-bottom: 1.25rem;
	font-size: 0.95rem;
}

.detail-marble {
	margin-bottom: 1.5rem;
	overflow-x: auto;
}

.detail-marble svg {
	max-width: 100%;
	height: auto;
	border-radius: 8px;
}

.detail-code {
	background: #0f172a;
	border: 1px solid #1e293b;
	border-radius: 6px;
	padding: 1rem;
	overflow-x: auto;
	margin-bottom: 1.25rem;
	font-size: 0.82rem;
	line-height: 1.6;
	color: #e2e8f0;
}

.detail-section {
	border: 1px solid #1e293b;
	border-radius: 6px;
	margin-bottom: 0.75rem;
	overflow: hidden;
}

.detail-summary {
	padding: 0.6rem 1rem;
	cursor: pointer;
	color: #818cf8;
	font-size: 0.9rem;
	list-style: none;
	user-select: none;
}

.detail-summary:hover {
	background: #1e293b;
}

.detail-section[open] .detail-summary {
	border-bottom: 1px solid #1e293b;
}

.detail-gotchas {
	padding: 0.75rem 1rem 0.75rem 2rem;
	color: #94a3b8;
	font-size: 0.88rem;
	line-height: 1.7;
}

.detail-gotchas li {
	margin-bottom: 0.4rem;
}

.detail-related {
	padding: 0.75rem 1rem;
}

.detail-table {
	border-collapse: collapse;
	font-size: 0.83rem;
	width: 100%;
}

.detail-table th {
	color: #64748b;
	text-align: left;
	padding: 0.3rem 0.75rem;
	border-bottom: 1px solid #1e293b;
}

.detail-table td {
	color: #94a3b8;
	padding: 0.3rem 0.75rem;
	border-bottom: 1px solid #0f172a;
}

.detail-rule {
	font-style: italic;
	color: #64748b;
	font-size: 0.88rem;
	margin: 0.75rem 0;
	padding-left: 0.75rem;
	border-left: 2px solid #334155;
}

.detail-wiki-link {
	display: inline-block;
	margin-top: 0.75rem;
	color: #6ee7b7;
	font-size: 0.85rem;
	text-decoration: none;
}

.detail-wiki-link:hover {
	text-decoration: underline;
}

/* Operator name as button on leaf cards */

.op-detail-btn {
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
	font-family: ui-monospace, 'Cascadia Code', 'JetBrains Mono', monospace;
	font-size: 1rem;
	font-weight: 700;
	color: #6ee7b7;
	text-align: left;
}

.op-detail-btn:hover {
	color: #a7f3d0;
	text-decoration: underline;
}

.result-alt .op-detail-btn {
	font-size: 0.9rem;
	font-weight: 500;
	color: #94a3b8;
}

.result-alt .op-detail-btn:hover {
	color: #cbd5e1;
}
```

- [ ] **Commit:**

```bash
git add src/style.css
git commit -m "feat: detail panel CSS styles"
```

---

## Task 16: Verify end-to-end

- [ ] **Run full test suite:**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Start dev server:**

```bash
npm run dev
```

- [ ] **Manual smoke test in the browser (`http://localhost:5173`):**
  1. Navigate to a leaf node (e.g., root → "One Observable" → "Query or transform" → "Lossy" → should show `filter`)
  2. Click `filter` — detail panel replaces the leaf view
  3. Verify: header shows "← Back to results" + "filter", marble SVG renders, code sample visible
  4. Open "Gotchas" accordion — verify list items appear
  5. Open "Related operators" — verify table renders
  6. Click "← Back to results" — leaf node returns
  7. Navigate to a higher-order operator (root → "One that emits Observables" → "Lossy — cancel current") — click `switchMap`
  8. Verify: three-inner higher-order marble renders with colour-coded lanes, cancellation marks visible
  9. Click "↺ Start over" from any state — confirm app resets to root question

- [ ] **Run production build:**

```bash
npm run build
```

Expected: `tsc` passes, Vite bundles without errors.

- [ ] **Final commit:**

```bash
git add -A
git commit -m "feat: inline operator detail panel — marble SVG, code sample, expandable gotchas"
```
