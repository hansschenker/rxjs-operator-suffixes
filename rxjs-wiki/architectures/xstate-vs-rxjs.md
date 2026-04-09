---
title: "XState vs RxJS — Control Graph vs Dataflow Graph"
category: architectures
tags: [architectures, xstate, state-machine, dataflow, comparison, traffic-light]
related: [index.md, ../patterns/state-machine.md, ../patterns/mvu.md, ../patterns/state-management.md]
sources: 1
updated: 2026-04-08
---

# XState vs RxJS — Control Graph vs Dataflow Graph

> XState models systems as finite state graphs (what states are legal, what transitions are legal). RxJS models systems as timed dataflow graphs (what values flow, over what time, composed with what other streams). Both can solve the same problems — but each has a home domain.

## The Core Distinction

| Dimension | XState | RxJS |
|-----------|--------|------|
| Primary abstraction | Finite control state | Observable dataflow |
| System changes via | State transitions | New emissions |
| Time is | One possible transition trigger | Part of the stream composition |
| State | Explicit — the machine is always in a named state | Usually derived (can be made explicit with `scan`) |
| The key question | *What state am I in? Where may I go?* | *What value is flowing now? What comes next?* |
| Graph type | Control topology | Time + sequence + subscription topology |

## The Traffic Light Example

A traffic light that cycles: **green (2s) → yellow (1s) → red (3s) → yellow (1s) → repeat**.

### XState — Finite State Graph

```typescript
import { createMachine, createActor } from 'xstate';

const trafficLightMachine = createMachine({
	id: 'trafficLight',
	initial: 'green',
	states: {
		green: {
			after: { 2000: 'yellowToRed' }
		},
		yellowToRed: {
			after: { 1000: 'red' }
		},
		red: {
			after: { 3000: 'yellowToGreen' }
		},
		yellowToGreen: {
			after: { 1000: 'green' }
		},
	},
});

const actor = createActor(trafficLightMachine);
actor.subscribe(snapshot => console.log(snapshot.value));
actor.start();
```

The machine asks: *What states are legal? From this state, where may I go next? When should that transition fire?*

Note the two yellow states (`yellowToRed` and `yellowToGreen`) — necessary because a state machine is **deterministic**: from a given state, the next transition must be explicit. The position in the control graph determines what comes next.

### RxJS — Timed Dataflow

```typescript
import { from, concat, timer, of } from 'rxjs';
import { concatMap, ignoreElements, repeat, share } from 'rxjs/operators';

interface Phase {
	light: 'green' | 'yellow' | 'red';
	durationMs: number;
}

const phases: Phase[] = [
	{ light: 'green',  durationMs: 2000 },
	{ light: 'yellow', durationMs: 1000 },
	{ light: 'red',    durationMs: 3000 },
	{ light: 'yellow', durationMs: 1000 },
];

const trafficLight$ = from(phases).pipe(
	concatMap(phase =>
		concat(
			of(phase.light),                          // emit the light immediately
			timer(phase.durationMs).pipe(ignoreElements()) // wait the duration
		)
	),
	repeat(),   // restart the cycle when complete
	share(),    // one shared execution (not one per subscriber)
);

trafficLight$.subscribe(light => console.log(light));
```

RxJS asks: *What value is flowing now? How long should that value remain current? What comes next? Should execution be shared or per-subscriber?*

Note: both yellow phases can emit the same value `'yellow'` because **sequence position** already determines what comes next — no need for `yellowToRed` / `yellowToGreen` distinction.

## Three Graphs for the Same Domain

The article describes three complementary views of the same traffic light:

```
1. XState transition graph
   green ──2s──► yellowToRed ──1s──► red ──3s──► yellowToGreen ──1s──► (back to green)
   "Legal control modes and explicit transitions"

2. RxJS stream graph (dataflow)
   from(phases) ──concatMap──► concat(of(light), timer(ms)) ──repeat──► share
   "Visible phases moving through time"

3. RxJS state stream (reducer-based)
   timer$ ──action──► scan(reducer) ──shareReplay──► state$
   "Remembered state evolving over time"
```

All three describe the same domain from different angles. The right one to use depends on which question you're primarily trying to answer.

## The Pedestrian Button — The Deciding Test

Adding a pedestrian button changes everything. Now the system must:
- **Remember** a pending request
- **Decide** when a demand is legal to serve
- **Make transitions depend** on control context

### XState with Pedestrian Button

This is XState's home territory — remembered context + guarded transitions:

