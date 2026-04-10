# RxJS Deep Dive — Video Course Design

**Date:** 2026-04-10  
**Status:** Approved  
**Author:** Hans Schenker

---

## Summary

A comprehensive 8–12 hour Udemy video course targeting intermediate RxJS developers — those who know the basics but want the full mental model: operator intuition, state architecture, custom pipelines, and production patterns. The course is structured around problem spaces, not the API surface.

---

## Audience

**Intermediate developers** — already know `map`, `filter`, `subscribe`, and basic Observable creation. The course skips "what is an Observable" and starts where most tutorials stop: operator intuition, stream composition, state management, and architecture.

---

## Platform and Format

- **Platform:** Udemy (structured chapters, logical learning progression)
- **Format:** Hybrid per lesson
  - Marp slides for the concept half (3–6 slides per lesson)
  - Live coding in VS Code for the hands-on demo half
- **Target lesson length:** 8–12 minutes

---

## Three Artifacts

```
rxjs-wiki/                          ← knowledge base, source of truth for content
  slides/                           ← auto-generated Marp drafts (wiki-query skill)

rxjs-deep-dive-claude-superpowers/  ← course production repo
  curriculum.json                   ← lesson index, single source of truth
  scripts/
    generate-slides.ts
    check-readiness.ts
    export-pdf.ts
  slides-polished/                  ← hand-polished decks (copied from rxjs-wiki/slides/)
  docs/
    recording-notes/                ← per-lesson talking points and code to type
    superpowers/specs/              ← this file

rxjs-spa/                           ← companion app (existing monorepo, used as-is)
```

The wiki is **never modified** for the course. The course draws from it via the `wiki-query` skill, which auto-generates Marp slide drafts that are then manually polished.

---

## Per-Lesson Anatomy

Every lesson follows this repeating structure:

```
1. Hook (30–60s)       — "Here's the problem you've hit in production"
2. Concept slides      — Marp deck, 3–6 slides, terminology + marble diagrams
3. Live code demo      — Switch to VS Code, add feature to companion app
4. Recap slide         — One slide: key rule / mental model to remember
5. What's next (15s)   — Bridge to the next lesson
```

### Slide Deck Skeleton (6 slides per lesson)

```
Slide 1:  Title + problem statement   ("Here's what we're solving")
Slide 2:  Core concept / definition   (precise, quoted from wiki)
Slide 3:  Marble diagram or diagram   (visual — ASCII or image)
Slide 4:  Code example — wrong way    (what intermediate devs do)
Slide 5:  Code example — right way    (the pattern being taught)
Slide 6:  Key rule to remember        (one sentence, bold — the takeaway)
```

---

## Companion App

**`rxjs-spa`** — an existing monorepo of SPAs and packages built entirely in pure RxJS + TypeScript. No framework. Every piece of state, DOM update, HTTP request, and user interaction flows through RxJS Observables.

### Package Map

| Package | Role |
|---|---|
| `packages/core` | Custom operators, pipe factories |
| `packages/dom` | DOM binding utilities, `defineComponent`, `list`, `when` |
| `packages/router` | History-mode router, shared `route$` hot stream |
| `packages/store` | BehaviorSubject + scan state, `select`, `createStore` |
| `packages/http` | HTTP client with interceptors, cancellable requests |
| `packages/forms` | Reactive form binding, validation, `bindInput`, `bindError` |
| `packages/persist` | localStorage-backed store with versioning |
| `packages/errors` | Centralized error capture, `catchAndReport` operator |
| `packages/testing` | TestScheduler helpers, marble utilities |

### App Map

| App | Role |
|---|---|
| `apps/starter-minimal` | Bare-bones Observable + subscribe entry point |
| `apps/starter-standard` | Standard app shell with routing |
| `apps/starter-full` | Full-featured starter with all packages |
| `apps/playground` | Free-form experiments |
| `apps/shop` | Complete e-commerce SPA — all packages assembled |
| `apps/demo` | SSR demonstration |
| `apps/snake` | Animation with `animationFrameScheduler` |
| `apps/product-configurator` | Form + state composition demo |

### Course Progression Through the Companion App

| Section | Entry Point |
|---|---|
| 0 — Historical Roots | — (no code) |
| 1 — Foundations | `apps/starter-minimal` |
| 2 — Async Coordination | `packages/http` + `apps/playground` |
| 3 — State Without Redux | `packages/store` + `packages/persist` |
| 4 — Stream Composition | `packages/dom` |
| 5 — Error Resilience | `packages/errors` + `packages/http` |
| 6 — Custom Operators | `packages/core` |
| 7 — Multicasting & Hot Streams | `packages/router` |
| 8 — Architecture Patterns | `apps/shop` (complete) |
| 9 — Testing | `packages/testing` |
| 10 — Production Patterns | `apps/demo`, `apps/snake` |

