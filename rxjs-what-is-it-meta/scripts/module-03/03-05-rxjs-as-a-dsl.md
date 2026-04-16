---
module: 3
lesson: "3.5"
title: RxJS as a DSL for time-varying values
key_insight: RxJS is a Domain-Specific Language for time-varying values — like SQL for sets of rows, Regex for text, CSS for visual style. The operator vocabulary is the grammar of a language, not an arbitrary list of functions.
---

## Hook

SQL does not feel arbitrary because you understand it is a language for talking about sets of rows — SELECT, WHERE, JOIN, and GROUP BY are the grammar of that domain. Once you see RxJS as a language for talking about values that change over time, the operator vocabulary stops feeling like a list to memorise and starts feeling inevitable. Every operator earns its place.

## Insight

Every Domain-Specific Language has a type it operates on and a grammar of constructs for transforming that type. SQL operates on `Set<Row>` — its grammar is SELECT, WHERE, JOIN, and GROUP BY. Regular expressions operate on `String` — the grammar is quantifiers, groups, and anchors. CSS operates on visual style — the grammar is selectors, properties, and cascade rules. RxJS operates on `Observable<T>` — values that arrive over time — and its grammar is four operator families: creation, transformation, combination, and flattening.

What makes the DSL framing useful is that it reduces every possible problem to exactly four scenarios. You either have no Observable yet, one Observable you want to transform, many Observables you want to combine, or a nested Observable you need to flatten. Every operator in RxJS fits exactly one of these slots. Nothing is redundant and nothing is missing — the vocabulary is the complete grammar for the domain.

This is why `debounceTime`, `switchMap`, and `combineLatest` feel related rather than random once you internalise the model. They are not items on a feature list. They are the answer to "how do I express this time-varying relationship?" — the same way WHERE is the answer to "how do I express a row constraint?" in SQL.

## Example

A typeahead autocomplete feature decomposes directly into the four scenarios, with one operator family handling each:

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface SearchResult { id: number; label: string; }

const input = document.querySelector<HTMLInputElement>('#search')!;

// Scenario 1 — no Observable yet: create one from a DOM event
const results$ = fromEvent(input, 'input').pipe(
	// Scenario 2 — one Observable: transform its values and timing
	debounceTime(300),
	map((event: Event): string => (event.target as HTMLInputElement).value),
	// Scenario 4 — nested Observable: flatten with the right concurrency policy
	switchMap((query: string) =>
		ajax.getJSON<SearchResult[]>(`/api/search?q=${query}`),
	),
);

results$.subscribe((results: SearchResult[]) => renderSuggestions(results));
```

Scenario 3 (combining many Observables) is not needed here — but if a second stream carrying auth headers were required, `withLatestFrom` would slot cleanly into the pipe. The four scenarios cover the entire feature space of the language.

## Summary

- RxJS is a DSL for `Observable<T>` — not a utility library but a language with a complete grammar
- Four scenarios cover every case: create (no Observable), transform (one Observable), combine (many Observables), flatten (nested Observable)
- Operators are the grammar; once you see the language, nothing in the vocabulary feels arbitrary
