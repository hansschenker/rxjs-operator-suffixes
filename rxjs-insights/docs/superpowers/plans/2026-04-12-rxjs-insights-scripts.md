# RxJS Insights — Narration Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write 72 narration scripts (24 insights × Concept / Deep Dive / Code Sample) for a Udemy video course rooted in `rxjs-insights.md`.

**Architecture:** Insight-grouped folder structure under `scripts/`. Each script is a self-contained markdown file: frontmatter (title, section, insight, lesson type, duration) followed by spoken-prose narration. Code-sample scripts embed a TypeScript snippet inside the narration body. No bullet lists or headings inside the narration body — prose only.

**Tech Stack:** Markdown, TypeScript 5.x / RxJS 7.8.x (code snippets only — no build step needed for the scripts themselves).

---

## Script file format

Every file follows this exact template:

```markdown
# [Lesson Title]

**Section:** [Section name]
**Insight:** [Insight name]
**Lesson type:** Concept | Deep Dive | Code Sample
**Estimated duration:** X min

---

[Narration — plain spoken prose, contractions welcome, no bullet lists, no headings]
```

For Code Sample files the TypeScript snippet is embedded inline inside the narration, introduced naturally in the prose (e.g. "Here's the snippet we'll walk through together:") and followed by a line-by-line narrated explanation.

Prose length targets (at ~120 words/min):
- Concept: 250–360 words (2–3 min)
- Deep Dive: 480–720 words (4–6 min)
- Code Sample: 360–600 words (3–5 min)

---

## Task 1: Create folder scaffold

**Files:**
- Create: `scripts/TEMPLATE.md`
- Create: `scripts/section-01-origins/01-haskell-linq-rxnet/concept.md` (and all 71 sibling files)

- [ ] **Step 1: Create TEMPLATE.md**

```markdown
# [Lesson Title]

**Section:** [Section name]
**Insight:** [Insight name]
**Lesson type:** Concept | Deep Dive | Code Sample
**Estimated duration:** X min

---

[Narration here — spoken prose only]
```

Save to `scripts/TEMPLATE.md`.

- [ ] **Step 2: Create all 24 insight folders with stub files**

Run these commands (creates all dirs and empty files):

```bash
cd scripts

for dir in \
  section-01-origins/01-haskell-linq-rxnet \
  section-01-origins/02-linq-as-language-integrated-monad \
  section-01-origins/03-unified-programming-model \
  section-01-origins/04-rxnet-ui-events-first-class \
  section-02-core-duality/05-mathematical-dual \
  section-02-core-duality/06-erik-meijer-synthesis \
  section-02-core-duality/07-producer-consumer-separation \
  section-03-data-model/08-observable-formal-definition \
  section-03-data-model/09-operator-families-t-a-both \
  section-03-data-model/10-three-observable-variants \
  section-04-subscriptions-lifecycle/11-subscription-as-lifecycle \
  section-04-subscriptions-lifecycle/12-subscription-tree \
  section-04-subscriptions-lifecycle/13-three-step-workflow \
  section-05-composition-concurrency/14-rxjs-three-things \
  section-05-composition-concurrency/15-schedulers \
  section-05-composition-concurrency/16-four-basic-scenarios \
  section-05-composition-concurrency/17-dsl-time-varying-values \
  section-06-design-patterns/18-domain-invariant-operators \
  section-06-design-patterns/19-subject-as-proxy \
  section-06-design-patterns/20-unicast-vs-multicast \
  section-06-design-patterns/21-functional-data-logic-separation \
  section-06-design-patterns/22-pipeline-dependency-graph \
  section-06-design-patterns/23-custom-naming-pattern \
  section-06-design-patterns/24-custom-operators
do
  mkdir -p "$dir"
  touch "$dir/concept.md" "$dir/deep-dive.md" "$dir/code-sample.md"
done
```

- [ ] **Step 3: Commit scaffold**

```bash
git add scripts/
git commit -m "chore: scaffold 72 script stubs across 24 insight folders"
```

---

## Task 2: Section 1 — Origins (insights 01–04)

**Files:**
- Write: `scripts/section-01-origins/01-haskell-linq-rxnet/concept.md`
- Write: `scripts/section-01-origins/01-haskell-linq-rxnet/deep-dive.md`
- Write: `scripts/section-01-origins/01-haskell-linq-rxnet/code-sample.md`
- Write: `scripts/section-01-origins/02-linq-as-language-integrated-monad/concept.md`
- Write: `scripts/section-01-origins/02-linq-as-language-integrated-monad/deep-dive.md`
- Write: `scripts/section-01-origins/02-linq-as-language-integrated-monad/code-sample.md`
- Write: `scripts/section-01-origins/03-unified-programming-model/concept.md`
- Write: `scripts/section-01-origins/03-unified-programming-model/deep-dive.md`
- Write: `scripts/section-01-origins/03-unified-programming-model/code-sample.md`
- Write: `scripts/section-01-origins/04-rxnet-ui-events-first-class/concept.md`
- Write: `scripts/section-01-origins/04-rxnet-ui-events-first-class/deep-dive.md`
- Write: `scripts/section-01-origins/04-rxnet-ui-events-first-class/code-sample.md`

---

### Insight 01 — Haskell → LINQ → Rx.NET → RxJS

- [ ] **Step 1: Write concept.md**

Frontmatter: title "From Haskell to RxJS — The Lineage", section "Origins", insight "Haskell → LINQ → Rx.NET → RxJS", type "Concept", duration "2 min".

Narration covers: RxJS did not emerge from nowhere — trace the chain: Haskell list comprehensions (lazy sequences, functional composition) → C# LINQ (query operators embedded in a language) → Rx.NET (applying LINQ to push-based event streams) → RxJS (the JavaScript port). Each step inherited the core idea: a unified query model over sequences. Close by framing RxJS as the living descendant of 30 years of functional sequence theory.

- [ ] **Step 2: Write deep-dive.md**

Frontmatter: title "From Haskell to RxJS — Deep Dive", same section/insight, type "Deep Dive", duration "5 min".

Narration covers: (1) Haskell's list comprehensions as the origin of `map`/`filter`/`flatMap` semantics, evaluated lazily. (2) How Erik Meijer brought these ideas to Microsoft Research and into C#. (3) LINQ as a language feature — `from x in xs where ... select ...` compiling to `Where`/`Select` operator chains. (4) The conceptual leap Rx.NET made: what if the sequence is pushed rather than pulled? Same operators, inverted direction. (5) The JavaScript port by Ben Lesh and the RxJS team — adapting Rx.NET for a single-threaded, async, browser environment. (6) Why this lineage matters: every RxJS operator you use has a mathematical pedigree traced to Haskell.

- [ ] **Step 3: Write code-sample.md**

Frontmatter: title "From Haskell to RxJS — Code Sample", same section/insight, type "Code Sample", duration "4 min".

Narration introduces the snippet, then walks through it line by line:

```typescript
import { from } from 'rxjs';
import { filter, map } from 'rxjs/operators';

// LINQ (C# pseudocode):
// from x in numbers where x > 2 select x * 2

// The same query in RxJS
const numbers$ = from([1, 2, 3, 4, 5]);

numbers$.pipe(
  filter(x => x > 2),
  map(x => x * 2)
).subscribe(console.log);
// Output: 6, 8, 10
```

Narration angle: `filter` is LINQ's `Where`, `map` is LINQ's `Select`. The pipe chain is the operator composition that LINQ expressed with query syntax. The source could be a DOM event instead of an array — and the operators wouldn't change. That's the unified model.

---

### Insight 02 — LINQ as Language-Integrated Monad

- [ ] **Step 4: Write concept.md**

Frontmatter: title "LINQ Is a Language-Integrated Monad", section "Origins", insight "LINQ as Language-Integrated Monad", type "Concept", duration "2 min".

Narration covers: The word "monad" sounds intimidating, but the idea is simple — a monad is a container with a `flatMap` (bind) operation that lets you chain transformations without leaving the container. LINQ is a monad baked into C#. RxJS inherits this: Observable is the container, `mergeMap`/`switchMap`/`concatMap` are the bind. Every time you flatten a higher-order Observable, you're using the monad pattern.

- [ ] **Step 5: Write deep-dive.md**

