---
marp: true
theme: uncover
title: "exhaustMap: form submit, login, debounced actions"
---

# exhaustMap: form submit, login, debounced actions
> Intermediate devs reach for `switchMap` on form submit — and silently cancel in-flight HTTP requests every time an impatient user double-clicks.

---

## Core Concept

- **Policy:** While an inner Observable is active, new outer values are **dropped entirely** — no queue, no switch, no buffer
- Only one active inner subscription at a time; memory is O(1)
- Dropped values are gone forever — exhaustMap never retries or replays them
- Verbatim rule: *"When a new outer value arrives, if an inner is currently active, drop the new value entirely"*
- Key contrast: `switchMap` protects the **latest** outer value; `exhaustMap` protects the **current** inner operation

---

## How It Works

```
outer:    --a--b--c---------d-->
          exhaustMap(v => inner$(v))

inner(a):   ------A1--A2--|
inner(d):                   ------D1--|

output:   --------A1--A2-----------D1--|
               ↑           ↑
          b, c dropped    d accepted — inner(a) already complete
          (inner(a) active)
```

`b` and `c` arrive while `inner(a)` is still running → **silently discarded**.
`d` arrives after `inner(a)` completes → **accepted and executed normally**.

---

## Common Mistake

```typescript
// ❌ switchMap for form submit — cancels the in-flight request on re-click
submitBtn$.pipe(
  switchMap(() => submitForm$(formData)),
  // Why it fails: a second click unsubscribes the first HTTP request mid-flight.
  // The UI may show "submitting" but the server never received the first call.
  // For non-idempotent actions (payments, orders) this causes data corruption.
).subscribe(handleResult);

// ❌ Nested subscriptions — fires a new independent request on every click
submitBtn$.subscribe(() => {
  submitForm$(formData).subscribe(handleResult);
  // No flattening policy: 5 clicks = 5 concurrent requests, all race to finish.
});
```

---

## The Right Way

```typescript
import { exhaustMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// ✅ exhaustMap — extra clicks are dropped while the submit is in flight
submitBtn$.pipe(
  exhaustMap(() =>
    submitForm$(formData).pipe(
      catchError(err => of({ success: false, error: err })),
      // ↑ always catch inside the inner — one failure must not kill the outer stream
    ),
  ),
).subscribe(handleResult);

// ✅ Login — prevent duplicate auth calls from impatient re-clicks
loginClick$.pipe(
  exhaustMap(credentials =>
    authenticate$(credentials).pipe(
      catchError(err => of({ authenticated: false, error: err })),
    ),
  ),
  // ↑ concurrent login calls would race; exhaustMap guarantees only one runs
).subscribe(handleAuth);
```

---

## Key Rule

> **`exhaustMap` is the only correct choice for non-idempotent user actions — it lets the current operation finish undisturbed and throws away every re-click that arrives while it is busy.**