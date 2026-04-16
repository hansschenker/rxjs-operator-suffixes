---
module: 7
lesson: "7.4"
title: switchMap
exercise: Identify why switchMap is wrong for a save operation, then fix it with the correct flattening operator.
difficulty: intermediate
---

## Scenario

A document editor has an auto-save feature triggered by keystrokes debounced at 500ms. It uses `switchMap` to cancel the previous save and start a new one. Testers discovered that rapid typing results in documents never being saved — every debounced keystroke cancels the previous save before it can complete.

## Starter Code

```typescript
import { fromEvent } from 'rxjs';
import { switchMap, debounceTime, map } from 'rxjs/operators'; // BUG: switchMap wrong here
import { ajax } from 'rxjs/ajax';

interface SaveResult { savedAt: string; version: number; }

const editor = document.getElementById('editor') as HTMLTextAreaElement;

const keystrokes$ = fromEvent<Event>(editor, 'input').pipe(
	map((e: Event) => (e.target as HTMLTextAreaElement).value),
	debounceTime(500),
);

// BUG: switchMap cancels in-flight saves when new keystroke arrives
const autoSave$ = keystrokes$.pipe(
	switchMap((content: string) =>
		ajax.post<SaveResult>('/api/save', { content }),
	),
);

autoSave$.subscribe((result: SaveResult) =>
	console.log('Saved at:', result.savedAt),
);
```

## Task

1. Explain in one sentence exactly what `switchMap` does when a new debounced keystroke arrives while a save is in-flight.
2. Fix the pipeline with the operator that queues saves in order without cancelling any in-flight request.
3. Explain when `exhaustMap` would be a better fix than your chosen operator and when it would be worse.

## Hint

Does every save result need to be delivered? If yes, `switchMap` (cancel-on-new) is the wrong choice. The correct operator depends on whether saves must be ordered or just all complete.
