# `DebounceTimePlayground` — Design Spec

**Date:** 2026-04-17
**Target project:** `rxjs-technical-documentation-claude` (VitePress docs site)
**Status:** Approved, pending implementation plan

---

## 1. Goal

Build an interactive, animated playground component for the `debounceTime` RxJS operator, embeddable in any VitePress markdown page. Its pedagogical purpose is to make the **timer-reset behaviour** of `debounceTime` visceral — a learner should see, in motion, the moment a new source value arrives and the silence timer resets, producing the classic "oh, that's what debounce does" insight.

The playground uses the real `debounceTime` operator fed by an RxJS `Subject` running against a `VirtualTimeScheduler`, so its output is always faithful to the actual RxJS library — no reimplementation.

## 2. Scope

**In scope (v1):**
- Single-operator deep dive: `debounceTime` only
- Preset scenarios (6) + click-to-add/drag-to-reposition source marbles
- Animated playback with a moving time cursor
- Ghost marble on the output lane showing the predicted next emission
- Live-updating `debounceTime(ms)` slider
- VitePress theme variable-based styling (auto dark/light mode)

**Out of scope (v1):**
- Multi-operator comparison (future: separate components per operator)
- Keyboard shortcuts (v2 nice-to-have)
- Playback speed slider (v2)
- Notation-based marble input (`-a-b--c---|`) — preset + click suffices

## 3. Architecture

**File layout:**
```
docs/.vitepress/theme/
├── index.ts                                # register component globally
└── components/
    └── DebounceTimePlayground.vue          # single-file component
```

**Registration** (in `docs/.vitepress/theme/index.ts`):
```typescript
import DefaultTheme from 'vitepress/theme'
import DebounceTimePlayground from './components/DebounceTimePlayground.vue'

export default {
	...DefaultTheme,
	enhanceApp({ app }): void {
		app.component('DebounceTimePlayground', DebounceTimePlayground)
	}
}
```

**Usage** (from any markdown page, e.g. `docs/operators/encyclopedia/debounceTime.md`):
```markdown
<DebounceTimePlayground />
```

