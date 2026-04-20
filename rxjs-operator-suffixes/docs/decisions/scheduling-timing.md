---
title: "Which Scheduling or Timing Operator?"
---

# Which Scheduling or Timing Operator?

Start by asking whether you are *creating* a new time-based Observable or *decorating* an existing stream.

```mermaid
flowchart TD
    Q1{"Creating a new\ntime-based Observable?"}
    Q2A{"Emit once or repeatedly?"}
    Q2B{"Adding a delay to\nthe existing stream?"}
    Q3{"Fixed offset or per-value?"}
    Q4{"What do you need?"}
    T1(["timer"]):::terminal
    T2(["interval"]):::terminal
    T3(["delay"]):::terminal
    T4(["delayWhen"]):::terminal
    T5(["observeOn"]):::terminal
    T6(["subscribeOn"]):::terminal
    T7(["timeInterval"]):::terminal
    T8(["timestamp"]):::terminal
    T9(["timeout"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No| Q2B
    Q2A -->|"Once after delay"| T1
    Q2A -->|Repeatedly| T2
    Q2B -->|Yes| Q3
    Q2B -->|No| Q4
    Q3 -->|"Fixed offset"| T3
    Q3 -->|"Per-value Observable"| T4
    Q4 -->|"Move notification delivery"| T5
    Q4 -->|"Move subscription context"| T6
    Q4 -->|"Elapsed-time metadata"| T7
    Q4 -->|"Wall-clock timestamp"| T8
    Q4 -->|"Error if source goes silent"| T9

    click T1 "/operators/timer" "timer — deep dive"
    click T2 "/operators/interval" "interval — deep dive"
    click T3 "/operators/delay" "delay — deep dive"
    click T4 "/operators/delayWhen" "delayWhen — deep dive"
    click T5 "/operators/observeOn" "observeOn — deep dive"
    click T6 "/operators/subscribeOn" "subscribeOn — deep dive"
    click T7 "/operators/timeInterval" "timeInterval — deep dive"
    click T8 "/operators/timestamp" "timestamp — deep dive"
    click T9 "/operators/timeout" "timeout — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/scheduling-timing) · [All decision trees](../decisions/)
