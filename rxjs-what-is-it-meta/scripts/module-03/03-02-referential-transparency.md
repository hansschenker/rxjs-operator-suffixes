---
module: 3
lesson: "3.2"
title: Referential transparency — the Observable as a reusable blueprint
key_insight: An Observable is referentially transparent until subscribe() is called — you can assign it, pass it, compose it, and duplicate it with zero side effects.
---

## Hook

With a Promise, the work starts the moment the Promise is created — before you ever call `.then()`. Issue a `fetch()` call and the HTTP request is already in flight. With an Observable, creating it does absolutely nothing. This is not a quirk or an implementation detail — it is a fundamental design choice that makes Observables composable in ways Promises cannot be.

## Insight

A function is referentially transparent if replacing a call to it with its return value does not change the program's behaviour. `const double = (x: number) => x * 2` is referentially transparent: `double(3)` can always be replaced with `6` everywhere it appears.

An Observable is referentially transparent before `subscribe()`. You can assign a pipeline to a variable, reference that variable from ten different places, pass it to functions, combine it into new pipelines — nothing executes. The Observable is a pure description of work, not work itself. This is why you can safely share Observable references and compose them freely with `combineLatest`, `merge`, or `switchMap`.

`subscribe()` is the point where referential transparency ends. It converts the description into execution: side effects fire, HTTP requests are made, timers start. Until that boundary is crossed, the Observable behaves like data — it can be reasoned about, tested, and composed without any concern about unintended execution. Understanding this distinction is what separates developers who fight RxJS from developers who feel confident composing it.

## Example

The contrast with Promises is stark. A `fetch()` fires immediately at creation. Two references to the same Promise share one request — the work already happened. With `ajax.getJSON`, two references are still just two descriptions; no request fires until each is subscribed.

```typescript
import { ajax } from 'rxjs/ajax';
import { combineLatest } from 'rxjs';

interface User { id: number; name: string; }

// No HTTP request fires here — this is a blueprint
const request$ = ajax.getJSON<User>('/api/user');

const a$ = request$;  // still no request
const b$ = request$;  // still no request

// Two requests fire here — one per subscription
combineLatest([a$, b$]).subscribe(([userA, userB]: [User, User]) => {
	console.log(userA, userB);
});

// Contrast: Promise fires immediately at creation
const p = fetch('/api/user'); // request already in flight
```

The Observable does not execute until subscribed. Assign, pass, and compose freely — `subscribe()` is where the blueprint becomes reality.

## Summary

- Observable = referentially transparent blueprint; no execution until `subscribe()` is called
- Promise = eager; execution starts at creation, not at `.then()`
- Assign, pass, and compose Observables freely — `subscribe()` is where transparency ends
