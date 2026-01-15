/**
 * Example 02 — share() turns a unicast source into a refCounted multicast stream.
 *
 * Observe:
 * - two subscribers attach
 * - source subscribe runs once
 * - when last subscriber unsubscribes, upstream teardown runs
 * - after complete/error, future subscribers start a fresh upstream execution (reset-on-terminal)
 */

import { Observable } from "../src";
import { share, trace } from "../src/operators";

let upstreamSubscriptions = 0;

const source$ = new Observable<number>((sub) => {
  upstreamSubscriptions++;
  console.log("UPSTREAM subscribe", { upstreamSubscriptions });

  sub.next(1);
  sub.next(2);
  sub.complete();

  return () => console.log("UPSTREAM teardown");
});

const shared$ = source$.pipe(
  share(),
  trace("shared"),
);

shared$.subscribe((v) => console.log("A:", v));
shared$.subscribe((v) => console.log("B:", v));

// Because share resets on terminal once refCount is 0, this starts a new upstream execution:
shared$.subscribe((v) => console.log("C:", v));