Frontmatter: title "LINQ Is a Language-Integrated Monad — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) The three monad laws (unit/return, bind/flatMap, associativity) in plain terms — no category theory required. (2) How `Array` in JS is already a monad: `[1,2,3].flatMap(x => [x, x*10])`. (3) How `Promise` is a monad: `.then()` is bind. (4) Observable as monad: `mergeMap` is bind — it takes an `Observable<T>` and a function `T → Observable<R>` and returns `Observable<R>`. (5) Why it matters: monad composition is why RxJS pipelines stay flat no matter how deeply you nest async operations. (6) LINQ's achievement was making the monad a first-class language feature with query syntax sugar.

- [ ] **Step 6: Write code-sample.md**

Frontmatter: title "LINQ Is a Language-Integrated Monad — Code Sample", type "Code Sample", duration "3 min".

```typescript
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

// Array monad: flatMap keeps us in the array "container"
const arrayResult = [1, 2, 3].flatMap(x => [x, x * 10]);
console.log(arrayResult); // [1, 10, 2, 20, 3, 30]

// Observable monad: mergeMap keeps us in the Observable "container"
of(1, 2, 3).pipe(
  mergeMap(x => of(x, x * 10))
).subscribe(console.log);
// Output: 1, 10, 2, 20, 3, 30
```

Narration angle: `mergeMap` is `flatMap` for Observables. In both cases the pattern is identical — take a value, produce a new container, flatten it back. That's the monad bind. The types differ; the shape stays the same.

---

### Insight 03 — Unified Programming Model

- [ ] **Step 7: Write concept.md**

Frontmatter: title "One Model for Every Data Source", section "Origins", insight "Unified Programming Model", type "Concept", duration "2 min".

Narration covers: LINQ's greatest contribution wasn't any individual operator — it was the insight that all queryable sequences can be treated the same way. RxJS inherits this: whether your source is a mouse click, a WebSocket message, an HTTP response, or a timer, it's an Observable. The same `map`, `filter`, and `switchMap` apply. Your operators don't care where data comes from.

- [ ] **Step 8: Write deep-dive.md**

Frontmatter: title "One Model for Every Data Source — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) Before LINQ: different APIs for SQL (`SqlCommand`), XML (`XDocument`), objects (loops) — each required different mental models. (2) LINQ collapsed this into one query model. (3) RxJS does the same across async: `fromEvent`, `from(promise)`, `ajax()`, `webSocket()`, `interval()` — all return `Observable`. (4) The consequence for teams: operators can be written once, tested once, and applied anywhere. (5) The consequence for architecture: swap the source (e.g., WebSocket → polling) without touching operator logic. (6) This is what "reactive" means in a library sense — not just async, but source-agnostic.

- [ ] **Step 9: Write code-sample.md**

Frontmatter: title "One Model for Every Data Source — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { fromEvent, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

// Source 1: DOM events
const clicks$ = fromEvent<MouseEvent>(document, 'click').pipe(
  map(e => `Click at ${e.clientX},${e.clientY}`)
);

// Source 2: A timer
const ticks$ = interval(1000).pipe(
  map(n => `Tick ${n}`)
);

// Same operators — different sources
clicks$.pipe(take(3)).subscribe(console.log);
ticks$.pipe(take(3)).subscribe(console.log);
```

Narration angle: `map` and `take` don't know they're operating on a click stream or a timer. They work on values. The source is irrelevant — that's the unified model in action.

---

### Insight 04 — Rx.NET Made UI Events First-Class

- [ ] **Step 10: Write concept.md**

Frontmatter: title "UI Events as First-Class Citizens", section "Origins", insight "Rx.NET made UI events first-class", type "Concept", duration "2 min".

Narration covers: Before Rx.NET, handling UI events meant callbacks — imperative, non-composable, hard to coordinate. Rx.NET treated UI events as sequences of values, equal in status to database queries or HTTP responses. You could compose them, transform them, and combine them with the same operators. RxJS brings this to the browser: a click event is not special — it's just an Observable you can `filter`, `debounce`, or `merge` with anything else.

- [ ] **Step 11: Write deep-dive.md**

Frontmatter: title "UI Events as First-Class Citizens — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) The callback problem — coordinating two async event sources imperatively requires shared state and brittle sequencing. (2) How Rx.NET's `Observable.FromEvent` elevated DOM/UI events to the same type as everything else. (3) The composability win: `merge`, `combineLatest`, `withLatestFrom` — operators that work on any two Observables, including events. (4) Concurrency scenarios that are trivial with Rx but painful with callbacks: drag-and-drop (mousedown + mousemove + mouseup), autocomplete (keyup + debounce + switchMap), long-press detection. (5) RxJS `fromEvent` as the direct descendant.

- [ ] **Step 12: Write code-sample.md**

Frontmatter: title "UI Events as First-Class Citizens — Code Sample", type "Code Sample", duration "3 min".

```typescript
import { fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

const mouseDown$ = fromEvent<MouseEvent>(document, 'mousedown').pipe(
  map(() => 'pressed')
);
const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup').pipe(
  map(() => 'released')
);

// Two event sources composed into one stream — no shared state, no callbacks
merge(mouseDown$, mouseUp$).subscribe(console.log);
```

Narration angle: Two separate DOM events become one composable Observable stream with `merge`. No mutable `isDown` flag, no coordinating callbacks. This is what first-class means — events are values you can compose like any other data.

- [ ] **Step 13: Commit Section 1**

```bash
git add scripts/section-01-origins/
git commit -m "feat: write 12 narration scripts for section 01 — Origins"
```

---

## Task 3: Section 2 — The Core Duality (insights 05–07)

**Files:**
- Write: `scripts/section-02-core-duality/05-mathematical-dual/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-02-core-duality/06-erik-meijer-synthesis/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-02-core-duality/07-producer-consumer-separation/{concept,deep-dive,code-sample}.md`

---

### Insight 05 — Mathematical Dual: Iterable ↔ Observable

- [ ] **Step 1: Write concept.md**

Frontmatter: title "The Mathematical Dual of Iteration", section "The Core Duality", insight "Mathematical dual: Iterable ↔ Observable", type "Concept", duration "2 min".

Narration covers: Every concept in programming has a dual — a mirror image with arrows reversed. The `Iterable/Iterator` pattern is pull-based: you ask for the next value. Its mathematical dual is the `Observable/Observer` pattern: the producer pushes values to you. Same structure, opposite direction. This duality is not metaphor — it's formal category theory, and Erik Meijer proved it.

- [ ] **Step 2: Write deep-dive.md**

Frontmatter: title "The Mathematical Dual of Iteration — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) The `Iterable<T>` interface: `Symbol.iterator` returns an `Iterator<T>` with `next(): {value: T, done: boolean}` — consumer drives. (2) The `Observable<T>` interface: `subscribe(observer)` — producer drives, calls `observer.next(value)`. (3) Duality in category theory: flip all the arrows. Pull becomes push. Consumer control becomes producer control. (4) Why this matters: the duality guarantees that every operator that makes sense for iterables has a corresponding operator for Observables. `map`, `filter`, `reduce`, `flatMap` — all have exact duals. (5) The practical consequence: if you know LINQ or array methods, you already know most of RxJS's operator surface — the knowledge transfers by duality.

- [ ] **Step 3: Write code-sample.md**

Frontmatter: title "The Mathematical Dual of Iteration — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { Observable } from 'rxjs';

// Pull: Iterator — you request each value
function* counter() {
  let n = 0;
  while (true) yield n++;
}
const iter = counter();
console.log(iter.next().value); // 0 — you pulled
console.log(iter.next().value); // 1 — you pulled again

// Push: Observable — values arrive when the producer decides
const counter$ = new Observable<number>(observer => {
  let n = 0;
  const id = setInterval(() => observer.next(n++), 1000);
  return () => clearInterval(id); // teardown
});

const sub = counter$.subscribe(n => console.log(n)); // values pushed to you
setTimeout(() => sub.unsubscribe(), 3500);
```

Narration angle: Same sequence of integers — entirely different control flow. With the iterator you decide when to pull. With the Observable the producer decides when to push. One is `iter.next()` driving the loop; the other is `observer.next()` driving your callback. Arrows reversed.

---

### Insight 06 — Erik Meijer's Synthesis

- [ ] **Step 4: Write concept.md**

Frontmatter: title "Erik Meijer's Synthesis", section "The Core Duality", insight "Erik Meijer's synthesis", type "Concept", duration "2 min".

