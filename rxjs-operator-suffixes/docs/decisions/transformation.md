---
title: "Which Transformation Operator?"
---

# Which Transformation Operator?

Transformation operators reshape each emission without changing which values pass or how subscriptions work.

```mermaid
flowchart TD
    Q1{"One value in,\none value out — no state?"}
    Q2A{"Map every value\nto the same constant?"}
    Q2B{"Need to carry\naccumulated state?"}
    Q3{"What structural change?"}
    T1(["mapTo"]):::terminal
    T2(["map"]):::terminal
    T3(["scan"]):::terminal
    T4(["expand"]):::terminal
    T5(["pairwise"]):::terminal
    T6(["groupBy"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No| Q2B
    Q2A -->|Yes| T1
    Q2A -->|No| T2
    Q2B -->|Yes| T3
    Q2B -->|No| Q3
    Q3 -->|"Recursive projection"| T4
    Q3 -->|"Consecutive pairs → tuple"| T5
    Q3 -->|"Split stream by key"| T6

    click T1 "/operators/mapTo" "mapTo — deep dive"
    click T2 "/operators/map" "map — deep dive"
    click T3 "/operators/scan" "scan — deep dive"
    click T4 "/operators/expand" "expand — deep dive"
    click T5 "/operators/pairwise" "pairwise — deep dive"
    click T6 "/operators/groupBy" "groupBy — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/transformation) · [All decision trees](../decisions/)
