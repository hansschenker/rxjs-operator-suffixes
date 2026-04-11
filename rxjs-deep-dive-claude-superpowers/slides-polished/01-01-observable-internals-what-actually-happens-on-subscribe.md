---
marp: true
theme: uncover
title: "Observable internals: what actually happens on subscribe"
---

# Observable internals: what actually happens on subscribe
> You've been calling `subscribe()` without knowing what it runs — once you see the function underneath, teardown leaks, silent dropped emissions, and operator surprises become diagnosable on first principles.

---

## Core Concept

- An Observable is **a function**: `(observer: Observer<T>) => teardown` — the class is just ergonomics
- Calling `subscribe()` **runs that function fresh every time** — cold Observables are unicast by design
- RxJS wraps your observer in a **SafeSubscriber** that enforces the Observable contract automatically
- Operator chains build **outside-in** at subscription time; values travel **inside-out** at emission time
- > "An Observable is a function that takes an Observer and returns a teardown function. That is the complete definition. Everything else is ergonomics built on top." — Ben Lesh

---

## How It Works

```typescript
// source$.pipe(map(x => x * 2), filter(x => x > 5)).subscribe(sink)
//
// BUILD phase — outside-in (subscription time):
//   .subscribe(sink) → filter subscribes to map's Observable
//                    → map subscribes to source$   ← innermost runs last
//
// EMIT phase — inside-out (runtime):
//   source$ emits → map transforms → filter gates → sink receives

// Every operator follows this exact shape:
function map<T, R>(project: (v: T) => R) {
	return (source$: Observable<T>): Observable<R> =>
		new Observable<R>(subscriber =>          // wraps a new Observable
			source$.subscribe({                  // subscribes to source
				next: v  => subscriber.next(project(v)), // transforms, then forwards
				error: e => subscriber.error(e),
				complete: () => subscriber.complete(),
			})
		);
}
```

---

## Common Mistake

```typescript
// ✗ Treating a cold Observable like a cached Promise
const user$ = fetchUser(42); // Nothing runs yet — no request made

// Intermediate devs share this, expecting one network call.
// Each subscribe() is an independent execution of the subscribeFn.
user$.subscribe(u => renderHeader(u));   // → HTTP request #1
user$.subscribe(u => renderSidebar(u)); // → HTTP request #2 ← surprise!

// ✗ Also wrong: emitting after complete() and expecting it to arrive
const bad$ = new Observable<number>(subscriber => {
	subscriber.complete();
	subscriber.next(99); // SafeSubscriber has closed the gate —
	                     // this is silently dropped, no error thrown
});
```

---

## The Right Way

```typescript
// ✓ Opt in to shared execution explicitly with shareReplay
const user$ = fetchUser(42).pipe(
	shareReplay(1) // one HTTP request; result multicasted to all subscribers
);

user$.subscribe(u => renderHeader(u));   // → request fires once
user$.subscribe(u => renderSidebar(u)); // ← receives cached emission

// ✓ Always return teardown from the subscribeFn to prevent leaks
const ticker$ = new Observable<number>(subscriber => {
	let count = 0;
	const id = setInterval(
		() => subscriber.next(count++),
		1000
	);
	return () => clearInterval(id); // ← SafeSubscriber calls this on
	                                //   unsubscribe, complete, or error
});

ticker$.pipe(take(3)).subscribe(console.log); // cleans up automatically
```

---

## Key Rule

> **Every `subscribe()` call runs the Observable's function from scratch — shared execution is never the default and must be opted into explicitly with a multicast operator.**