Narration covers: Erik Meijer didn't invent the Observer pattern or the Iterator pattern — both existed for decades. What he did was recognise they were duals of each other and combine them into a single abstraction: the Observable. Specifically, he added the `error` and `complete` notifications to the Observer, giving it the same expressiveness as an Iterator's `done` and thrown exceptions. Observable is Iterator + Observer, with all four channels: next, error, complete, unsubscribe.

- [ ] **Step 5: Write deep-dive.md**

Frontmatter: title "Erik Meijer's Synthesis — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) The classic Gang of Four Observer pattern — `Subject`/`Observer`, only `update(value)`. No error channel, no completion signal. (2) The classic Iterator — `next()`, `return()`, `throw()` — three channels. (3) Meijer's insight: the Observer needs to match the Iterator's expressiveness. Add `error(err)` and `complete()` to Observer. Now it's a symmetric dual. (4) The `Subject` in RxJS as the object that implements both: it IS an Observer (you can call `next`/`error`/`complete` on it) and it IS an Observable (you can subscribe to it). (5) The significance of `complete`: a stream that can end is more useful than one that runs forever — it enables `toArray()`, `reduce()`, `take()` and clean resource management.

- [ ] **Step 6: Write code-sample.md**

Frontmatter: title "Erik Meijer's Synthesis — Code Sample", type "Code Sample", duration "3 min".

```typescript
import { Subject } from 'rxjs';

// Subject implements BOTH Observer and Observable
const subject$ = new Subject<number>();

// As Observable — subscribe to it
subject$.subscribe({
  next: v  => console.log('Value:', v),
  error: e  => console.error('Error:', e),
  complete: () => console.log('Done')
});

// As Observer — push into it (Iterator-style control)
subject$.next(1);
subject$.next(2);
subject$.error(new Error('something went wrong'));
// After error, complete is not called — mirrors Iterator throw()
```

Narration angle: The three calls on the Observer — `next`, `error`, `complete` — are the exact mirror of an Iterator's three channels. Subject makes the synthesis concrete: one object, both roles.

---

### Insight 07 — Producer/Consumer Separation

- [ ] **Step 7: Write concept.md**

Frontmatter: title "Producer and Consumer Are Separate", section "The Core Duality", insight "Producer/Consumer separation", type "Concept", duration "2 min".

Narration covers: In synchronous code, the caller and the producer of values are tightly coupled — you call a function, it returns. With Observables they're decoupled in time: the producer (the Observable's subscribe function) runs independently and pushes values whenever it's ready. The consumer (your observer) just reacts. This separation is what makes async composition possible without callbacks nesting into each other.

- [ ] **Step 8: Write deep-dive.md**

Frontmatter: title "Producer and Consumer Are Separate — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) What "cold" means: the producer function doesn't run until someone subscribes. Each subscription starts a fresh, independent execution. (2) What this means in practice: two subscribers to the same Observable see independent data — like calling a function twice. (3) The alternative — "hot" Observables (Subjects, `share()`) — where the producer runs once and all subscribers share the output. (4) The separation as a design principle: Observable defines *what* to produce; subscription triggers *when* to produce it; the observer defines *what to do* with it. These three concerns never bleed into each other. (5) Why this prevents callback hell: no shared mutable state between producer and consumer — they communicate only through the three channels (next/error/complete).

- [ ] **Step 9: Write code-sample.md**

Frontmatter: title "Producer and Consumer Are Separate — Code Sample", type "Code Sample", duration "3 min".

```typescript
import { Observable } from 'rxjs';

// The producer: defined once, runs independently per subscription
const random$ = new Observable<number>(observer => {
  console.log('Producer started');
  observer.next(Math.random());
  observer.complete();
});

// Consumer 1
random$.subscribe(v => console.log('Consumer A:', v));

// Consumer 2 — independent execution, different random number
random$.subscribe(v => console.log('Consumer B:', v));

// Output:
// Producer started
// Consumer A: 0.4716...
// Producer started
// Consumer B: 0.8823...
```

Narration angle: "Producer started" prints twice — proof that each subscriber triggers a fresh, independent execution. Consumer A and Consumer B never share data. The producer doesn't know about consumers; the consumer doesn't know about other consumers. Full separation.

- [ ] **Step 10: Commit Section 2**

```bash
git add scripts/section-02-core-duality/
git commit -m "feat: write 9 narration scripts for section 02 — Core Duality"
```

---

## Task 4: Section 3 — The Data Model (insights 08–10)

**Files:**
- Write: `scripts/section-03-data-model/08-observable-formal-definition/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-03-data-model/09-operator-families-t-a-both/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-03-data-model/10-three-observable-variants/{concept,deep-dive,code-sample}.md`

---

### Insight 08 — Observable Formal Definition `[{T, a}…]`

- [ ] **Step 1: Write concept.md**

Frontmatter: title "What an Observable Actually Is", section "The Data Model", insight "Observable formal definition [{T,a}…]", type "Concept", duration "2 min".

Narration covers: An Observable is, formally, a lazy potentially infinite sequence of pairs — each pair is a point in time `T` and a value `a`. Written as `[{T, a}…]`. The ellipsis means it may never end. "Lazy" means the sequence doesn't exist until you subscribe. This definition is more precise than "a stream" — it tells you there are two dimensions: the timing of emissions and the values themselves. Operators can work on either dimension, or both.

- [ ] **Step 2: Write deep-dive.md**

Frontmatter: title "What an Observable Actually Is — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) The role of `T` — absolute or relative timestamps, controlled by the Scheduler. (2) The role of `a` — the emitted value, which can be anything: number, string, object, even another Observable. (3) "Lazy" unpacked: the subscribe function is a factory — it creates a new execution context each time. Nothing runs until subscription. (4) "Potentially infinite" — Observables don't have to complete. `interval()` never completes. `fromEvent()` never completes. Operators like `take` add an artificial completion boundary. (5) Consequences: because `T` is explicit, RxJS can delay, throttle, debounce, audit, and window emissions — all because time is a first-class dimension of the data model.

- [ ] **Step 3: Write code-sample.md**

Frontmatter: title "What an Observable Actually Is — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { interval } from 'rxjs';
import { timestamp, take } from 'rxjs/operators';

// timestamp() makes the {T, a} pair explicit
interval(1000).pipe(
  timestamp(),
  take(3)
).subscribe(({ timestamp: t, value }) => {
  console.log(`T=${t}ms  V=${value}`);
});

// Output (approximate):
// T=1704067201000ms  V=0
// T=1704067202001ms  V=1
// T=1704067203002ms  V=2
```

Narration angle: Without `timestamp()`, you only see the `a` dimension. With it, both dimensions are visible — a concrete instance of the formal `{T, a}` pair. The gap between timestamps is the `T` axis; the incrementing integer is the `a` axis.

---

### Insight 09 — Operator Families: T / a / Both

- [ ] **Step 4: Write concept.md**

Frontmatter: title "Operators That Work on Time, Value, or Both", section "The Data Model", insight "Operator families: T / a / both", type "Concept", duration "2 min".

Narration covers: Given the `{T, a}` model, RxJS operators fall into three families. Some operate only on `a` — the value — and don't touch timing: `map`, `filter`, `reduce`. Some operate only on `T` — the timing — and pass values through unchanged: `delay`, `throttleTime`. Some operate on both dimensions together: `debounceTime` collapses rapid `a` values based on `T` gaps; `auditTime` samples `a` at a `T` boundary. Knowing which family an operator belongs to tells you exactly what it can and cannot change.

- [ ] **Step 5: Write deep-dive.md**

Frontmatter: title "Operators That Work on Time, Value, or Both — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) Value operators (`a`): purely functional — they transform values without caring about when emissions arrive. Safe to use with `TestScheduler` marble tests because time is irrelevant. (2) Time operators (`T`): they reschedule emissions but don't transform values. `delay(500)` shifts every `T` forward by 500ms; `a` is untouched. (3) Time+value operators: they make decisions based on the *relationship* between consecutive `{T, a}` pairs. `debounceTime` suppresses `a` unless `T` gap exceeds threshold. `sampleTime` picks the latest `a` at regular `T` intervals. (4) Why the taxonomy helps: when debugging a pipeline, knowing whether an operator touches `T`, `a`, or both tells you exactly which dimension to inspect. (5) Testing implication: T-operators require `TestScheduler` with virtual time; a-operators can be tested synchronously.

- [ ] **Step 6: Write code-sample.md**

Frontmatter: title "Operators That Work on Time, Value, or Both — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { of, interval } from 'rxjs';
import { map, delay, auditTime, take } from 'rxjs/operators';

// Operates on 'a' only — timing unchanged
of(1, 2, 3).pipe(
  map(x => x * 2)          // a: 1→2, 2→4, 3→6 | T: unchanged
).subscribe(console.log);   // 2, 4, 6

// Operates on 'T' only — value unchanged
of(42).pipe(
  delay(500)                // a: 42 | T: shifted +500ms
).subscribe(console.log);   // 42 (after 500ms)

// Operates on both 'T' and 'a' — samples value at time boundary
interval(100).pipe(
  auditTime(300),           // picks latest 'a' every 300ms
  take(3)
).subscribe(console.log);   // 2, 5, 8 (approx — latest value per 300ms window)
```