**Dependencies:**
- Vue 3 Composition API (built into VitePress)
- TypeScript (built into VitePress build)
- `rxjs` (add to docs project's `package.json` if not already present)
- **No new npm deps beyond `rxjs`.**

**Internal shape:**
```
DebounceTimePlayground.vue
├── <script setup lang="ts">
│   • Reactive state: source, output, ghost, currentTime, debounceMs, isPlaying
│   • RxJS pipeline: Subject → debounceTime(ms, virtualScheduler) → subscribe
│   • requestAnimationFrame tick loop driving virtual time
│   • Preset scenario definitions (const array)
├── <template>
│   • Controls row (preset dropdown, debounceMs slider, play/pause, reset)
│   • Source lane (click-to-add, drag-to-reposition)
│   • Output lane (with ghost marble)
│   • Status caption
└── <style scoped>
    • Uses --vp-c-brand, --vp-c-bg-soft, etc.
```

**Growth plan:** if the file grows beyond ~500 lines, extract the playback engine into a composable `useDebouncePlayback.ts`. Start monolithic.

## 4. Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Preset: [ Typing burst ▾ ]   debounceTime:  [━━━●━━━] 300ms        │
│  "Rapid inputs collapse into a single trailing emission."            │
│                                                                      │
│                                       [ ▶ Play ]  [ ↻ Reset ]        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   source$  ─●──●─●───●──────────●───────────────▌──────────────────  │
│              a  b c   d          e                                   │
│                                                  ↑ time cursor       │
│                                                                      │
│   output$  ────────────────◯────────────────────(d)──────◦──────────  │
│                           ghost                  emitted ghost       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Status: silence active · 210ms until next emit · last emit: 'd'    │
└─────────────────────────────────────────────────────────────────────┘
```

**Elements:**

- **Controls row:** preset dropdown (with live-updated description caption underneath), `debounceTime` slider (0–1000ms, default 300ms), play/pause toggle, reset button.
- **Source lane:** horizontal timeline. Fixed virtual duration 3000ms. Click empty area → add marble at click position (label auto-assigned `a`, `b`, `c`...). Drag marbles to reposition. Shift-click or right-click to remove.
- **Output lane:** same timeline scale. Solid marbles for committed emissions. A **ghost marble** (translucent, dashed border) at the predicted firing position `latestSourceMarbleTime + debounceMs`. Ghost *jumps* when a new source marble arrives (reset visualization).
- **Time cursor:** vertical line sweeping left-to-right during playback.
- **Status caption:** one of `idle — waiting for input` / `silence active · Nms until next emit · last emit: 'X'` / `emitted 'X' at t=Nms`.

**Colors (VitePress theme vars):**
- Source marbles: `--vp-c-brand`
- Output marbles: `--vp-c-tip-1`
- Ghost marble: same hue as output, `opacity: 0.35`, dashed border
- Time cursor: `--vp-c-text-2`
- Lane backgrounds: `--vp-c-bg-soft`

## 5. State Model

```typescript
interface SourceMarble {
	id: string
	label: string
	time: number    // virtual ms from t=0
}

interface OutputMarble {
	id: string
	sourceLabel: string
	time: number    // virtual ms when emitted
}

interface GhostMarble {
	sourceLabel: string
	firesAt: number // virtual ms
}

// Reactive state
const source = ref<SourceMarble[]>([])
const debounceMs = ref<number>(300)
const timelineDurationMs = ref<number>(3000)       // fixed virtual duration
const playbackDurationMs = ref<number>(6000)        // wall-clock playback, 2× slowdown
const isPlaying = ref<boolean>(false)
const currentTime = ref<number>(0)
const output = ref<OutputMarble[]>([])
const ghost = ref<GhostMarble | null>(null)
const statusMessage = ref<string>('idle — waiting for input')
```

**Two time scales:**
- **Virtual time** — the time the RxJS pipeline operates in. Maps 1:1 to marble positions.
- **Wall-clock time** — browser `performance.now()`, drives animation. Mapped to virtual via `virtualMs = wallElapsed * (timelineDurationMs / playbackDurationMs)`.

Default 2× slowdown (6000ms wall = 3000ms virtual) so learners can follow.

## 6. Playback Mechanics

**Tick loop** (pseudocode):
```typescript
function tick(): void {
	if (!isPlaying.value) return
	const now = performance.now()
	const wallElapsed = now - playStartWall
	currentTime.value = wallElapsed * (timelineDurationMs.value / playbackDurationMs.value)

	// Feed source marbles into the Subject as virtual time passes them
	while (nextSourceIdx < source.value.length && source.value[nextSourceIdx].time <= currentTime.value) {
		sourceSubject.next(source.value[nextSourceIdx])
		nextSourceIdx++
	}

	updateGhost()

	if (currentTime.value >= timelineDurationMs.value) {
		sourceSubject.complete()   // triggers emit-on-complete for scenario #6
		isPlaying.value = false
		return
	}
	requestAnimationFrame(tick)
}
```

**RxJS pipeline** (set up in `onMounted`, torn down on reset or unmount):
```typescript
const sourceSubject = new Subject<SourceMarble>()
const subscription = sourceSubject.pipe(
	debounceTime(debounceMs.value, virtualScheduler)
).subscribe((marble: SourceMarble): void => {
	output.value.push({
		id: crypto.randomUUID(),
		sourceLabel: marble.label,
		time: currentTime.value,
	})
	flashStatus(`emitted '${marble.label}' at t=${Math.round(currentTime.value)}ms`)
})
```

**Virtual scheduler:** `debounceTime(ms, virtualScheduler)` needs a `SchedulerLike` whose clock matches our virtual time. Two viable implementations:

- **Option (a):** Use RxJS's `VirtualTimeScheduler`; on each `tick()`, set `scheduler.frame = currentTime.value` and call `scheduler.flush()` to execute any due actions.
- **Option (b):** Implement a small custom `SchedulerLike` whose `now()` returns `currentTime.value` and whose `schedule(work, delay)` posts `work` to a priority queue flushed on each `tick()`.

Option (b) is usually simpler and less coupled to RxJS internals; option (a) reuses RxJS's well-tested scheduler. Pick during implementation based on whether `VirtualTimeScheduler` exposes the needed control surface in the current RxJS version.

**Ghost computation:**
```typescript
function updateGhost(): void {
	const lastFed = source.value
		.filter((m: SourceMarble): boolean => m.time <= currentTime.value)
		.at(-1)
	if (!lastFed) { ghost.value = null; return }

	const firesAt = lastFed.time + debounceMs.value
	const alreadyFired = output.value.some(
		(o: OutputMarble): boolean => o.sourceLabel === lastFed.label && o.time >= firesAt - 1
	)
	ghost.value = alreadyFired ? null : { sourceLabel: lastFed.label, firesAt }
}
```

## 7. User Interactions

| Action | Behaviour |
|---|---|
| **Select preset** | Replace `source`, reset playback |
| **Click empty lane** | Add marble at click position, auto-label, sort, reset playback |
| **Drag marble** | Update `time` live, debounced via `requestAnimationFrame`; on pointerup, sort and reset playback |
| **Shift-click / right-click marble** | Remove marble, relabel remaining, reset playback |
| **Play / Pause** | Toggle `isPlaying`. Resume picks up at current virtual time |
| **Reset** | Set `currentTime=0`, clear output and ghost, teardown + rebuild RxJS pipeline |
| **Drag debounceMs slider** | **Live update.** `watch(debounceMs, () => teardownAndRestartPipeline(currentTime.value))`. Ghost jumps immediately to reflect new deadline. |

**Editing source marbles during playback is disallowed** — any edit calls `resetPlayback()`.

## 8. Preset Scenarios

Six scenarios, each teaching one behavioural facet.

| # | Name | Source marble times (ms) | Output @ default 300ms | Teaches |
|---|------|---|---|---|
| 1 | Typing burst *(default)* | a@200, b@350, c@500, d@650, e@800 | e@1100 | Bursts collapse to one trailing emission |
| 2 | Steady typing | a@200, b@700, c@1200, d@1700, e@2200 | a@500, b@1000, c@1500, d@2000, e@2500 | Spacing > debounceMs → every input emits |
| 3 | Two bursts | a@150, b@300, c@1200, d@1350 | b@600, d@1650 | One emission per burst |
| 4 | Firehose | 15 marbles every 150ms from @100 to @2200 | one emission: o@2500 | Continuous input never fires until it stops; fires once 300ms after the last value |
| 5 | Lone click | a@1000 | a@1300 | Single-value deadline semantics |
| 6 | Emit on complete | a@2500, b@2700 | b@3000 (on completion, bypassing wait) | **Gotcha:** completion flushes pending value |

```typescript
interface Preset {
	name: string
	description: string
	marbles: readonly { label: string; time: number }[]
}

const presets: readonly Preset[] = [
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
	// ... 5 more
]
```

Preset selection populates marbles but does **not** reset the `debounceMs` slider — user can explore any preset at any debounce value.

## 9. Testing

Three layers:

**1. Pure-function unit tests** (Vitest)
```typescript
test('computeGhost points at latestFedMarble.time + debounceMs', (): void => {
	const marbles = [{ label: 'a', time: 500 }]
	expect(computeGhost(marbles, 600, 300, [])).toEqual({ sourceLabel: 'a', firesAt: 800 })
})
```

**2. RxJS marble tests** (Vitest + `TestScheduler`) — one test per preset, proves the pipeline produces the claimed emissions.
```typescript
test('preset "Typing burst" emits once at t=1100', (): void => {
	const scheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
	scheduler.run(({ cold, expectObservable }) => {
		const input$ = cold('----a---b---c---d---e-----------')
		const expected =    '------------------------------(e|)'
		expectObservable(input$.pipe(debounceTime(6))).toBe(expected)
	})
})
```

**3. One smoke test** (Vue Test Utils) — mounts component, asserts initial render, clicks play, asserts outputs appear. No drag/interaction tests in v1.

**Testability hooks:** `data-testid` attributes on all interactive elements:
- `preset-selector`, `debounce-ms-slider`, `play-button`, `reset-button`
- `source-marble`, `output-marble`, `ghost-marble`, `status-caption`

**New dependencies:** Vitest + `@vue/test-utils` + `happy-dom` — add to docs project if not already configured.

## 10. Open Questions (to address during implementation)

1. **Value labeling beyond 26 marbles** — wrap to `aa`, `ab`, etc., or cap at 26? *Default: cap at 26 with a subtle "max marbles" hint.*
2. **Playback speed** — fixed 2× slowdown adequate, or add slider in v1? *Default: fixed for v1; slider is a v2 feature.*
3. **Mobile / narrow screens** — how does the horizontal timeline handle <600px widths? *Default: horizontal scroll inside a container; no separate responsive layout.*
4. **Accessibility** — marble-dragging isn't keyboard-accessible in v1. Acceptable for v1 but document the gap. *Future: arrow-key selection + left/right nudge.*

## 11. Non-Goals

- Not a general-purpose RxJS simulator — it's deliberately specific to `debounceTime`.
- Not a replacement for the ASCII/Mermaid marble diagrams already in `debounceTime.md` — it sits above them as a "see it in motion" supplement.
- Not testing framework for users' own streams — they'd copy the component and adapt it.