```typescript
const trafficLightWithPedestrianMachine = createMachine({
	id: 'trafficLightWithPedestrian',
	context: { pedestrianWaiting: false },
	initial: 'green',
	states: {
		green: {
			on: {
				PED_REQUEST: {
					actions: assign({ pedestrianWaiting: true })
				}
			},
			after: {
				2000: [
					{ guard: ({ context }) => context.pedestrianWaiting, target: 'yellowToRed' },
					{ target: 'green' } // stay green if no request
				]
			}
		},
		yellowToRed:   { after: { 1000: 'red' } },
		red:           { after: { 3000: 'yellowToGreen' } },
		yellowToGreen: {
			after: {
				1000: {
					target: 'green',
					actions: assign({ pedestrianWaiting: false })
				}
			}
		},
	},
});
```

### RxJS with Pedestrian Button — Conceptual Shift

The pedestrian button forces RxJS away from a simple timed phase stream into the action/reducer/state stream pattern:

```typescript
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

function reducer(state: TrafficState, action: Action): TrafficState {
	switch (action.type) {
		case 'PED_REQUEST':
			return { ...state, pedestrianWaiting: true };
		case 'GREEN_TIMEOUT':
			return state.pedestrianWaiting
				? { mode: 'yellowToRed', light: 'yellow', pedestrianWaiting: true }
				: state; // stay green
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

const action$ = new Subject<Action>();
const dispatch = (a: Action) => action$.next(a);

const initialState: TrafficState = { mode: 'green', light: 'green', pedestrianWaiting: false };

const state$ = action$.pipe(
	scan(reducer, initialState),
	startWith(initialState),
	shareReplay(1),
);

// Timeout effects — driven by state transitions
state$.pipe(
	distinctUntilChanged((a, b) => a.mode === b.mode),
	switchMap(state => {
		switch (state.mode) {
			case 'green':       return timer(2000).pipe(map(() => ({ type: 'GREEN_TIMEOUT' as const })));
			case 'yellowToRed': return timer(1000).pipe(map(() => ({ type: 'YELLOW_TO_RED_TIMEOUT' as const })));
			case 'red':         return timer(3000).pipe(map(() => ({ type: 'RED_TIMEOUT' as const })));
			case 'yellowToGreen': return timer(1000).pipe(map(() => ({ type: 'YELLOW_TO_GREEN_TIMEOUT' as const })));
		}
	})
).subscribe(dispatch);

// Pedestrian button
fromEvent(pedButton, 'click').subscribe(() => dispatch({ type: 'PED_REQUEST' }));

// Visible light
const visibleLight$ = state$.pipe(map(s => s.light), distinctUntilChanged());
```

This is the [MVU pattern](../patterns/mvu.md) applied to a state machine problem — the pedestrian button reveals that the problem is now a **control machine**, not a pure timed sequence.

## Choosing Between XState and RxJS

### Use XState when

- Legal control states are the primary concern
- Transitions must be **explicit and inspectable** (statecharts, visualizer)
- Guards, events, and orchestration dominate the design
- You need to **rule out impossible transitions** at the type level
- The problem is "what mode am I in and what can I do from here?"

### Use RxJS when

- Values moving over time are the primary concern
- You need **composition with other streams** (user input, sensors, WebSocket, HTTP)
- Cancellation, timing, and scheduling matter
- The system needs to **derive many downstream streams** from the same source
- The problem is "what is the current value and what does it feed into?"

### The Gradient

Most real systems live on a gradient:

```
Pure timed sequence ──────────────────────────────► Control machine
(RxJS phase stream)                               (XState machine)
       |                    |                           |
  Traffic light         Traffic light +            Complex multi-step
  (no button)           pedestrian button          wizard / workflow
```

The pedestrian button is the inflection point — it's a good test for any system: *"Is this mostly timing/dataflow, or mostly explicit control states?"*

## RxJS Can Model State Machines

RxJS doesn't lack state machine capability — it has two approaches:

**1. scan-based reducer** (shown above) — explicit remembered state, action-driven
**2. expand-based recursive stream** — see [state-machine](../patterns/state-machine.md)

The difference is ergonomics, not capability. XState gives you a visual diagram, type-safe transitions, devtools, and guards for free. RxJS gives you composability with other streams for free. When you need both — use both, wired together.

## Stream as Timed Notifications

The article offers a precise mental model for RxJS streams:

> A stream is a sequence of timed notifications: `[(n₁, T₁), (n₂, T₂), ...]`
> where each `n` is a **Next**, **Error**, or **Complete** notification, and `T` is when it arrives.

This formulation:
- Keeps time explicit in the model
- Includes the full Observable protocol (next/error/complete)
- Separates *what arrives* from *when it arrives*
- Explains why `materialize()` feels natural — it turns notifications into ordinary data

For everyday reasoning: a stream ≈ `[(value, time), ...]`
For full protocol reasoning: a stream ≈ `[(notification, time), ...]`

## Related

- [index](index.md) — architecture comparison overview
- [state-machine](../patterns/state-machine.md) — RxJS state machine pattern (scan + expand)
- [mvu](../patterns/mvu.md) — MVU pattern used in the pedestrian button solution
- [state-management](../patterns/state-management.md) — scan-based state management
