---
marp: true
theme: uncover
title: "Debugging streams: tap, debug operators, DevTools"
---

# Debugging streams: tap, debug operators, DevTools
> You can't set a breakpoint inside `pipe()` — and putting `console.log` inside `map()` silently corrupts your stream the moment you forget a `return`.

---

## Core Concept
- `tap()` is RxJS's **dedicated side-effect operator**: it observes every notification without transforming the value
- Receives all three notification channels: `next`, `error`, and `complete`
- **"Never put side effects in `map`; that is what `tap` is for."**
- A reusable `debug()` operator wraps `tap` with a label — drop in anywhere, delete in one line
- The RxJS DevTools Chrome extension renders live marble diagrams from running streams directly in the browser

---

## How It Works

```typescript
// Input:  --1--2--3--|
// tap:    side-effect fires on each value; stream is unchanged
// Output: --1--2--3--|  ← identical to input (tap is transparent)

source$.pipe(
  tap(v => console.log('before:', v)), // observe raw value
  map(v => v * 10),                    // transform
  tap(v => console.log('after:', v)),  // observe transformed value
  filter(v => v > 10),                 // further operators unaffected
).subscribe(renderUI);
// before: 1 → after: 10   (filtered out)
// before: 2 → after: 20   ✓
// before: 3 → after: 30   ✓
```

---

## Common Mistake

```typescript
// ❌ Logging inside map() — silently destroys data when return is omitted
source$.pipe(
  map(v => {
    console.log('value:', v);
    // forgot `return v` — every emission becomes undefined
  }),
  map(v => v * 10), // v is undefined → result is NaN; no error thrown
).subscribe(console.log); // NaN NaN NaN — silent data corruption

// Even when return is present, map() now carries a side effect.
// Operators that retry on error (retry, catchError) will re-run
// the log unintentionally, producing duplicate or misleading output.
```

---

## The Right Way

```typescript
import { tap, MonoTypeOperatorFunction } from 'rxjs';

// ✅ Reusable debug operator — zero risk of data mutation
function debug<T>(label: string): MonoTypeOperatorFunction<T> {
  return tap<T>({
    next:     v   => console.log(`[${label}] next`,     v),
    error:    err => console.error(`[${label}] error`,  err),
    complete: ()  => console.log(`[${label}] complete`),
  });
}

// Composable, deletable, and observes the full lifecycle
search$.pipe(
  debug('raw input'),            // see what the user typed
  debounceTime(300),
  distinctUntilChanged(),
  debug('after debounce'),       // confirm debounce is working
  switchMap(q => api.search$(q)),
  debug('api result'),           // verify response shape
).subscribe(renderResults);
```

---

## Key Rule
> **`map` transforms values — `tap` observes them; mixing the two turns a data pipeline into a ticking time bomb of silent `undefined` mutations.**