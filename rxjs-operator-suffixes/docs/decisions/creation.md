---
title: "Which Creation Operator?"
---

# Which Creation Operator?

Creation operators produce an Observable from scratch — no upstream source needed.

```mermaid
flowchart TD
    Q1{"Adapting an\nexisting value or structure?"}
    Q2A{"What is the source?"}
    Q2B{"Time-based?"}
    Q3{"Emit once or repeatedly?"}
    Q4{"Fixed list of values?"}
    Q5{"Consecutive integers?"}
    T1(["from"]):::terminal
    T2(["fromEvent"]):::terminal
    T3(["fromEventPattern"]):::terminal
    T4(["fromFetch"]):::terminal
    T5(["timer"]):::terminal
    T6(["interval"]):::terminal
    T7(["of"]):::terminal
    T8(["range"]):::terminal
    T9(["defer / generate"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No| Q2B
    Q2A -->|"Promise / array / iterable"| T1
    Q2A -->|"DOM or Node event"| T2
    Q2A -->|"Custom add/remove handler"| T3
    Q2A -->|"Fetch API call"| T4
    Q2B -->|Yes| Q3
    Q2B -->|No| Q4
    Q3 -->|"Once after delay"| T5
    Q3 -->|Repeatedly| T6
    Q4 -->|Yes| T7
    Q4 -->|No| Q5
    Q5 -->|Yes| T8
    Q5 -->|No| T9

    click T1 "/operators/from" "from — deep dive"
    click T2 "/operators/fromEvent" "fromEvent — deep dive"
    click T3 "/operators/fromEventPattern" "fromEventPattern — deep dive"
    click T4 "/operators/fromFetch" "fromFetch — deep dive"
    click T5 "/operators/timer" "timer — deep dive"
    click T6 "/operators/interval" "interval — deep dive"
    click T7 "/operators/of" "of — deep dive"
    click T8 "/operators/range" "range — deep dive"
    click T9 "/operators/defer" "defer — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/creation) · [All decision trees](../decisions/)
