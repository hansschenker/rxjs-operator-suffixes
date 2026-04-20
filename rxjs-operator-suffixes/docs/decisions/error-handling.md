---
title: "Which Error Handling Operator?"
---

# Which Error Handling Operator?

The first split: are you reacting to an upstream **error** or an upstream **completion**?

```mermaid
flowchart TD
    Q1{"Triggered by\nerror or completion?"}
    Q2A{"Re-subscribe to\nthe same source?"}
    Q2B{"Delay or condition\nbetween re-subscriptions?"}
    T1(["retry"]):::terminal
    T2(["catchError"]):::terminal
    T3(["repeat with delay"]):::terminal
    T4(["repeat"]):::terminal

    Q1 -->|Error| Q2A
    Q1 -->|Completion| Q2B
    Q2A -->|"Yes — automatic re-subscribe"| T1
    Q2A -->|"No — custom logic / fallback"| T2
    Q2B -->|Yes| T3
    Q2B -->|No| T4

    click T1 "/operators/retry" "retry — deep dive"
    click T2 "/operators/catchError" "catchError — deep dive"
    click T3 "/operators/repeatWhen" "repeatWhen — deep dive"
    click T4 "/operators/repeat" "repeat — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/error-handling) · [All decision trees](../decisions/)
