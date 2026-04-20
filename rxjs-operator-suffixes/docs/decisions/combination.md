---
title: "Which Combination Operator?"
---

# Which Combination Operator?

The first question divides the space cleanly: do all sources need to *complete* before you get a result?

```mermaid
flowchart TD
    Q1{"Must all sources complete\nbefore emitting?"}
    Q2A{"Pair values by position\n(1st with 1st, 2nd with 2nd)?"}
    Q2B{"Which source drives\nemission timing?"}
    Q3{"Attach latest value\nfrom secondary?"}
    Q4{"First source to\nemit wins?"}
    T1(["zip / zipWith"]):::terminal
    T2(["forkJoin"]):::terminal
    T3(["combineLatest /\ncombineLatestWith"]):::terminal
    T4(["withLatestFrom"]):::terminal
    T5(["race / raceWith"]):::terminal
    T6(["merge\n(see Flattening)"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No — continuous| Q2B
    Q2A -->|Yes| T1
    Q2A -->|No — last value each| T2
    Q2B -->|Any source emits| T3
    Q2B -->|Primary source only| Q3
    Q3 -->|Yes| T4
    Q3 -->|No| Q4
    Q4 -->|Yes| T5
    Q4 -->|No| T6

    click T1 "/operators/zip" "zip — deep dive"
    click T2 "/operators/forkJoin" "forkJoin — deep dive"
    click T3 "/operators/combineLatest" "combineLatest — deep dive"
    click T4 "/operators/withLatestFrom" "withLatestFrom — deep dive"
    click T5 "/operators/race" "race — deep dive"
    click T6 "/operators/merge" "merge — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/combination) · [All decision trees](../decisions/)
