# rxjs-lite

A small, RxJS-inspired reactive streams library designed from a greenfield perspective, while keeping familiar RxJS ergonomics:
- `Observable<T>` with `subscribe(...)` and `pipe(...)`
- pipeable operators (`map`, `scan`, `mergeMap`, `switchMap`, etc.)
- a tiny time layer (`SchedulerLike`, `timer`, `delay`, `debounceTime`, `throttleTime`)
- learning-first instrumentation via `trace()`

## Goals (v0)
- Minimal but expressive core
- Deterministic time operators via scheduler injection
- Clean teardown semantics (`Subscription`)

## Install (local dev)
```bash
npm install
npm run build
npm test
```

## Example
```ts
import { of, asyncScheduler } from "rxjs-lite";
import { debounceTime, map } from "rxjs-lite/operators";

of(1,2,3).pipe(
  map(x => x * 2),
  debounceTime(100, asyncScheduler),
).subscribe({
  next: v => console.log(v),
  complete: () => console.log("done"),
});
```


## Multicasting
```ts
import { Observable } from "rxjs-lite";
import { share } from "rxjs-lite/operators";

let upstreamSubscriptions = 0;

const source$ = new Observable<number>((sub) => {
  upstreamSubscriptions++;
  sub.next(1);
  sub.next(2);
  sub.complete();
});

const shared$ = source$.pipe(share());

shared$.subscribe(console.log);
shared$.subscribe(console.log);

console.log({ upstreamSubscriptions }); // 1
```

## Examples

See `examples/` for learning-oriented sample pipelines:
- `01-debounced-search.ts`
- `02-share-single-upstream.ts`

## Project layout

- `src/core/*` – core Observable/Subscription machinery
- `src/creators/*` – `of`, `from`, `defer`, `throwError`, `timer`
- `src/operators/*` – pipeable operators (including time operators)
- `src/schedulers/*` – `asyncScheduler`, `immediateScheduler`

## Next steps (suggested)
- Add `interval`, `animationFrameScheduler`
- Add marble-test style utilities (mini TestScheduler)

## Credits
This library concept and API shape were inspired by a series of design sessions with ChatGPT (GPT-5.2 Thinking), exploring RxJS architecture, operator kernels, and time semantics.
