---
title: "Which Multicasting Operator?"
---

# Which Multicasting Operator?

All multicasting operators share one upstream subscription. The questions are whether you need replay and whether you need explicit `connect()` control.

```mermaid
flowchart TD
    Q1{"Need explicit connect\ncontrol? — legacy pattern"}
    Q2A{"Which Subject variant\ninternally?"}
    Q2B{"Replay buffered values\nto late subscribers?"}
    T1(["publishBehavior"]):::terminal
    T2(["publishLast"]):::terminal
    T3(["publishReplay"]):::terminal
    T4(["shareReplay"]):::terminal
    T5(["share"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No — modern| Q2B
    Q2A -->|BehaviorSubject| T1
    Q2A -->|AsyncSubject| T2
    Q2A -->|ReplaySubject| T3
    Q2B -->|Yes| T4
    Q2B -->|No| T5

    click T1 "/operators/publishBehavior" "publishBehavior — deep dive"
    click T2 "/operators/publishLast" "publishLast — deep dive"
    click T3 "/operators/publishReplay" "publishReplay — deep dive"
    click T4 "/operators/shareReplay" "shareReplay — deep dive"
    click T5 "/operators/share" "share — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/multicasting) · [All decision trees](../decisions/)
