---
marp: true
theme: uncover
title: "XState vs RxJS: when to reach for a state machine"
---

# XState vs RxJS: when to reach for a state machine
> Developers reach for pure RxJS streams even when their system has explicit named control states — and end up reimplementing broken state machines inside `concatMap`.

---

## Core Concept
- **XState** models a *control graph* — named states with explicit, guarded legal transitions
- **RxJS** models a *dataflow graph* — values flowing over time, composed with other streams
- XState's key question: *"What state am I in? Where may I legally go next?"*
- RxJS's key question: *"What value is flowing now? What does it feed into?"*
- > "The pedestrian button is the deciding test: if an external event requires *remembered context* and *guarded transitions*, you have a control machine problem — not a timed sequence."

---

## How It Works

```
Pure timed sequence ──────────────────────────────► Control machine
(RxJS phase stream)          inflection point        (XState machine)
        │                           │                       │
  Traffic light             Traffic light +          Multi-step wizard
  (no button)               pedestrian button        / guarded workflow
  sequence is enough        "can I guard a transition
                             on remembered context?"
```

```typescript
// RxJS wins here — pure timing, no context needed
const trafficLight$ = from(phases).pipe(
	concatMap(phase => concat(
		of(phase.light),                               // emit phase value immediately
		timer(phase.durationMs).pipe(ignoreElements()) // hold for its duration
	)),
	repeat(), // restart cycle indefinitely
	share(),  // one shared execution for all subscribers
);
```

---

## Common Mistake

```typescript
// ❌ Bolting a memory flag onto a timed phase stream
const pedWaiting$ = fromEvent(pedButton, 'click').pipe(
	scan(() => true, false),
	startWith(false),
);

const trafficLight$ = from(phases).pipe(
	concatMap(phase => concat(
		of(phase.light),
		timer(phase.durationMs).pipe(ignoreElements())
	)),
	repeat(),
	withLatestFrom(pedWaiting$), // ← can READ the flag at emission time …
	// … but CANNOT guard the transition.
	// The phase stream always advances: green → yellow → red → repeat.
	// There is no hook to make green *stay green* until pedWaiting is true.
	map(([light]) => light),
);
```

---

## The Right Way

```typescript
// ✅ XState: guarded transitions are first-class citizens
const machine = createMachine({
	context: { pedestrianWaiting: false },
	initial: 'green',
	states: {
		green: {
			on: {
				PED_REQUEST: { actions: assign({ pedestrianWaiting: true }) }, // remember
			},
			after: {
				2000: [
					{ guard: ({ context }) => context.pedestrianWaiting, target: 'yellowToRed' }, // guard
					{ target: 'green' }, // re-enter green — no request yet
				],
			},
		},
		yellowToRed: { after: { 1000: 'red' } },
		red: {
			after: { 3000: { target: 'green', actions: assign({ pedestrianWaiting: false }) } }, // reset
		},
	},
});

// ✅ Need RxJS stream composability? Mirror the same logic:
//    action$ → scan(reducer) → state$
//    state$.pipe(distinctUntilChanged(modeChanged), switchMap(scheduleTimer))
//    → dispatches next action — pure MVU, full stream composability
```

---

## Key Rule
> **When an external event must be remembered and used to guard a state transition, reach for a state machine — XState or a scan-based reducer — not a flat timed stream.**