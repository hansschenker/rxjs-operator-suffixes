---
module: 5
lesson: "5.3"
title: Throttle and debounce
exercise: Apply the correct rate-limiting operator to an autocomplete input and a Save Draft button — and explain why they need different operators.
difficulty: beginner
---

## Scenario

Two UI elements both need rate limiting, but for opposite reasons. The autocomplete input should fire a search request once the user has finished typing — it must wait for a pause. The Save Draft button must save immediately on the first click to reassure the user, then ignore rapid double-clicks — it must not wait. Applying the wrong operator to either element creates a broken UX.

## Starter Code

```typescript
import { fromEvent } from 'rxjs';
import { map, debounceTime, throttleTime, switchMap, tap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface SearchResult { id: number; title: string; }
interface DraftPayload { content: string; savedAt: number; }

const searchInput = document.getElementById('search') as HTMLInputElement;
const saveButton  = document.getElementById('save')  as HTMLButtonElement;
const editor      = document.getElementById('editor') as HTMLTextAreaElement;

// Stream 1: user typing in search box
const inputChange$ = fromEvent<Event>(searchInput, 'input').pipe(
	map((e: Event) => (e.target as HTMLInputElement).value),
);

// Stream 2: user clicking Save Draft
const saveClick$ = fromEvent<MouseEvent>(saveButton, 'click');

// EXERCISE: apply the correct rate-limiting operator to each stream

const searchResults$ = inputChange$.pipe(
	/* ??? — apply the operator that waits for a pause */
	switchMap((query: string) => ajax.getJSON<SearchResult[]>(`/api/search?q=${query}`)),
);

const savedDraft$ = saveClick$.pipe(
	/* ??? — apply the operator that fires immediately and ignores rapid follow-ups */
	switchMap(() => ajax.post<DraftPayload>('/api/draft', {
		content: editor.value,
		savedAt: Date.now(),
	})),
	tap(() => console.log('Draft saved')),
);

searchResults$.subscribe((results: SearchResult[]) => console.log('Results:', results));
savedDraft$.subscribe(() => {});
```

## Task

1. Fill in the rate-limiting operator for `searchResults$`. Use a 300ms window. Explain in one sentence why `throttleTime` would produce a poor UX for autocomplete.
2. Fill in the rate-limiting operator for `savedDraft$` with `{ leading: true, trailing: false }` and a 2000ms window. Explain in one sentence why `debounceTime` would be wrong for the save button.
3. Describe what happens if the user types rapidly for 5 seconds in the search box with `debounceTime(300)`: how many HTTP requests fire? When does the first one fire?

## Hint

`debounceTime` waits for silence before emitting — ideal when you want the final value after a burst. `throttleTime` with `{ leading: true, trailing: false }` emits the first value immediately and blocks the rest — ideal when you want instant feedback with protection against accidental double-actions. They are mirror-image strategies.
