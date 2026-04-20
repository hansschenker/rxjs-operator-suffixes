---
title: "Which Rate-Limiting Operator?"
---

# Which Rate-Limiting Operator?

All four families are lossy — values that fall in the suppression window are dropped. The key question is which edge of a burst should survive.

```mermaid
flowchart TD
    Q1{"Which edge of the burst\nshould emit?"}
    Q2{"Must the source be silent\nfor the full window duration?"}
    Q3{"What triggers\nthe emission?"}
    T1(["throttle / throttleTime"]):::terminal
    T2(["debounce / debounceTime"]):::terminal
    T3(["audit / auditTime"]):::terminal
    T4(["sample / sampleTime"]):::terminal

    Q1 -->|"Leading — first value wins"| T1
    Q1 -->|"Trailing — last value wins"| Q2
    Q2 -->|Yes — silence required| T2
    Q2 -->|No| Q3
    Q3 -->|"End of a fixed window"| T3
    Q3 -->|"External notifier fires"| T4

    click T1 "/operators/throttle" "throttle — deep dive"
    click T2 "/operators/debounce" "debounce — deep dive"
    click T3 "/operators/audit" "audit — deep dive"
    click T4 "/operators/sample" "sample — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/rate-limiting) · [All decision trees](../decisions/)
