---
module: 6
lesson: "6.2"
title: Subject as a multicast proxy
key_insight: A Subject is simultaneously an Observer and an Observable — it receives values via next() and forwards them to all subscribers simultaneously, making it the primitive behind all multicasting in RxJS.
related: ["6.1", "6.3"]
---

## Hook

How does RxJS share one stream across multiple subscribers? Not with magic — with a Subject sitting between the producer and the consumers, acting as both sink and source at the same time. Every multicasting operator in RxJS reduces to this single primitive doing exactly one thing: forwarding values to a list.

## Insight

A Subject implements both `Observer<T>` — it has `next(value)`, `error(err)`, and `complete()` — and `Observable<T>` — it has `subscribe(observer)`. You push values into it via `next()`. Multiple subscribers receive those values simultaneously via `subscribe()`. Internally, a Subject maintains an array of active subscriber references and, on every `next()` call, iterates that array and delivers the value to each subscriber in sequence. That loop is multicasting. There is no other mechanism involved.

This is not a special feature added on top of Subject — it is the definition of what Subject is. `share()` creates a Subject internally and routes the source Observable through it. `shareReplay()` creates a `ReplaySubject` internally and does the same. Every multicasting operator in RxJS is ultimately a Subject performing this forwarding work. Understanding this means there are no black boxes left in the multicasting layer.

One important discipline: never expose a Subject directly to consumers. A raw Subject is a publicly writable bus — any caller with a reference can call `next()` on it and inject arbitrary values, breaking the integrity of your stream. Wrap it with `.asObservable()` before passing it to anything outside the module that owns it. This hides `next()`, `error()`, and `complete()` and gives consumers a read-only view.

## Example

```typescript
import { Subject } from 'rxjs';

// Subject as an event bus connecting independent parts of the app
const event$ = new Subject<string>();

// Two separate components subscribe before any values are pushed
event$.subscribe((msg: string) => console.log('Component A:', msg));
event$.subscribe((msg: string) => console.log('Component B:', msg));

// A third part of the app pushes a value
event$.next('user-logged-in');
// Both subscribers receive: 'user-logged-in' — same tick, same value

// Expose a read-only view to consumers — hides next(), error(), complete()
export const safeEvent$ = event$.asObservable();
```

When `next('user-logged-in')` is called, Subject iterates its internal subscriber list and calls each observer's `next()` synchronously. There is no buffering, no scheduling — just a loop over a list.

## Summary

- Subject = Observer + Observable in one object; push values via `next()`, receive via `subscribe()`
- Internally maintains a subscriber list and forwards every `next()` call to all subscribers synchronously
- Always expose via `.asObservable()` — hide the push interface from anything outside the owning module

## Pitfall

Exposing a `Subject` directly from a service. Any caller can call `subject.next()`, bypassing the service's encapsulation and injecting values from anywhere in the application. Always expose `subject.asObservable()` to consumers; only the service that owns the Subject should call `next()`.
