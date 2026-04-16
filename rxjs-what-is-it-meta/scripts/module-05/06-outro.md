---
module: 5
type: outro
title: Module 5 Recap — Layer 2: Time
---

## What You Learned

- An Observable is a sequence of `(time, value)` pairs — time is always a dimension, even when ignored
- Every time operator makes one binary choice: drop values (lossy) or group values (lossless)
- `throttle` gives immediate response then blocks; `debounce` waits for silence then emits — confusing them ships visibly broken UIs
- `buffer` and `window` collect all values into arrays or inner Observables — lossless alternatives when every value matters
- The two-question decision framework: can data be lost? do I need leading, trailing, or periodic behavior?

## Bridge to Module 6

Layers 1 and 2 operate on a single stream. Layer 3 — Sharing — asks: what happens when multiple consumers need the same stream? One producer or many? Module 6 answers this with the unicast/multicast model.
