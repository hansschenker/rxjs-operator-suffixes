---
title: "State Machine Pattern in RxJS"
category: patterns
tags: [patterns, state-machine, scan, expand, finite-state, reducer, xstate]
related: [mvu.md, state-management.md, effects.md, ../architectures/xstate-vs-rxjs.md, ../core/operators.md]
sources: 1
updated: 2026-04-08
---

# State Machine Pattern in RxJS

> RxJS can model finite state machines explicitly using two approaches: a `scan`-based action/reducer stream (MVU-style) or an `expand`-based recursive stream. Both make control state visible and typed.

## When to Use This Pattern

Use this pattern when:
- A pure timed dataflow becomes **control-dependent** (e.g. the pedestrian button in a traffic light)
- You need **remembered state** that determines which transitions are legal
- You want to stay in RxJS but model state machine semantics
- You need to **compose** state machine output with other streams

For simpler cases where the state machine is the *primary* concern (not stream composition), consider XState instead — see [xstate-vs-rxjs](../architectures/xstate-vs-rxjs.md).

## Approach 1 — scan + Action Stream (MVU-style)

The most composable approach. Models state as a stream derived from actions.

```typescript
import { Subject, merge, timer } from 'rxjs';
import { scan, startWith, shareReplay, map, switchMap, distinctUntilChanged } from 'rxjs/operators';

// ─── Types ────────────────────────────────────────────────

type TrafficMode = 'green' | 'yellowToRed' | 'red' | 'yellowToGreen';

interface TrafficState {
	mode: TrafficMode;
	light: 'green' | 'yellow' | 'red';
	pedestrianWaiting: boolean;
}

type Action =
	| { type: 'PED_REQUEST' }
	| { type: 'GREEN_TIMEOUT' }
	| { type: 'YELLOW_TO_RED_TIMEOUT' }
	| { type: 'RED_TIMEOUT' }
	| { type: 'YELLOW_TO_GREEN_TIMEOUT' };

// ─── Reducer (pure — no side effects) ────────────────────

const initialState: TrafficState = {
	mode: 'green',
	light: 'green',
	pedestrianWaiting: false,
};

function reducer(state: TrafficState, action: Action): TrafficState {
	switch (action.type) {
		case 'PED_REQUEST':
			return { ...state, pedestrianWaiting: true };

		case 'GREEN_TIMEOUT':
			return state.pedestrianWaiting
				? { mode: 'yellowToRed', light: 'yellow', pedestrianWaiting: true }
				: { ...state }; // stay green — no pedestrian waiting

		case 'YELLOW_TO_RED_TIMEOUT':
			return { mode: 'red', light: 'red', pedestrianWaiting: true };

		case 'RED_TIMEOUT':
			return { mode: 'yellowToGreen', light: 'yellow', pedestrianWaiting: false };

		case 'YELLOW_TO_GREEN_TIMEOUT':
			return { mode: 'green', light: 'green', pedestrianWaiting: false };

		default:
			return state;
	}
}

// ─── Action Bus ───────────────────────────────────────────

const action$ = new Subject<Action>();
const dispatch = (a: Action) => action$.next(a);

// ─── State Stream ─────────────────────────────────────────

const state$ = action$.pipe(
	scan(reducer, initialState),
	startWith(initialState),
	shareReplay(1),
);

// ─── Timeout Effects ──────────────────────────────────────
// State transitions drive timeout timers (effects dispatch back to action$)

state$.pipe(
	distinctUntilChanged((a, b) => a.mode === b.mode),
	switchMap(state => {
		const timeouts: Record<TrafficMode, [number, Action]> = {
			'green':         [2000, { type: 'GREEN_TIMEOUT' }],
			'yellowToRed':   [1000, { type: 'YELLOW_TO_RED_TIMEOUT' }],
			'red':           [3000, { type: 'RED_TIMEOUT' }],
			'yellowToGreen': [1000, { type: 'YELLOW_TO_GREEN_TIMEOUT' }],
		};
		const [ms, action] = timeouts[state.mode];
		return timer(ms).pipe(map(() => action));
	})
).subscribe(dispatch);

// ─── Derived Streams ──────────────────────────────────────

const visibleLight$ = state$.pipe(
	map(s => s.light),
	distinctUntilChanged(),
);

const pedestrianWaiting$ = state$.pipe(
	map(s => s.pedestrianWaiting),
	distinctUntilChanged(),
);
```

**Key properties of this approach:**
- Reducer is a **pure function** — trivially unit-testable
- State is a **stream** — composable with other streams
- Timeout effects are **declarative** — driven by mode transitions
- Adding new actions = add a case to the reducer + an effect

## Approach 2 — expand (Recursive Stream)

