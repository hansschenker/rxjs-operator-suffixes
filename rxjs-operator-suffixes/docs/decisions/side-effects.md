---
title: "Which Side-Effect Operator?"
---

# Which Side-Effect Operator?

Both operators are transparent to the data flow — they observe without altering. The only question is *when* the effect runs.

```mermaid
flowchart TD
    Q1{"When does the\nside effect run?"}
    T1(["tap"]):::terminal
    T2(["finalize"]):::terminal

    Q1 -->|"On each emitted value"| T1
    Q1 -->|"On termination\n(complete · error · unsubscribe)"| T2

    click T1 "/operators/tap" "tap — deep dive"
    click T2 "/operators/finalize" "finalize — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/side-effects) · [All decision trees](../decisions/)
