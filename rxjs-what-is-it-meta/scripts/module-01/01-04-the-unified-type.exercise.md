---
module: 1
lesson: "1.4"
title: The Unified Type — why Observable absorbs Arrays, Promises, and Events
exercise: Rewrite four different async sources as Observables using the correct creation operator for each.
difficulty: beginner
---

## Scenario

A codebase uses four different patterns to handle async data. Your task is to unify them all under a single Observable type so they can share the same operator pipeline regardless of where the data comes from.

## Starter Code

```typescript
import { Observable } from 'rxjs';
// Import the correct creation operators below

interface User { id: number; name: string; }
interface Config { theme: string; lang: string; }

// Source 1: A static array of user IDs
const userIds: number[] = [1, 2, 3, 4, 5];
const userIds$: Observable<number> = /* ??? */;

// Source 2: A Promise from a fetch call
const fetchUser = (id: number): Promise<User> =>
	fetch(`/api/users/${id}`).then(r => r.json());
const user1$: Observable<User> = /* ??? */;

// Source 3: A DOM button click event
const button = document.getElementById('submit') as HTMLButtonElement;
const clicks$: Observable<MouseEvent> = /* ??? */;

// Source 4: A single config object available immediately
const config: Config = { theme: 'dark', lang: 'en' };
const config$: Observable<Config> = /* ??? */;
```

## Task

1. Fill in each `???` with the correct RxJS creation operator and the required import.
2. For each source, write one sentence explaining what the Observable provides that the original type could not (cancellation, composition, operators, etc.).
3. Write a single `pipe()` chain on `clicks$` that, on each click, switches to `user1$` and logs the result with `tap` — demonstrating that all four sources now speak the same language.

## Hint

The unified type absorbs all sources by treating each as a push sequence. The creation operators (`of`, `from`, `fromEvent`) are the entry points — the same operators work identically on all of them downstream.
