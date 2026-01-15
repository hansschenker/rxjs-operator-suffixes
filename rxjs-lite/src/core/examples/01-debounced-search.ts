/**
 * Example 01 — Debounced "search" (mocked)
 *
 * This example is intentionally framework-free: it simulates user typing via Subject,
 * and simulates a network request via timer().
 *
 * Key operators:
 * - debounceTime: waits for silence before "requesting"
 * - switchMap: cancels prior request when a newer term wins
 * - trace: logs lifecycle, so you can *see* cancellation and completion
 */

import { Subject, timer } from "../src";
import { debounceTime, switchMap, map, trace } from "../src/operators";

// Domain model: what our "backend" returns.
type SearchResult = { term: string; items: string[] };

function mockFetch$(term: string) {
  // Pretend the "network" takes 120ms.
  return timer(120).pipe(
    map((): SearchResult => ({
      term,
      items: [`${term}-1`, `${term}-2`, `${term}-3`],
    })),
    trace(`request(${term})`),
  );
}

const input$ = new Subject<string>();

const results$ = input$.pipe(
  trace("input"),
  debounceTime(200),
  trace("debounced"),
  switchMap((term) => mockFetch$(term)),
  trace("results"),
);

// Side effects at the subscribe boundary:
const sub = results$.subscribe({
  next: (r) => console.log("render:", r),
  complete: () => console.log("done"),
});

// Simulate typing: "r" "rx" "rxjs"
input$.next("r");
setTimeout(() => input$.next("rx"), 50);
setTimeout(() => input$.next("rxjs"), 120);

// End input
setTimeout(() => input$.complete(), 400);

// Cleanup (just to demonstrate teardown)
setTimeout(() => sub.unsubscribe(), 1000);