### Git Tags

`rxjs-spa` uses git tags so students can check out any starting point:

```bash
git checkout section-01-start
git checkout section-01-complete
git checkout section-08-complete   # full shop assembled
```

---

## Full Curriculum (46 lessons)

### Section 0 — RxJS Conceptual and Historical Roots
*"Where did this come from and why does it look the way it does?"*

| # | Lesson | Wiki Source |
|---|--------|-------------|
| 0.1 | Haskell list comprehensions and lazy sequences | `core/frp-concepts.md` |
| 0.2 | LINQ and the IEnumerable abstraction | `core/linq-monad.md` |
| 0.3 | Erik Meijer and the IEnumerable/IObservable dual | `history/erik-meijer.md` |
| 0.4 | Rx.NET → RxJS: the port and what changed | `history/roots.md`, `history/timeline.md` |
| 0.5 | The monad connection: `flatMap` as the universal combinator | `core/linq-monad.md` |

*Slides-heavy, no companion app code. Whiteboard-style diagrams.*

---

### Section 1 — Foundations Revisited
*"The mental model intermediate devs are missing"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 1.1 | Observable internals: what actually happens on subscribe | `core/observable-internals.md` | `apps/starter-minimal` |
| 1.2 | The eight execution phases | `core/execution-phases.md` | `apps/starter-minimal` |
| 1.3 | Hot vs Cold — precise definition, not intuition | `core/hot-cold.md` | `apps/starter-standard` |
| 1.4 | The operator policy framework (8 axes) | `core/operator-policies.md` | — |
| 1.5 | Marble diagrams as a first-class tool | `core/operators.md` | `packages/testing` |

---

### Section 2 — Async Coordination
*"switchMap vs mergeMap vs concatMap vs exhaustMap — once and for all"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 2.1 | Higher-order operators: what "flattening" means | `core/higher-order-operators.md` | `packages/http` |
| 2.2 | switchMap — live queries, search, cancellation | `core/higher-order-operators.md` | `apps/shop` → search |
| 2.3 | concatMap — ordered queues, animations | `core/higher-order-operators.md` | `apps/shop` → cart |
| 2.4 | exhaustMap — form submit, login, debounced actions | `core/higher-order-operators.md` | `apps/shop` → checkout |
| 2.5 | mergeMap — when order truly doesn't matter | `core/higher-order-operators.md` | `apps/playground` |
| 2.6 | Decision guide: choosing the right flattening operator | `core/higher-order-operators.md` | — |

---

### Section 3 — State Without a Framework
*"BehaviorSubject + scan is your state machine"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 3.1 | BehaviorSubject as a state container | `core/BehaviorSubject.md` | `packages/store` |
| 3.2 | scan + reducer = MVU in 10 lines | `core/subjects-guide.md` | `packages/store` |
| 3.3 | ReplaySubject and AsyncSubject — when BehaviorSubject isn't right | `core/ReplaySubject.md`, `core/AsyncSubject.md` | — |
| 3.4 | shareReplay — caching, multicasting, the refCount trap | `core/share-replay.md` | `packages/store` |
| 3.5 | Persisted state with localStorage | `patterns/state-management.md` | `packages/persist` |

---

### Section 4 — Stream Composition
*"Combining multiple sources without losing your mind"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 4.1 | combineLatest — formal rules, the EMPTY trap | `core/combine-latest.md` | `packages/dom` |
| 4.2 | withLatestFrom — sampling vs combining | `core/combination-operators.md` | `apps/shop` → filters |
| 4.3 | merge, concat, race, zip — when to use each | `core/combination-operators.md` | `apps/playground` |
| 4.4 | RxJS as a dataflow graph | `core/dataflow-model.md` | `apps/shop` → App.ts |
| 4.5 | Stream machines — the 6 irreducible building blocks | `core/stream-machines.md` | — |

---

### Section 5 — Error Resilience
*"Streams that don't die in production"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 5.1 | catchError — recover vs rethrow | `patterns/error-handling.md` | `packages/errors` |
| 5.2 | retry, retryWhen, exponential backoff | `patterns/error-handling.md` | `packages/http` |
| 5.3 | timeout and race-based fallbacks | `patterns/error-handling.md` | `packages/http` |
| 5.4 | Global error capture and centralized reporting | `patterns/error-handling.md` | `packages/errors` + `apps/shop` |

---

### Section 6 — Custom Operators and Pipeline Composition
*"Writing operators that read like sentences"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 6.1 | pipe() as Kleisli composition | `core/custom-operators.md` | `packages/core` |
| 6.2 | Parametric operator factories | `core/custom-operators.md` | `packages/core` |
| 6.3 | Domain operators — giving operators business names | `patterns/domain-operators.md` | `packages/dom` |
| 6.4 | Low-level: building operators with the Observable constructor | `core/custom-operators.md` | `packages/core` |

