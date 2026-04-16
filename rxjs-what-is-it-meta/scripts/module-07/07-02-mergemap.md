---
module: 7
lesson: "7.2"
title: mergeMap — parallel, unbounded concurrency
key_insight: mergeMap subscribes to every inner Observable immediately and concurrently with no limit. This makes it ideal for independent parallel work — and a source of connection explosions on fast sources.
related: ["7.1", "7.3"]
---

## Hook

`mergeMap` is the flattening operator most developers reach for first, because parallel feels like the natural default. It is also the one most likely to overwhelm a server if the source emits faster than inner Observables complete. The word "merge" describes the output — all inner streams merged into one — but says nothing about the concurrency model hidden inside.

## Insight

For every outer value that arrives, `mergeMap` immediately creates a new inner Observable subscription without waiting for any previous inner Observable to finish. All active inner Observables run simultaneously. Values from all of them are emitted downstream as they arrive — output order is not guaranteed and will not match input order if inner Observables take different amounts of time to complete.

If a previous inner Observable is still running when a new outer value arrives, both run simultaneously. By default, concurrency is unlimited: 1,000 outer values produce up to 1,000 concurrent inner subscriptions. On a fast-emitting source hitting a REST API, this is a denial-of-service attack on your own backend.

The second argument to `mergeMap(project, concurrency)` caps the number of simultaneously active inner subscriptions. Once the cap is reached, additional outer values queue and wait for a slot to open. This gives you a worker-pool pattern: `mergeMap(project, 4)` runs at most 4 inner Observables concurrently, queuing the rest.

Use `mergeMap` when: work items are independent of each other, every result must be delivered, and ordering does not matter — parallel image loads, independent file uploads, fan-out API calls where no result can be skipped.

## Example

```typescript
interface ImageResult { id: number; url: string; blob: Blob; }

// Load up to 4 images in parallel — queue the rest
imageIds$.pipe(
	mergeMap(
		(id: number) => loadImage(id),
		4, // max 4 concurrent inner subscriptions
	),
	tap((result: ImageResult) => tap(() => displayImage(result))),
).subscribe();

// Results arrive out of order — correct for this use case
// Without the concurrency cap: all ids fire simultaneously
```

With an unbounded `mergeMap` on a source of 500 image IDs, the browser would open 500 parallel HTTP requests — most would fail with connection errors. The concurrency cap of 4 turns this into a controlled worker pool.

## Summary

- `mergeMap` runs all inner Observables in parallel with no ordering guarantee on the output
- Default concurrency is unlimited — always consider bounding it with the second argument on fast outer sources
- Use when work items are independent and every result must be processed; wrong for writes that must complete in sequence or user actions that must not overlap

## Pitfall

Using `mergeMap` on a fast source without a concurrency limit. A mouse-move event at 60fps piped through `mergeMap(pos => expensiveRequest(pos))` opens 60 simultaneous requests per second. Use the second argument: `mergeMap(fn, 3)` to cap at 3 concurrent inner Observables, or switch to `exhaustMap` if only the latest matters.
