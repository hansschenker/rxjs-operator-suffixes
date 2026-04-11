---
marp: true
theme: uncover
title: "Global Error Capture and Centralized Reporting"
---

# Global Error Capture and Centralized Reporting
> Errors vanish silently across dozens of streams — there is no single place to log, alert, or send to Sentry.

---

## Core Concept

- Observable errors have **no global handler** — unlike `window.onerror`, every unhandled stream error disappears silently
- An error terminates its stream **permanently** — nothing after it ever runs
- A shared `Subject<unknown>` acts as the global **error bus** — all streams feed into it
- `tap({ error })` *observes* without catching; `catchError` *recovers* without exposing the error to the outer stream
- > "Catch errors **inside** inner Observables, not on the outer stream."

---

## How It Works

```
── action$ ──► switchMap ──► http.get('/api').pipe(
                               tap({ error: e => errorBus$.next(e) })
                               catchError(e => of(errorAction(e)))
                             )
                                    │ error routed, inner stream recovers
                                    ▼
                             errorBus$: Subject<unknown>
                                    │
                       ┌────────────┴─────────────┐
                       ▼                           ▼
                 Sentry.capture(err)         toast.showError(err)

outer action$ ── never sees the error ──► stays alive indefinitely
```

---

## Common Mistake

```typescript
// WRONG — catching at the outer level kills the entire effect
action$.pipe(
  switchMap(() => http.get<Data>('/api/data')),

  // This runs once on the first error, then the stream is dead.
  // No more actions will ever be processed after this point.
  catchError((err: unknown) => {
    errorService.report(err); // reported, yes — but at too high a cost
    return EMPTY;             // outer stream terminates permanently
  })
).subscribe(dispatch);
```

---

## The Right Way

```typescript
// 1. Create the global error bus — once, at app bootstrap
const errorBus$ = new Subject<unknown>();

// 2. Wire centralised reporting to the bus — once
errorBus$.pipe(
  tap((err: unknown) => Sentry.captureException(err)), // ship to error tracker
  tap((err: unknown) => toastService.showError(err)),  // notify the user
).subscribe();

// 3. Inside every effect: catch INSIDE the inner Observable
action$.pipe(
  switchMap(() =>
    http.get<Data>('/api/data').pipe(
      catchError((err: unknown) => {
        errorBus$.next(err);           // route to global bus
        return of(errorAction(err));   // recover — outer stream lives on
      })
    )
  )
).subscribe(dispatch);
```

---

## Key Rule

> **Route every stream error to a shared `Subject` from inside the inner Observable — any error that escapes to the outer stream kills it forever.**