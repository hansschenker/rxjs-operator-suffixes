# combineLatest — emit on any, use all latest

```ascii
a$:      --1--------3------5--|
b$:      -----2--4------------|
c$:      ----------6----------|

combineLatest([a$, b$, c$]):

output$: ----------[1,4,6][3,4,6]-----[5,4,6]--|
```
Output does not start until all three sources have emitted at least once. After that, every new emission from any source triggers a new output using the latest value from all sources.

**Read it:** a$ emits 1, then b$ emits 4 (2 was already superseded), but c$ has not emitted yet — no output fires. c$ emits 6: all three have a value; the first output fires using the *latest* from each source: [1,4,6]. One frame later a$ emits 3 → [3,4,6]. Then a$ emits 5 → [5,4,6]. Note that b$=4 is the latest `b` value throughout — b$ emitting 2 was superseded before the first output.

**Use when:** a derived value depends on multiple independently-updating sources — a total price that combines quantity, unit cost, and a discount rate that each update separately.

```typescript
import { combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const quantity$ = new BehaviorSubject<number>(1);
const unitPrice$ = new BehaviorSubject<number>(10);
const discount$ = new BehaviorSubject<number>(0);

const total$ = combineLatest([quantity$, unitPrice$, discount$]).pipe(
	map(([qty, price, disc]: [number, number, number]) =>
		qty * price * (1 - disc),
	),
);
```
