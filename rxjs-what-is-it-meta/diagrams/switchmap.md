# switchMap — cancel on new

```ascii
outer$:     --a---------b----c---------|
             switchMap(x => inner$(x))

inner$(a):  ----A1--A2--A3
inner$(b):              ----B1--B2--B3
inner$(c):                   ----C1--C2--|

output$:    ----A1--A2--X----B1--X----C1--C2--|
```
X = cancelled (inner unsubscribed when next outer arrives)

**Read it:** When `b` arrives, `inner$(a)` is unsubscribed — A3 never emits. When `c` arrives, `inner$(b)` is unsubscribed — B2, B3 never emit. Only the inner Observable started by the most recent outer value runs to completion.

**Use when:** the latest outer value makes previous inner results irrelevant — typeahead search, live profile loading, navigation route changes.

```typescript
import { fromEvent } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface SearchResult { id: number; title: string; }

const search$ = fromEvent<Event>(document.getElementById('q')!, 'input').pipe(
	map(e => (e.target as HTMLInputElement).value),
	debounceTime(300),
	distinctUntilChanged(),
	switchMap((query: string) => ajax.getJSON<SearchResult[]>(`/api/search?q=${query}`)),
);
```