Narration angle: Three operators, three families. `map` never touches the clock. `delay` never touches the value. `auditTime` uses the clock to decide *which* value survives. Label your operators by what dimension they affect — it makes pipelines much easier to reason about.

---

### Insight 10 — Three Observable Variants

- [ ] **Step 7: Write concept.md**

Frontmatter: title "The Three Kinds of Observable", section "The Data Model", insight "Three Observable variants", type "Concept", duration "2 min".

Narration covers: RxJS has three Observable variants, not one. The standard cold Observable runs independently per subscriber. The Subject is simultaneously an Observable and an Observer — it multicasts and can be pushed into imperatively. The ConnectableObservable (produced by `share()`, `publish()`) wraps a cold Observable and makes it hot — one shared execution, multiple subscribers. Knowing which variant to reach for is one of the most important decisions in RxJS architecture.

- [ ] **Step 8: Write deep-dive.md**

Frontmatter: title "The Three Kinds of Observable — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) Cold Observable: zero side effects before subscribe, independent per subscriber, auto-cleans up on unsubscribe. The default; use it unless you have a reason not to. (2) Subject: hot by definition — emissions happen regardless of subscribers and are lost if no one is listening. Three subtypes: `Subject` (no replay), `BehaviorSubject` (replays last value to new subscribers), `ReplaySubject` (replays N values). Use when you need imperative push or multicast state. (3) ConnectableObservable via `share()`: wraps a cold source, subscribes once, multicasts to all downstream subscribers, ref-counts — unsubscribes from the source when subscriber count drops to zero. Use for expensive sources (HTTP, WebSocket) that multiple operators or components need. (4) The rule of thumb: start cold, reach for `share()` when you see duplicate subscriptions to the same source, reach for Subject only when you need imperative push.

- [ ] **Step 9: Write code-sample.md**

Frontmatter: title "The Three Kinds of Observable — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { Observable, Subject, interval } from 'rxjs';
import { share, take } from 'rxjs/operators';

// 1. Cold Observable — independent per subscriber
const cold$ = new Observable<number>(obs => {
  obs.next(Math.random());
  obs.complete();
});
cold$.subscribe(v => console.log('Cold A:', v)); // e.g. 0.42
cold$.subscribe(v => console.log('Cold B:', v)); // e.g. 0.87 — different!

// 2. Subject — hot, multicasting, imperative push
const subject$ = new Subject<number>();
subject$.subscribe(v => console.log('Subject A:', v));
subject$.subscribe(v => console.log('Subject B:', v));
subject$.next(42); // both A and B receive 42

// 3. ConnectableObservable via share() — one source, multiple consumers
const shared$ = interval(1000).pipe(share(), take(3));
shared$.subscribe(v => console.log('Shared X:', v));
shared$.subscribe(v => console.log('Shared Y:', v));
// X and Y see the same emissions from one shared interval
```

Narration angle: Three patterns of subscription, three different behaviours. Cold gives you isolation. Subject gives you imperative control and multicast. `share()` gives you multicast without giving up the cold Observable model.

- [ ] **Step 10: Commit Section 3**

```bash
git add scripts/section-03-data-model/
git commit -m "feat: write 9 narration scripts for section 03 — Data Model"
```

---

## Task 5: Section 4 — Subscriptions & Lifecycle (insights 11–13)

**Files:**
- Write: `scripts/section-04-subscriptions-lifecycle/11-subscription-as-lifecycle/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-04-subscriptions-lifecycle/12-subscription-tree/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-04-subscriptions-lifecycle/13-three-step-workflow/{concept,deep-dive,code-sample}.md`

---

### Insight 11 — Subscription as Lifecycle

- [ ] **Step 1: Write concept.md**

Frontmatter: title "A Subscription Is a Lifecycle", section "Subscriptions & Lifecycle", insight "Subscription as lifecycle", type "Concept", duration "2 min".

Narration covers: When you call `subscribe()` it returns a `Subscription` object — the handle to the running execution. This object represents the full lifecycle: active while running, closed after `unsubscribe()` or `complete()`. The Subscription is your responsibility to manage. Forgetting to unsubscribe from a long-running Observable is a memory leak — the producer keeps running, the observer keeps receiving, and the garbage collector can't clean up.

- [ ] **Step 2: Write deep-dive.md**

Frontmatter: title "A Subscription Is a Lifecycle — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) What `subscribe()` actually does: calls the Observable's subscribe function, wraps the observer in a `SafeSubscriber` that enforces the Observable contract (no emissions after complete/error), and returns the Subscription. (2) The teardown logic: the subscribe function can return a teardown — a function or another Subscription that fires on unsubscribe. This is where you clear intervals, remove event listeners, cancel HTTP requests. (3) The Observable contract: after `complete()` or `error()`, the subscription closes automatically — no need to call `unsubscribe()` explicitly. Only infinite Observables require manual unsubscription. (4) The `closed` property: `sub.closed` is `true` after unsubscription. (5) Framework integrations: Angular's `takeUntilDestroyed`, React's cleanup in `useEffect` — all ultimately call `unsubscribe()`.

- [ ] **Step 3: Write code-sample.md**

Frontmatter: title "A Subscription Is a Lifecycle — Code Sample", type "Code Sample", duration "3 min".

```typescript
import { Observable } from 'rxjs';

const ticking$ = new Observable<number>(observer => {
  let n = 0;
  const id = setInterval(() => observer.next(n++), 500);

  // Teardown: runs on unsubscribe
  return () => {
    clearInterval(id);
    console.log('Interval cleared — no more ticks');
  };
});

const sub = ticking$.subscribe(n => console.log('Tick:', n));

setTimeout(() => {
  sub.unsubscribe(); // triggers teardown
  console.log('Subscription closed:', sub.closed); // true
}, 2000);
```

Narration angle: The subscribe function returns a cleanup function — that's the teardown contract. When `unsubscribe()` is called, the interval is cleared and the producer stops. Without this, the interval runs forever. The Subscription object's `closed` property confirms the lifecycle has ended.

---

### Insight 12 — Subscription Tree

- [ ] **Step 4: Write concept.md**

Frontmatter: title "Subscriptions Form a Tree", section "Subscriptions & Lifecycle", insight "Subscription tree", type "Concept", duration "2 min".

Narration covers: Subscriptions can be nested — a parent Subscription can own child Subscriptions. When the parent is unsubscribed, all children are unsubscribed automatically. This tree structure is how RxJS handles composite teardown: rather than tracking a dozen individual subscriptions, you track one parent and let the tree clean up. It's the same idea as a component lifecycle — when the component is destroyed, all its subscriptions die with it.

- [ ] **Step 5: Write deep-dive.md**

Frontmatter: title "Subscriptions Form a Tree — Deep Dive", type "Deep Dive", duration "4 min".

Narration covers: (1) The `Subscription.add(child)` API: adds a child subscription. On `parent.unsubscribe()`, all added children also unsubscribe. (2) Automatic tree building: operators like `switchMap` create inner subscriptions — RxJS manages the tree internally so inner subscriptions are cleaned up when the outer unsubscribes. (3) The `takeUntil(destroy$)` pattern: a common idiom that adds a higher-level lifecycle signal as the tree root. (4) `Subscription.remove(child)`: removing a child from the tree without unsubscribing it — useful when a child completes and should be detached. (5) The tree is the mechanism behind "one unsubscribe to rule them all" component teardown.

- [ ] **Step 6: Write code-sample.md**

Frontmatter: title "Subscriptions Form a Tree — Code Sample", type "Code Sample", duration "3 min".

```typescript
import { interval, Subscription } from 'rxjs';

