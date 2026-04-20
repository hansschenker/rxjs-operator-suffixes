---
title: "Which Notification Operator?"
---

# Which Notification Operator?

`materialize` and `dematerialize` are inverse pairs — one converts events *to* objects, the other converts objects *back to* events.

```mermaid
flowchart TD
    Q1{"Direction of conversion?"}
    T1(["materialize"]):::terminal
    T2(["dematerialize"]):::terminal

    Q1 -->|"Notifications → Notification objects"| T1
    Q1 -->|"Notification objects → notifications"| T2

    click T1 "/operators/materialize" "materialize — deep dive"
    click T2 "/operators/dematerialize" "dematerialize — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/notification) · [All decision trees](../decisions/)