---

### Section 7 — Multicasting and Hot Streams
*"Subjects are not bad — you're just using them wrong"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 7.1 | Subject variants compared — the choosing guide | `core/subjects-guide.md` | — |
| 7.2 | Cold-to-hot conversion: publish, share, multicast | `core/hot-cold.md` | `packages/router` |
| 7.3 | The router as a shared hot stream | `core/hot-cold.md` | `packages/router` |
| 7.4 | Subject as action bus — the effects pattern | `patterns/effects.md` | `apps/shop` → store |

---

### Section 8 — Architecture Patterns
*"How RxJS organises a whole application"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 8.1 | MVU (Model–View–Update) in pure RxJS | `architectures/mvu.md`, `patterns/mvu.md` | `apps/shop` |
| 8.2 | Event-driven architecture with action streams | `architectures/event-driven.md` | `apps/shop` → App.ts |
| 8.3 | Redux-Observable style effects | `architectures/redux-observable.md`, `patterns/effects.md` | `apps/shop` → store |
| 8.4 | XState vs RxJS — when to reach for a state machine | `architectures/xstate-vs-rxjs.md` | — |
| 8.5 | The full shop walkthrough — all patterns assembled | — | `apps/shop` (complete) |

---

### Section 9 — Testing Reactive Code
*"Tests that actually catch bugs"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 9.1 | TestScheduler and virtual time | `core/Scheduler.md` | `packages/testing` |
| 9.2 | Marble syntax deep dive | `core/Scheduler.md` | `packages/testing` |
| 9.3 | Testing operators in isolation | — | `packages/core` tests |
| 9.4 | Testing effects and async state | — | `packages/store` tests |

---

### Section 10 — Production Patterns
*"What nobody tells you until you're in production"*

| # | Lesson | Wiki Source | Companion |
|---|--------|-------------|-----------|
| 10.1 | Memory leaks — takeUntil, take(1), async pipe equivalents | `core/Subscription.md` | `apps/demo` |
| 10.2 | Debugging streams — tap, debug operators, DevTools | — | `apps/playground` |
| 10.3 | Animations with animationFrameScheduler | `patterns/animations.md` | `apps/snake` |
| 10.4 | SSR — Observable pipelines on the server | — | `apps/demo` (SSR) |
| 10.5 | RxJS with React / Angular — bridging the gap | — | `apps/demo` |

---

## Production Pipeline

### Slide Generation Workflow

```
rxjs-wiki page  ──►  wiki-query skill  ──►  polish pass  ──►  record
(markdown)           (Marp draft in         (manual edit       (Marp → PDF
                      rxjs-wiki/slides/)     in slides-polished/) + screen capture)
```

Slide deck states tracked by file location:
- `rxjs-wiki/slides/*.md` — auto-generated draft
- `slides-polished/*.md` — record-ready (enforces 6-slide skeleton, tightened language, ASCII marble diagrams verified, wrong-way / right-way code examples present)

### Recording Workflow (per lesson)

1. Run `generate-slides.ts` → draft Marp deck in `rxjs-wiki/slides/`
2. Polish manually into `slides-polished/` (enforce 6-slide skeleton)
3. Run `check-readiness.ts` → confirm lesson is record-ready
4. Record slides portion (Marp preview in VS Code, screen capture)
5. Record live coding portion (`rxjs-spa` in VS Code)
6. Edit and export at 1080p
7. Upload section to Udemy draft

### `curriculum.json` Shape

```json
{
  "sections": [
    {
      "id": 0,
      "title": "RxJS Conceptual and Historical Roots",
      "lessons": [
        {
          "id": "0.1",
          "title": "Haskell list comprehensions and lazy sequences",
          "wikiSource": "core/frp-concepts.md",
          "companionTag": null,
          "slideStatus": "draft"
        }
      ]
    }
  ]
}
```

`slideStatus` values: `"missing"` | `"draft"` | `"polished"` | `"recorded"`

### Status Dashboard (`check-readiness.ts` output)

```
Section 0 — Historical Roots
  0.1  Haskell list comprehensions       [polished]  ✓
  0.2  LINQ and IEnumerable              [draft]     ○
  0.3  Erik Meijer / dual abstraction    [missing]   ✗

Summary: N / 46 lessons record-ready
```

---

## Scope Summary

| Metric | Value |
|---|---|
| Total sections | 11 (0–10) |
| Total lessons | 46 |
| Estimated video length | 6–9 hours |
| Udemy target | 8–12 hours |
| Companion app | `rxjs-spa` (existing monorepo) |
| Slide source | `rxjs-wiki` (30+ pages) |
| Slide format | Marp (`.md`) |
| Production repo | `rxjs-deep-dive-claude-superpowers` |