const parent = new Subscription();

const child1 = interval(300).subscribe(n => console.log('A:', n));
const child2 = interval(500).subscribe(n => console.log('B:', n));

parent.add(child1);
parent.add(child2);

// One call tears down the entire tree
setTimeout(() => {
  parent.unsubscribe();
  console.log('Parent closed:', parent.closed); // true
  console.log('Child1 closed:', child1.closed); // true
  console.log('Child2 closed:', child2.closed); // true
}, 2000);
```

Narration angle: Two independent intervals, one `unsubscribe()` call. The parent Subscription acts as the root of the tree — adding children via `add()` delegates teardown responsibility upward. In a real app this parent would be tied to a component or route lifecycle.

---

### Insight 13 — The Three-Step Workflow

- [ ] **Step 7: Write concept.md**

Frontmatter: title "The Canonical Three-Step Workflow", section "Subscriptions & Lifecycle", insight "Three-step workflow", type "Concept", duration "2 min".

Narration covers: Every RxJS pipeline follows the same three-step pattern: enter the RxJS world with a creation operator, transform values inside the world with pipeable operators, and exit the world with `subscribe` to apply side effects. Creation operators are the entry gates — `of`, `from`, `fromEvent`, `interval`, `ajax`. The pipe chain is the transformation layer. `subscribe` is the single exit point where side effects live. Keeping side effects out of the pipe and inside the subscriber is what makes pipelines testable and reusable.

- [ ] **Step 8: Write deep-dive.md**

Frontmatter: title "The Canonical Three-Step Workflow — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) Step 1 — creation operators as the "lift": you lift a value, event, or async source into the Observable world. (2) Step 2 — operators as pure transformations: each operator produces a new Observable without mutating the source. The pipe is a functional composition chain. Side effects inside `map` are a code smell — use `tap` if you need to observe without transforming. (3) Step 3 — `subscribe` as the interpreter: calling subscribe is what collapses the lazy description into a running execution. Before subscribe, nothing has happened. (4) The analogy with SQL: the query describes a transformation; the database engine executes it. The `pipe` chain is the query; `subscribe` is the execution. (5) Testing implication: you can test a `pipe` chain by substituting the creation operator with `of()` or a cold test Observable — the workflow stays the same.

- [ ] **Step 9: Write code-sample.md**

Frontmatter: title "The Canonical Three-Step Workflow — Code Sample", type "Code Sample", duration "3 min".

```typescript
import { interval } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

// Step 1: Enter — creation operator lifts a timer into Observable world
interval(1000).pipe(

  // Step 2: Transform — pure operators, no side effects
  map(n => n * n),
  filter(n => n % 2 === 0),
  take(4)

// Step 3: Exit — subscribe is the only place for side effects
).subscribe({
  next: n    => console.log('Value:', n),
  error: e   => console.error('Error:', e),
  complete: () => console.log('Done')
});
```

Narration angle: Three zones, clearly separated. `interval` is the entry gate. `map`/`filter`/`take` are pure transformation — no side effects, no logging, no mutation. `subscribe` is where you act on the world. Break this boundary by putting `console.log` inside `map` and you've created an untestable, impure transformation.

- [ ] **Step 10: Commit Section 4**

```bash
git add scripts/section-04-subscriptions-lifecycle/
git commit -m "feat: write 9 narration scripts for section 04 — Subscriptions & Lifecycle"
```

---

## Task 6: Section 5 — Composition & Concurrency (insights 14–17)

**Files:**
- Write: `scripts/section-05-composition-concurrency/14-rxjs-three-things/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-05-composition-concurrency/15-schedulers/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-05-composition-concurrency/16-four-basic-scenarios/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-05-composition-concurrency/17-dsl-time-varying-values/{concept,deep-dive,code-sample}.md`

---

### Insight 14 — RxJS Is Three Things

- [ ] **Step 1: Write concept.md**

Frontmatter: title "RxJS Is Three Things", section "Composition & Concurrency", insight "RxJS is 3 things", type "Concept", duration "2 min".

Narration covers: RxJS is not just a library of operators. It's three things working together: the Observable type (the container that represents a push-based sequence), the operators (the LINQ-style query functions that transform Observables), and the Schedulers (the mechanism for controlling when and where work happens). Most developers only ever use the first two. Understanding Schedulers is what separates intermediate RxJS from advanced RxJS.

- [ ] **Step 2: Write deep-dive.md**

Frontmatter: title "RxJS Is Three Things — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) Observable as the container — analogous to `Array` for synchronous pull sequences. (2) Operators as the query layer — the ~100 operators that ship with RxJS covering creation, transformation, filtering, combination, error handling, and timing. This is the LINQ inheritance: a standard query vocabulary. (3) Schedulers as the execution layer — they determine the concurrency model: `queueScheduler` (synchronous, trampoline), `asapScheduler` (microtask), `asyncScheduler` (macrotask/setTimeout), `animationFrameScheduler` (requestAnimationFrame). (4) The interaction: creation operators accept a Scheduler parameter; `observeOn` and `subscribeOn` inject Schedulers mid-pipeline. (5) Why Schedulers matter: they're the mechanism for moving work off the main thread, controlling test timing with virtual time, and ensuring animation-smooth rendering.

- [ ] **Step 3: Write code-sample.md**

Frontmatter: title "RxJS Is Three Things — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { interval } from 'rxjs';
import { map, take, observeOn } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';

// All three pillars in one pipeline:
interval(1000, asyncScheduler) // Observable + Scheduler (creation)
  .pipe(
    map(n => n * n),            // Operator (value transformation)
    take(5),                    // Operator (count boundary)
    observeOn(asyncScheduler)   // Scheduler (delivery control)
  )
  .subscribe(console.log);
```

Narration angle: `interval` is the Observable — it creates a push sequence. `map` and `take` are operators — they transform the sequence. `asyncScheduler` appears in two places: at creation (controlling when ticks are produced) and via `observeOn` (controlling when the observer receives them). Three pillars, one pipeline.

---

### Insight 15 — Schedulers

- [ ] **Step 4: Write concept.md**

Frontmatter: title "Schedulers Control Time and Concurrency", section "Composition & Concurrency", insight "Schedulers", type "Concept", duration "2 min".

Narration covers: A Scheduler is a central dispatcher — it decides *when* a piece of work runs and on *what execution context*. Without Schedulers, RxJS can't control whether work happens synchronously, on the next microtask, on the next setTimeout, or on the next animation frame. Schedulers are also what make RxJS testable with virtual time: the `TestScheduler` replaces real time with a simulated clock, letting you fast-forward marble tests without waiting for real milliseconds.

- [ ] **Step 5: Write deep-dive.md**

Frontmatter: title "Schedulers Control Time and Concurrency — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) `queueScheduler` — synchronous, uses a trampoline to avoid stack overflows on recursive scheduling. Work runs in the current call stack, queued. (2) `asapScheduler` — schedules on the microtask queue (like `Promise.resolve().then()`). Runs before the next macrotask. (3) `asyncScheduler` — schedules via `setTimeout`/`setInterval`. The default for time-based operators like `interval` and `delay`. (4) `animationFrameScheduler` — schedules via `requestAnimationFrame`. Use for DOM animations to sync with the browser's render cycle. (5) `TestScheduler` — virtual time. No real waiting. `cold('-a-b|')` is a marble string; the scheduler controls when `-` ticks advance. Essential for deterministic tests of time-based operators. (6) `observeOn` vs `subscribeOn`: `observeOn` controls the Scheduler for *next/error/complete* delivery; `subscribeOn` controls the Scheduler for the *subscribe* call itself.

- [ ] **Step 6: Write code-sample.md**

Frontmatter: title "Schedulers Control Time and Concurrency — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { of } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { asyncScheduler, queueScheduler } from 'rxjs';

console.log('--- start ---');

of(1, 2, 3).pipe(
  observeOn(queueScheduler)
).subscribe(v => console.log('queue:', v));

of(4, 5, 6).pipe(
  observeOn(asyncScheduler)
).subscribe(v => console.log('async:', v));

console.log('--- end ---');

