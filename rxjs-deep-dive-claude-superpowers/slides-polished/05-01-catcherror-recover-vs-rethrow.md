---
marp: true
theme: uncover
title: "catchError: recover vs rethrow"
---

# catchError: recover vs rethrow
> An unhandled RxJS error permanently completes the stream — `catchError` is the single interception point that lets you decide: recover, suppress, or rethrow.

---

## Core Concept

- `catchError(fn)` intercepts an error and returns a **replacement Observable** — the original stream is gone, replaced by whatever `fn` returns
- Three strategies: **recover** (`of(fallback)`), **suppress** (`EMPTY`), **rethrow** (`throwError(() => err)`)
- Without `catchError`, an errored Observable is permanently closed — no further values ever arrive
- RxJS 7+: the error argument is typed `unknown` — always narrow with `instanceof` before accessing properties
- > "Catch errors **inside** inner Observables, not on the outer stream."

---

## How It Works

```typescript
// RECOVER — replace error with a fallback value
// source$:   --a--b--X
//                     \--of(fallback)--|
// result$:   --a--b--fallback|
source$.pipe(catchError(() => of(fallback)));

// SUPPRESS — swallow the error, complete cleanly
// source$:   --a--b--X
//                     \--|
// result$:   --a--b--|
source$.pipe(catchError(() => EMPTY));

// RETHROW — transform, then re-throw
// source$:   --a--b--X(original)
//                     \--X(AppError)
// result$:   --a--b--X(AppError)
source$.pipe(
  catchError(err => throwError(() => new AppError(err)))
);
```

---

## Common Mistake

```typescript
// ❌ WRONG — catchError sits on the outer stream
// When fetch$ errors, catchError fires once, emits errorAction, then completes.
// action$ will NEVER trigger another switchMap again — the stream is dead.
action$.pipe(
  switchMap(() => fetch$),
  catchError(err => of(errorAction(err))) // terminates the entire action$ pipeline
);
```

---

## The Right Way

```typescript
// ✅ CORRECT — catchError is scoped inside the inner Observable
action$.pipe(
  switchMap(() =>
    fetch$.pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpError) {
          return of(errorAction(err));     // recover: inner stream ends cleanly
        }
        return throwError(() => err);      // rethrow: propagate unexpected errors
      })
      // only fetch$ dies on error; action$ keeps listening
    )
  )
);
```

---

## Key Rule
> **Always place `catchError` inside the inner Observable — a catch on the outer stream permanently kills it after the first error.**