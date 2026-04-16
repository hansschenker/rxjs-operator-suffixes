---
module: 5
lesson: "5.5"
title: Choosing the right rate-limiting operator
key_insight: The rate-limiting decision reduces to two questions — can data be lost, and do I need leading, trailing, or periodic behavior? Answer both and the operator selects itself.
---

## Hook

RxJS has nine rate-limiting operators. Memorizing nine API signatures is unnecessary and does not help at the point of decision — when you are staring at a stream and need to know which operator belongs here. Two questions reduces nine choices to one answer every time, and you can apply them in under ten seconds.

## Insight

**Question 1: Can data be lost?**

If the answer is no — every value must be processed, losing one is a bug — the decision is already made. Use the lossless family: `bufferTime`, `bufferCount`, or `windowTime`. Stop here.

If the answer is yes, proceed to question 2.

**Question 2: When should the emission happen relative to the burst?**

- Immediately at the start of a burst → **`throttleTime`** — leading edge, instant feedback
- After silence ends — the burst is over → **`debounceTime`** — trailing edge, "user has finished"
- At fixed intervals regardless of input activity → **`auditTime`** — periodic sampling on a clock
- On an explicit external signal → **`sample(signal$)`** — emission triggered by another Observable

The meta-rule for question 1 is concrete: ask "if 1,000 values arrive in 1 millisecond, what should happen?" Buffer all 1,000 → lossless. Emit the first → `throttleTime`. Emit the last → `debounceTime`. Emit one per fixed clock tick → `auditTime`. The answer to that single question identifies the family before you pick the exact operator.

Additional variants extend each operator with dynamic window durations: `throttle(fn)` and `debounce(fn)` accept a factory returning an Observable, enabling adaptive rate limiting driven by another stream — a network quality signal, a user preference, a server-side configuration value.

## Example

Four real scenarios walked through the decision framework:

**1. Search typeahead**
Can data be lost? Yes — mid-word queries are noise.
When? After silence ends — we want the completed word.
→ `debounceTime(300)`

**2. Scroll event handler**
Can data be lost? Yes — we only need the current position.
When? Immediately — the user must feel instant response.
→ `throttleTime(16)` (one frame at 60 fps)

**3. Analytics click collector**
Can data be lost? No — every click is a data point in the funnel.
→ `bufferTime(10_000)` with a batch POST to the analytics endpoint

**4. IoT sensor heartbeat**
Can data be lost? Yes — we want a periodic sample, not every reading.
When? Fixed interval — one reading per second regardless of sensor frequency.
→ `auditTime(1000)`

```typescript
import { debounceTime, throttleTime, bufferTime, auditTime } from 'rxjs/operators';

// 1. Search typeahead — wait for silence
searchInput$.pipe(debounceTime(300));

// 2. Scroll handler — respond immediately, then cool down
scroll$.pipe(throttleTime(16));

// 3. Analytics — collect everything, batch POST
click$.pipe(bufferTime(10_000));

// 4. IoT sensor — one sample per second from a high-frequency source
sensor$.pipe(auditTime(1000));
```

Each line is the output of the two-question framework applied mechanically.

## Summary

- Two questions: can data be lost? when should it emit? — answer both and the operator selects itself
- Meta-rule: "if 1,000 values arrive in 1ms, what should happen?" — the answer names the family
- Lossless (`buffer`/`window`) when every value matters; lossy (`throttle`/`debounce`/`audit`) when rate matters more than completeness