// Output:
// --- start ---
// queue: 1
// queue: 2
// queue: 3
// --- end ---
// async: 4
// async: 5
// async: 6
```

Narration angle: Both pipelines emit the same structure. The Scheduler is the only difference. Queue runs synchronously — emissions appear before "end". Async schedules via setTimeout — emissions appear after "end". Same Observable, same operators, different execution context. That's a Scheduler.

---

### Insight 16 — Four Basic Scenarios

- [ ] **Step 7: Write concept.md**

Frontmatter: title "Four Scenarios, One Library", section "Composition & Concurrency", insight "Four basic scenarios", type "Concept", duration "2 min".

Narration covers: Every RxJS problem fits one of four scenarios. You have no Observable — create one with a creation operator. You have one Observable — transform its values with pipeable operators. You have many Observables — combine them into one with combination operators. You have nested Observables — flatten them with concurrency operators. Knowing which scenario you're in immediately tells you which family of operators to reach for.

- [ ] **Step 8: Write deep-dive.md**

Frontmatter: title "Four Scenarios, One Library — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) No Observable: `of`, `from`, `fromEvent`, `ajax`, `interval`, `timer`, `EMPTY`, `NEVER`, `throwError`. Choose based on the source type and synchronicity. (2) One Observable: `map`, `filter`, `scan`, `reduce`, `take`, `debounceTime`, `distinctUntilChanged`. The full LINQ query vocabulary. (3) Many Observables: `merge` (concurrent, no ordering), `concat` (sequential), `combineLatest` (latest from all), `zip` (paired), `withLatestFrom` (sample one on events from another), `race` (first to emit wins). (4) Nested Observables: `mergeMap` (all inner subscriptions concurrent), `concatMap` (sequential, queued), `switchMap` (cancel previous on new outer value), `exhaustMap` (ignore new outer while inner is active). The choice between these four is one of the most consequential architectural decisions in RxJS. (5) The mental model: identify the scenario first, then the right operator becomes obvious.

- [ ] **Step 9: Write code-sample.md**

Frontmatter: title "Four Scenarios, One Library — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { of, interval, merge } from 'rxjs';
import { map, take, mergeMap } from 'rxjs/operators';

// Scenario 1: No Observable — create one
const source$ = of(1, 2, 3);

// Scenario 2: One Observable — transform values
const doubled$ = source$.pipe(
  map(x => x * 2)
);

// Scenario 3: Many Observables — combine into one
const combined$ = merge(
  of('a', 'b'),
  of('c', 'd')
);

// Scenario 4: Nested Observables — flatten
const nested$ = of(1, 2).pipe(
  mergeMap(x => of(x * 10, x * 100))
);

doubled$.subscribe(v => console.log('Doubled:', v));      // 2, 4, 6
combined$.subscribe(v => console.log('Combined:', v));    // a, b, c, d
nested$.subscribe(v => console.log('Flattened:', v));     // 10, 100, 20, 200
```

Narration angle: Four patterns, four snippets. No exotic operators — just the first one you'd reach for in each scenario. Once you've diagnosed the scenario, the operator choice follows naturally.

---

### Insight 17 — RxJS as a DSL for Time-Varying Values

- [ ] **Step 10: Write concept.md**

Frontmatter: title "RxJS Is a DSL for Time-Varying Values", section "Composition & Concurrency", insight "DSL for time-varying values", type "Concept", duration "2 min".

Narration covers: A Domain-Specific Language is a language designed for one problem domain. RxJS is a DSL for values that change over time. Its vocabulary — `debounce`, `throttle`, `sample`, `window`, `buffer`, `audit` — is the vocabulary of temporal reasoning. No general-purpose language gives you these primitives for free. RxJS doesn't just handle async; it lets you *express* time-based logic as composable declarations rather than as imperative timer management.

- [ ] **Step 11: Write deep-dive.md**

Frontmatter: title "RxJS Is a DSL for Time-Varying Values — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) What makes something a DSL: a restricted vocabulary that makes one problem domain concise and expressive while being less general than a full language. SQL for relational queries; CSS for styling; RxJS for time-varying values. (2) The temporal operators as the DSL vocabulary: `debounceTime` (quiet-period detection), `throttleTime` (rate limiting), `bufferTime` (accumulation windows), `windowTime` (nested Observable windows), `sampleTime` (periodic sampling), `auditTime` (trailing-edge sampling). (3) `combineLatest` as the quintessential DSL expression: "the value of this thing is always the latest A combined with the latest B" — a declarative statement about a time-varying relationship. (4) Comparison with imperative time management: a `debounce` function written with `setTimeout` and closure state vs. `debounceTime(300)` in a pipe. The DSL version is shorter, testable, and composable. (5) The insight: when you reach for RxJS for pure async, you're underusing it. Its real power is modelling *relationships between values that change over time*.

- [ ] **Step 12: Write code-sample.md**

Frontmatter: title "RxJS Is a DSL for Time-Varying Values — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// Two time-varying values — their relationship is declared, not computed imperatively
const width$  = new BehaviorSubject<number>(800);
const height$ = new BehaviorSubject<number>(600);

// This is a declaration: "area is always width × height"
const area$ = combineLatest([width$, height$]).pipe(
  map(([w, h]) => w * h)
);

area$.subscribe(area => console.log('Area:', area)); // 480000

width$.next(1024);   // area$ automatically recomputes → 614400
height$.next(768);   // area$ automatically recomputes → 786432
```

Narration angle: No imperative computation. No `recomputeArea()` call. The relationship is declared once with `combineLatest` and `map`. Whenever either input changes, the output updates. That's what a DSL for time-varying values looks like — you express *what* the relationship is, not *when* to recompute it.

- [ ] **Step 13: Commit Section 5**

```bash
git add scripts/section-05-composition-concurrency/
git commit -m "feat: write 12 narration scripts for section 05 — Composition & Concurrency"
```

---

## Task 7: Section 6 — Design Patterns (insights 18–24)

**Files:**
- Write: `scripts/section-06-design-patterns/18-domain-invariant-operators/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-06-design-patterns/19-subject-as-proxy/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-06-design-patterns/20-unicast-vs-multicast/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-06-design-patterns/21-functional-data-logic-separation/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-06-design-patterns/22-pipeline-dependency-graph/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-06-design-patterns/23-custom-naming-pattern/{concept,deep-dive,code-sample}.md`
- Write: `scripts/section-06-design-patterns/24-custom-operators/{concept,deep-dive,code-sample}.md`

---

### Insight 18 — Domain-Invariant Operators

- [ ] **Step 1: Write concept.md**

Frontmatter: title "Operators Don't Know Your Domain", section "Design Patterns", insight "Domain-invariant operators", type "Concept", duration "2 min".

Narration covers: RxJS operators are domain-agnostic. `map`, `filter`, `switchMap` don't know if they're processing GPS coordinates, animation frames, financial ticks, or user keystrokes. They operate on the Observable type. The domain lives in the values — the `a` in `{T, a}`. This separation is a superpower: operators written for one domain work instantly in any other. You never rewrite `debounceTime` for a new project.

- [ ] **Step 2: Write deep-dive.md**

Frontmatter: title "Operators Don't Know Your Domain — Deep Dive", type "Deep Dive", duration "4 min".

Narration covers: (1) The parallel with SQL: `WHERE` and `SELECT` don't know if you're querying users or products. The schema is the domain; the operators are universal. (2) How this enables reuse: a `retryWithBackoff` custom operator works whether the source is an HTTP call or a WebSocket reconnect. (3) Domain knowledge lives at the boundary: creation operators and subscriber callbacks are where domain types appear. The pipe chain is domain-free. (4) The anti-pattern: embedding domain logic directly in operator chains in ways that make them non-reusable — e.g., hard-coding a business rule inside a `filter` that belongs in a named predicate function. (5) The positive pattern: named domain predicates and transformations passed into generic operators — `filter(isHighAccuracy)`, `map(toDisplayString)`.

- [ ] **Step 3: Write code-sample.md**

Frontmatter: title "Operators Don't Know Your Domain — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface GpsPoint { lat: number; lng: number; accuracy: number }
interface Frame    { time: number; x: number; y: number; visible: boolean }

// GPS domain
const gps$ = of<GpsPoint>(
  { lat: 47.1, lng: 8.5, accuracy: 5  },
  { lat: 47.2, lng: 8.6, accuracy: 50 }
).pipe(
  filter(p => p.accuracy < 10),
  map(p => `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`)
);

// Animation domain — identical operators, different types
const animation$ = of<Frame>(
  { time: 0,  x: 0,  y: 0,  visible: true  },
  { time: 16, x: 10, y: 5,  visible: false }
).pipe(
  filter(f => f.visible),
  map(f => `(${f.x}, ${f.y})`)
);

gps$.subscribe(console.log);       // "47.1000, 8.5000"
animation$.subscribe(console.log); // "(0, 0)"
```

