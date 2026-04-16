---
module: 6
lesson: "6.3"
title: Specialized Subject Variants
exercise: Match three requirements to the correct Subject variant and implement each.
difficulty: intermediate
---

## Scenario

A dashboard has three data requirements that each need a different answer to the same question: what does a late subscriber receive? The loading flag must be known immediately, the debug log must show recent history, and the computation result only matters after the operation completes.

## Starter Code

```typescript
import { Subject, BehaviorSubject, ReplaySubject, AsyncSubject } from 'rxjs';

// Requirement A: A loading flag. New subscribers must immediately know if loading is in progress.
// Which Subject variant? Why?
const loading$: /* ??? */ = /* ??? */;

// Requirement B: A debug event log showing the last 5 events for new subscribers.
// Which Subject variant? Why?
const debugLog$: /* ??? */ = /* ??? */;

// Requirement C: A one-time computation result. Subscribers only care about the final value
// after the async operation completes — not intermediate values.
// Which Subject variant? Why?
const computationResult$: /* ??? */ = /* ??? */;
```

## Task

1. Implement `loading$` with the correct Subject variant and initial value — explain your choice in a comment.
2. Implement `debugLog$` with the correct Subject variant configured to buffer the last 5 values.
3. Implement `computationResult$` with the correct Subject variant and demonstrate how it replays the final value to a subscriber who arrives after the computation finishes.

## Hint

Each Subject variant answers a different question about time. What is the current state? What were the last N events? What was the final outcome?
