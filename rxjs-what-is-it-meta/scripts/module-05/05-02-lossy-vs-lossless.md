---
module: 5
lesson: "5.2"
title: Lossy vs lossless — the fundamental time tradeoff
key_insight: Every time operator makes one binary choice — drop values to control rate (lossy) or group values to keep everything (lossless). Choose wrong and you either lose critical data or overwhelm the system.
---

## Hook

A search box that fires a request on every keystroke is not a UX problem — it is a rate problem. The question is not whether to control the rate. The question is whether you can afford to lose values in doing so. Most developers skip that question entirely, reach for `debounceTime`, and ship a system that silently discards events that were never supposed to be discarded.

## Insight

Every time operator in RxJS falls into one of two families, and the distinction is binary: either you drop values to reduce the emission rate, or you group values without dropping any.

**Lossy operators** intentionally drop values. The dropped values are gone permanently — there is no recovery. Examples: `throttleTime`, `debounceTime`, `auditTime`, `sampleTime`. Use lossy operators when the interaction demands responsiveness (UI scroll, button debounce, resize events), when noise reduction is the goal, when the dropped values carry no unique information that must be processed, and when missing a value is operationally acceptable.

**Lossless operators** group values without dropping any. Every input value ends up in exactly one output group, processed eventually. Examples: `bufferTime`, `bufferCount`, `windowTime`, `concatMap` (queues everything). Use lossless operators when the domain makes data loss unacceptable: audit logs, financial transactions, analytics pipelines, message queues. In these domains, a dropped value is not a missed UI update — it is a missing record.

The decision rule is this: if 1,000 values arrive in one second and you cannot process all 1,000 immediately, ask first — is any of those 1,000 individually critical? If yes, buffer. If no, throttle or debounce. Answer that question before you touch an operator.

## Example

The same `click$` stream handled two ways illustrates the tradeoff directly.

```typescript
import { fromEvent } from 'rxjs';
import { throttleTime, bufferTime } from 'rxjs/operators';

const click$ = fromEvent<MouseEvent>(document, 'click');

// Lossy: rapid clicks are dropped — only the first of each burst is emitted.
// Use for a rate-limited action button where duplicate clicks are noise.
click$.pipe(
	throttleTime(500),
).subscribe((_event: MouseEvent) => {
	submitForm(); // safe: duplicates dropped
});

// Lossless: all clicks are collected into arrays, every click is preserved.
// Use for a click analytics collector where every click is a data point.
click$.pipe(
	bufferTime(500),
).subscribe((events: MouseEvent[]) => {
	sendAnalyticsBatch(events); // safe: nothing dropped
});
```

The streams are identical at the source. The operator choice is a domain decision, not a technical one.

## Summary

- Lossy = drop values to control rate (`throttleTime`, `debounceTime`, `auditTime`, `sampleTime`)
- Lossless = group values to keep everything (`bufferTime`, `bufferCount`, `windowTime`)
- Ask first: can I afford to drop values? UI responsiveness → lossy; audit, analytics, financial → lossless