Narration angle: Identical operators — `filter` then `map` — applied to completely different domain types. The operators have no idea what a `GpsPoint` or a `Frame` is. They operate on the values and let TypeScript's type system track the domain. Swap the domain; keep the operators.

---

### Insight 19 — Subject as Proxy

- [ ] **Step 4: Write concept.md**

Frontmatter: title "Subject Is a Proxy", section "Design Patterns", insight "Subject as proxy", type "Concept", duration "2 min".

Narration covers: A Subject sits between a producer and multiple consumers. It's an Observer (it can receive values via `next`) and an Observable (consumers can subscribe to it). This dual role makes it a proxy — values flow in from one side and are broadcast to all subscribers on the other. The proxy pattern is how you take a cold, unicast source and make it hot and multicast without changing the source.

- [ ] **Step 5: Write deep-dive.md**

Frontmatter: title "Subject Is a Proxy — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) The proxy pattern in software: an intermediary that controls access between a client and a real subject. Subject in RxJS is exactly this — it intercepts a stream and re-broadcasts it. (2) `Subject` vs `BehaviorSubject` vs `ReplaySubject`: plain Subject has no memory (late subscribers miss past values); BehaviorSubject replays the last value to new subscribers; ReplaySubject replays the last N values. Choose based on whether late subscribers need context. (3) The pitfall: Subjects are hot — if you `next()` before anyone has subscribed, those values are lost. Use `BehaviorSubject` with an initial value when you need guaranteed delivery. (4) The multicast pattern: one cold Observable subscribed once via a Subject, many consumers subscribing to the Subject. This is what `share()` automates. (5) When NOT to use Subject: if you don't need imperative push or multicast, a plain cold Observable is safer and easier to test.

- [ ] **Step 6: Write code-sample.md**

Frontmatter: title "Subject Is a Proxy — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { interval, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

// Cold source — would run independently per subscriber
const source$ = interval(1000).pipe(take(4));

// Subject acts as the proxy — one subscription to the source
const proxy$ = new Subject<number>();

// Two consumers share the same source via the proxy
proxy$.subscribe(v => console.log('Consumer A:', v));
proxy$.subscribe(v => console.log('Consumer B:', v));

// Subscribe the proxy (as Observer) to the source (as Observable)
source$.subscribe(proxy$);

// A and B both receive: 0, 1, 2, 3
// The interval runs only once
```

Narration angle: Without the Subject, subscribing twice to `source$` would start two independent intervals. With the Subject as proxy, there's one interval, and both consumers receive every value. The Subject is the bridge — Observer on the source side, Observable on the consumer side.

---

### Insight 20 — Unicast vs Multicast

- [ ] **Step 7: Write concept.md**

Frontmatter: title "Unicast and Multicast — Two Communication Styles", section "Design Patterns", insight "Unicast vs multicast", type "Concept", duration "2 min".

Narration covers: Unicast means one producer to one consumer — each subscriber to a cold Observable gets a private execution. Multicast means one producer to many consumers — a Subject or `share()` distributes one execution to all subscribers. The choice between unicast and multicast has real consequences: duplicate HTTP requests, race conditions, or missed emissions are often a symptom of picking the wrong one.

- [ ] **Step 8: Write deep-dive.md**

Frontmatter: title "Unicast and Multicast — Two Communication Styles — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) Unicast scenarios: per-subscriber data (each user's own HTTP request), isolated state machines, test Observables. (2) Multicast scenarios: shared data sources (one WebSocket feeding multiple components), broadcast events, expensive computations that multiple consumers need. (3) The hidden cost of accidental unicast: an HTTP Observable subscribed in two places makes two HTTP requests. `share()` or a `BehaviorSubject` is the fix. (4) The hidden cost of accidental multicast: late subscribers to a Subject miss values that arrived before they subscribed. `BehaviorSubject` or `ReplaySubject` is the fix. (5) `shareReplay(1)` — the most common pattern for caching: multicasts and replays the last value to late subscribers. Use for any expensive source that multiple consumers reference. (6) Diagnosing: if you see a side effect (HTTP call, WebSocket connection) happen more times than expected — check if you have accidental unicast. If you see a subscriber missing values — check if you have accidental multicast with no replay.

- [ ] **Step 9: Write code-sample.md**

Frontmatter: title "Unicast and Multicast — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { Observable, Subject } from 'rxjs';

// Unicast: each subscriber triggers independent execution
const unicast$ = new Observable<number>(observer => {
  observer.next(Math.random());
  observer.complete();
});

unicast$.subscribe(v => console.log('Unicast S1:', v)); // e.g. 0.42
unicast$.subscribe(v => console.log('Unicast S2:', v)); // e.g. 0.87 — different!

// Multicast: one shared value broadcast to all subscribers
const multicast$ = new Subject<number>();

multicast$.subscribe(v => console.log('Multicast S1:', v));
multicast$.subscribe(v => console.log('Multicast S2:', v));

multicast$.next(Math.random()); // both S1 and S2 receive the same value
```

Narration angle: Same shape — two subscribers, one value each. Completely different behaviour. Unicast runs the producer twice and produces two independent random numbers. Multicast runs the producer once via an explicit `next()` call, and both subscribers see the identical value. The choice between these two patterns determines whether your side effects run once or N times.

---

### Insight 21 — Data and Logic Are Separate

- [ ] **Step 10: Write concept.md**

Frontmatter: title "Data and Logic Stay Separate", section "Design Patterns", insight "Data and Logic are separate", type "Concept", duration "2 min".

Narration covers: In functional programming, data and the logic that transforms it are never mixed together. In RxJS: the Observable is the data — a push sequence of values. The `pipe` chain is the logic — a composition of pure transformations. The subscriber is where the world changes. Keeping these three separate makes each part independently testable and reusable. The pipe chain can be extracted and tested with any Observable source.

- [ ] **Step 11: Write deep-dive.md**

Frontmatter: title "Data and Logic Stay Separate — Deep Dive", type "Deep Dive", duration "4 min".

Narration covers: (1) The functional programming principle: functions are values, data flows through them, neither changes the other. (2) Observable as pure data description: it describes *what* will be emitted, not *when* or *by whom*. (3) The pipe chain as a pure function: given an Observable, it returns a new Observable. No side effects, no mutation. This means you can extract the entire `pipe(...)` block as a named function and reuse it. (4) The subscriber as the imperative shell: it's the only place you update the DOM, call APIs, write to a database. Everything inside `pipe` stays pure. (5) Testing consequence: test the pipe chain with `of()` or marble Observables — no need to mock the real source. The subscriber (side effects) is tested separately or not at all.

- [ ] **Step 12: Write code-sample.md**

Frontmatter: title "Data and Logic Stay Separate — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { of } from 'rxjs';
import { filter, map, reduce } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

// The logic — a reusable pure transformation, extracted as a named function
const discountedTotal = (): OperatorFunction<number, number> =>
  source$ => source$.pipe(
    filter(price => price > 10),      // only prices above threshold
    map(price => price * 0.8),        // apply 20% discount
    reduce((acc, price) => acc + price, 0)
  );

// The data — any Observable of numbers
const prices$ = of(5, 15, 8, 25, 30);

// Data flows through logic; side effects only in subscribe
prices$.pipe(discountedTotal()).subscribe(
  total => console.log('Discounted total:', total) // 56
);

