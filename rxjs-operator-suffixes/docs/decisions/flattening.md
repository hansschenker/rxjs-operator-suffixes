---
title: "Which Flattening Operator?"
---

# Which Flattening Operator?

Each source value is projected into an inner Observable. The question is what happens to the *previous* inner when a *new* source value arrives.

```mermaid
flowchart TD
    Q1{"Cancel the previous inner\nwhen a new value arrives?"}
    Q2{"Ignore new values\nwhile an inner is active?"}
    Q3{"Must inners complete\nin source order?"}
    T1(["switchMap"]):::terminal
    T2(["exhaustMap"]):::terminal
    T3(["concatMap"]):::terminal
    T4(["mergeMap"]):::terminal

    Q1 -->|Yes| T1
    Q1 -->|No| Q2
    Q2 -->|Yes| T2
    Q2 -->|No| Q3
    Q3 -->|Yes — ordered| T3
    Q3 -->|No — concurrent| T4

    click T1 "/operators/switchMap" "switchMap — deep dive"
    click T2 "/operators/exhaustMap" "exhaustMap — deep dive"
    click T3 "/operators/concatMap" "concatMap — deep dive"
    click T4 "/operators/mergeMap" "mergeMap — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

| Operator | Concurrency | On new inner |
|---|---|---|
| `switchMap` | 1 | Cancel previous |
| `exhaustMap` | 1 | Ignore new |
| `concatMap` | 1 | Queue new |
| `mergeMap` | ∞ | Subscribe immediately |

---
→ [Category reference](../categories/flattening) · [All decision trees](../decisions/)
