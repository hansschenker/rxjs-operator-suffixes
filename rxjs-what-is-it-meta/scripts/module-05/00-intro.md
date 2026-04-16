---
module: 5
type: intro
title: Module 5 — Layer 2: Time
---

## What You Already Know

From Module 4: the three value primitives, scan for state, monad laws, T-only operator classification.

## What This Module Covers

- **5.1** Observables as (time, value) pairs — the temporal dimension is always present
- **5.2** Lossy vs lossless — the binary choice behind every time operator
- **5.3** The throttle and debounce families — leading/trailing/silence-based rate limiting
- **5.4** The buffer and window families — collecting values without losing them
- **5.5** Choosing the right rate-limiting operator — the two-question decision framework

## Why It Matters

Time is what makes streams fundamentally different from arrays. Layer 2 operators exist because the *when* of a value is as important as the *what*. Get the temporal operator wrong and you ship a broken interaction — the button that never fires, the search that feels frozen.