// The same logic applied to different data — no changes needed
const morePrices$ = of(20, 50, 3);
morePrices$.pipe(discountedTotal()).subscribe(
  total => console.log('Other total:', total) // 56
);
```

Narration angle: `discountedTotal` is pure logic — no side effects, no dependency on any specific data source. You pass it any `Observable<number>` and it produces the same transformation. The data and the logic never know about each other until `pipe` connects them at the call site.

---

### Insight 22 — Pipeline as Dependency Graph

- [ ] **Step 13: Write concept.md**

Frontmatter: title "A Pipeline Is a Dependency Graph", section "Design Patterns", insight "Pipeline as dependency graph", type "Concept", duration "2 min".

Narration covers: An RxJS pipeline is a directed acyclic graph with two directions: downstream and upstream. Values flow downstream — from the creation operator through each pipe operator to the subscriber. Subscriptions flow upstream — when you call `subscribe`, the subscription signal propagates up through every operator to the source. This means unsubscribing from the bottom tears down the entire graph upward. Understanding this bidirectionality explains why operators like `takeUntil` work — they intercept the upstream subscription signal.

- [ ] **Step 14: Write deep-dive.md**

Frontmatter: title "A Pipeline Is a Dependency Graph — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) The downstream graph: each operator subscribes to its upstream source and emits to its downstream subscriber. A chain of N operators is a chain of N nested subscriptions. (2) The upstream subscription propagation: when you subscribe at the bottom, the call propagates all the way to the source's subscribe function. The entire graph activates on one `subscribe()` call. (3) Visualising the graph with `tap`: inserting `tap` at any point in the pipeline lets you observe values at that graph node without affecting the flow. (4) `share()` as a graph junction: instead of a linear chain, `share()` creates a node with multiple outgoing edges — one source, multiple downstream consumers, one upstream subscription. (5) The consequence for memory leaks: if you don't unsubscribe, the entire graph — every operator's closure, every captured variable — stays alive. The graph is the memory footprint.

- [ ] **Step 15: Write code-sample.md**

Frontmatter: title "A Pipeline Is a Dependency Graph — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { interval } from 'rxjs';
import { map, filter, tap, take } from 'rxjs/operators';

interval(200).pipe(
  tap(n  => console.log('  [node 1 — source]:', n)),
  filter(n => n % 2 === 0),
  tap(n  => console.log('  [node 2 — after filter]:', n)),
  map(n  => n * n),
  tap(n  => console.log('  [node 3 — after map]:', n)),
  take(3)
).subscribe(n => console.log('[subscriber — exit node]:', n));

// Each tap reveals the value at that graph node
// The subscriber is the terminal node where values leave the graph
```

Narration angle: `tap` makes the invisible visible — it lets you observe each node in the dependency graph without altering the flow. Every line in the pipe chain is a node. Values travel left to right through the nodes. The subscription signal traveled right to left when you called `subscribe`. `take(3)` terminates the subscription signal after three values, tearing down the entire graph.

---

### Insight 23 — Custom Naming Pattern

- [ ] **Step 16: Write concept.md**

Frontmatter: title "Rename Operators to Speak Your Domain", section "Design Patterns", insight "Custom naming pattern", type "Concept", duration "2 min".

Narration covers: Technical operator names — `switchMap`, `exhaustMap`, `debounceTime` — are meaningful to RxJS developers but opaque to domain experts. The custom naming pattern wraps standard operators in functions with names that match the problem domain. Instead of `switchMap(q => search(q))` you write `liveSearch(searchApi)`. The pipe reads like the domain, not like the library. This reduces cognitive load for teammates who aren't RxJS experts and makes the pipeline's intent self-documenting.

- [ ] **Step 17: Write deep-dive.md**

Frontmatter: title "Rename Operators to Speak Your Domain — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) The readability gap: a pipeline of `debounceTime(300)`, `distinctUntilChanged()`, `switchMap(q => api.search(q))`, `catchError(() => of([]))` is correct but requires RxJS knowledge to decode. (2) The naming pattern: wrap the entire sequence in a custom operator function with a domain name — `typeaheadSearch(api)` — that encapsulates the implementation. (3) The double benefit: readability at the call site + testability in isolation. You can unit test `typeaheadSearch` independently of whatever Observable it's applied to. (4) Naming conventions: name custom operators after the *business behaviour*, not the *technical mechanism*. `cancelPreviousSearch` communicates intent; `switchMappedSearch` does not. (5) Composing custom operators: a custom operator is just a function `OperatorFunction<T, R>` — it can call `pipe()` internally and combine any number of built-in operators.

- [ ] **Step 18: Write code-sample.md**

Frontmatter: title "Rename Operators to Speak Your Domain — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { OperatorFunction } from 'rxjs';

// Domain-named custom operator — encapsulates technical RxJS details
const typeaheadSearch = (
  searchApi: (query: string) => Observable<string[]>
): OperatorFunction<string, string[]> =>
  source$ => source$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => searchApi(query).pipe(
      catchError(() => of([]))
    ))
  );

// At the call site — reads like the domain, not the library
// keystrokes$.pipe(typeaheadSearch(api.search)).subscribe(renderResults);
```

Narration angle: At the call site you read `typeaheadSearch` — you know immediately what this does without parsing four operator names. The technical implementation is hidden inside the custom operator and can be changed (swap `switchMap` for `exhaustMap`, adjust the debounce time) without touching any call sites. Name for the domain, implement with the library.

---

### Insight 24 — Custom Operators

- [ ] **Step 19: Write concept.md**

Frontmatter: title "Custom Operators — Isolation and Error Handling", section "Design Patterns", insight "Custom operators", type "Concept", duration "2 min".

Narration covers: Custom operators are the primary reuse mechanism in RxJS. A custom operator is a function that takes an Observable and returns an Observable. It can be tested in isolation from any production source, has its own error handling that doesn't leak into the surrounding pipeline, and is composable with any other operator. If you find yourself writing the same `pipe` chain in multiple places, it's time to extract it into a named custom operator.

- [ ] **Step 20: Write deep-dive.md**

Frontmatter: title "Custom Operators — Isolation and Error Handling — Deep Dive", type "Deep Dive", duration "5 min".

Narration covers: (1) The signature: `const myOp = <T, R>(config: Config): OperatorFunction<T, R> => (source$: Observable<T>): Observable<R> => source$.pipe(...)`. Return type is `OperatorFunction<T, R>`. (2) Testing in isolation: pass a `cold()` or `of()` test Observable to the custom operator directly. No need to set up the full production source. (3) Error handling scope: a `catchError` inside the custom operator catches only errors within that operator's boundary. Errors don't propagate to the surrounding pipeline unless re-thrown — giving you granular control over recovery. (4) Composability: custom operators compose with built-in operators in `pipe()` transparently — TypeScript infers types through the chain. (5) When to extract: the rule of three — if the same `pipe` chain appears three times, extract it. If it has a name that belongs to the domain, extract it sooner.

- [ ] **Step 21: Write code-sample.md**

Frontmatter: title "Custom Operators — Isolation and Error Handling — Code Sample", type "Code Sample", duration "4 min".

```typescript
import { Observable, of, OperatorFunction } from 'rxjs';
import { filter, map, catchError } from 'rxjs/operators';

// Custom operator — isolated, testable, reusable
const positiveDoubles = (): OperatorFunction<number, number> =>
  (source$: Observable<number>): Observable<number> =>
    source$.pipe(
      filter(n => n > 0),
      map(n => n * 2),
      catchError(err => {
        console.error('positiveDoubles error:', err);
        return of(); // recover gracefully — don't kill the outer pipeline
      })
    );

// Test in isolation — no production source needed
of(-1, 2, -3, 4, 0, 5)
  .pipe(positiveDoubles())
  .subscribe(console.log); // 4, 8, 10

// Compose with other operators — types flow through transparently
of(1, -2, 3)
  .pipe(
    positiveDoubles(),
    map(n => `Result: ${n}`)
  )
  .subscribe(console.log); // "Result: 2", "Result: 6"
```

Narration angle: `positiveDoubles` is self-contained — it has its own `filter`, its own `map`, and its own `catchError`. Errors inside it don't terminate the outer pipeline. Testing it requires nothing more than `of()`. Composing it with other operators is transparent — TypeScript tracks the types through. This is the full custom operator pattern: isolate, handle errors, compose freely.

- [ ] **Step 22: Commit Section 6**

```bash
git add scripts/section-06-design-patterns/
git commit -m "feat: write 21 narration scripts for section 06 — Design Patterns"
```

---

## Self-Review

After writing all 72 scripts, verify:

- [ ] Every file has the correct frontmatter (title, section, insight, lesson type, duration)
- [ ] No bullet lists or headings inside any narration body
- [ ] All TypeScript snippets in code-sample files are syntactically valid
- [ ] Every insight from `rxjs-insights.md` maps to exactly one insight folder with three scripts
- [ ] Word counts are within target range (concept 250–360 / deep-dive 480–720 / code-sample 360–600)

```bash
# Quick check — count total script files
find scripts -name "*.md" ! -name "TEMPLATE.md" | wc -l
# Expected: 72
```

---

## Final commit

```bash
git add scripts/
git commit -m "feat: complete all 72 narration scripts for RxJS Insights course"
```
