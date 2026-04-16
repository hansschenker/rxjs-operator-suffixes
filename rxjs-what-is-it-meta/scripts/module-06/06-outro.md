---
module: 6
type: outro
title: Module 6 Recap — Layer 3: Sharing
---

## What You Learned

- Hot vs cold is about the producer; unicast vs multicast is about the consumer — they are independent axes
- Subject is simultaneously Observer and Observable — a writable stream, not a read-only one
- BehaviorSubject replays the current value; ReplaySubject replays a history; AsyncSubject replays only the final value
- `shareReplay(1)` without `refCount: true` keeps the source alive after all subscribers unsubscribe — a leak, not a feature
- `connectable()` gives you explicit control over when the source starts — essential when all subscribers must connect before any data flows

## Bridge to Module 7

Layer 3 shares one producer's output across multiple consumers. Layer 4 — Flattening — handles a different problem: when each emission from the outer Observable *is* a new inner Observable. Module 7 shows you the four ways to flatten them.
