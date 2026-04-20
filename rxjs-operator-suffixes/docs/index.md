---
layout: home

hero:
  name: RxJS Operator Suffixes
  text: Naming conventions behind the RxJS API
  tagline: Every RxJS operator name encodes its behaviour. This reference explains the base concepts and what each suffix adds.
  actions:
    - theme: brand
      text: Operator Suffixes Reference
      link: /rxjs-operator-name-suffixes
    - theme: alt
      text: Full API List
      link: /rxjs-api-function-list

features:
  - title: Higher-Order / Flattening
    details: concat, exhaust, merge, switch — four inner-subscription strategies that determine concurrency, cancellation, and ordering.
  - title: Windowing & Buffering
    details: buffer and window collect emissions into groups. The suffix controls the boundary — count, time, toggle, or predicate.
  - title: Rate Limiting
    details: audit, debounce, sample, throttle — four lossy timing strategies. The Time suffix swaps a trigger Observable for a plain millisecond duration.
  - title: Transformation
    details: map, scan, expand, pairwise, groupBy — reshape each emission without changing which values pass or how many subscriptions exist.
  - title: Filtering
    details: distinct, find, skip, take, first, last, single, elementAt, defaultIfEmpty, throwIfEmpty — drop or select values by identity, position, count, or predicate.
  - title: Combination
    details: combine, zip, race, forkJoin, withLatestFrom, start, end — join multiple streams by latest-value, positional, first-wins, or all-complete strategies.
  - title: Creation
    details: from, of, range, interval, defer, generate — produce an Observable from scratch; the base name describes the origin of the values.
  - title: Multicasting & Sharing
    details: publish and share control how many upstream subscriptions exist. The suffix selects the Subject variant used internally.
  - title: Error Handling & Recovery
    details: retry, catchError, repeat — re-subscribe on error or completion; intercept and replace error streams.
  - title: Side Effects & Notification
    details: tap, finalize, materialize, dematerialize — observe lifecycle events without altering the stream, or reify notifications as values.
---