`expand` applies an operator recursively, making each state the seed for the next. Good for simple state machines without external events.

```typescript
import { of, timer, EMPTY } from 'rxjs';
import { expand, switchMap, map, share } from 'rxjs/operators';

interface TrafficState {
	mode: 'green' | 'yellowToRed' | 'red' | 'yellowToGreen';
	light: 'green' | 'yellow' | 'red';
	durationMs: number;
}

const transitions: Record<TrafficState['mode'], TrafficState> = {
	'green':         { mode: 'yellowToRed',   light: 'yellow', durationMs: 1000 },
	'yellowToRed':   { mode: 'red',           light: 'red',    durationMs: 3000 },
	'red':           { mode: 'yellowToGreen', light: 'yellow', durationMs: 1000 },
	'yellowToGreen': { mode: 'green',         light: 'green',  durationMs: 2000 },
};

const initialState: TrafficState = { mode: 'green', light: 'green', durationMs: 2000 };

const trafficState$ = of(initialState).pipe(
	expand(state =>
		timer(state.durationMs).pipe(
			map(() => transitions[state.mode])
		)
	),
	share(),
);

const visibleLight$ = trafficState$.pipe(
	map(s => s.light),
	distinctUntilChanged(),
);
```

**Marble diagram:**
```
of(green) ──expand──► wait 2s ──► yellowToRed ──expand──► wait 1s ──► red ──► ...
```

**Limitation:** `expand` is elegant for pure timer-driven machines but awkward when external events (pedestrian button) need to interrupt or modify the stream. Approach 1 handles that cleanly.

## Comparison

| | scan + action stream | expand |
|--|---------------------|--------|
| External events | Natural (dispatch to action$) | Difficult |
| Pure timer machines | Works well | Elegant |
| Testability | Pure reducer — easy | Marble test expand chain |
| Composability | Excellent (state$ is a stream) | Good |
| Visual clarity | Explicit reducer | Implicit in recursion |

## The Three-Graph View

When modelling a domain with RxJS state machines, think in three graphs:

```
1. Control graph (XState mental model)
   green ──2s──► yellowToRed ──1s──► red ──3s──► yellowToGreen ──1s──► green

2. Dataflow graph (RxJS stream)
   action$ ──scan(reducer)──► state$ ──shareReplay──► visibleLight$

3. Effect graph (side effects driving actions)
   state$.mode ──switchMap(timer)──► dispatch(timeoutAction)
   pedButton.click ──► dispatch({ type: 'PED_REQUEST' })
```

## Testing

The reducer is a pure function — test it without Observables:

```typescript
import { describe, test, expect } from 'vitest';

describe('trafficLight reducer', () => {
	test('PED_REQUEST sets pedestrianWaiting', () => {
		const state = reducer(initialState, { type: 'PED_REQUEST' });
		expect(state.pedestrianWaiting).toBe(true);
		expect(state.mode).toBe('green'); // mode unchanged
	});

	test('GREEN_TIMEOUT transitions when pedestrian waiting', () => {
		const waiting = { ...initialState, pedestrianWaiting: true };
		const state = reducer(waiting, { type: 'GREEN_TIMEOUT' });
		expect(state.mode).toBe('yellowToRed');
		expect(state.light).toBe('yellow');
	});

	test('GREEN_TIMEOUT stays green when no pedestrian', () => {
		const state = reducer(initialState, { type: 'GREEN_TIMEOUT' });
		expect(state.mode).toBe('green');
	});
});
```

Test the timeout effect with marble testing:

```typescript
import { TestScheduler } from 'rxjs/testing';

test('green state fires GREEN_TIMEOUT after 2000ms', () => {
	const scheduler = new TestScheduler((a, e) => expect(a).toEqual(e));
	scheduler.run(({ cold, expectObservable }) => {
		// See [marble-testing](../testing/marble-testing.md) for full pattern
	});
});
```

## When RxJS Beats XState at State Machines

RxJS wins when the state machine output **composes with other streams**:

```typescript
// XState actor output is not a stream — requires bridging
// RxJS state$ IS a stream — composes naturally

combineLatest([
	trafficState$.pipe(map(s => s.light)),
	pedestrianSignal$,
	weatherConditions$,
]).pipe(
	map(([light, ped, weather]) => computeDisplayState(light, ped, weather))
).subscribe(render);
```

## Related

- [xstate-vs-rxjs](../architectures/xstate-vs-rxjs.md) — full comparison with traffic light example
- [mvu](mvu.md) — the MVU pattern this approach is based on
- [state-management](state-management.md) — general scan-based state patterns
- [effects](effects.md) — how timeout effects fit the Effects pattern
- [marble-testing](../testing/marble-testing.md) — testing time-based state machines
