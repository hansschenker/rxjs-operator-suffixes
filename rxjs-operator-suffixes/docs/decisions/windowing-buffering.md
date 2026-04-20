---
title: "Which Windowing or Buffering Operator?"
---

# Which Windowing or Buffering Operator?

Both families collect source emissions into groups. The first question is the output type; the second is what triggers the group boundary.

```mermaid
flowchart TD
    Q1{"Output type?"}
    Q2A{"Boundary trigger?"}
    Q2B{"Boundary trigger?"}
    T1(["bufferCount"]):::terminal
    T2(["bufferTime"]):::terminal
    T3(["bufferWhen /\nbufferToggle"]):::terminal
    T4(["windowCount"]):::terminal
    T5(["windowTime"]):::terminal
    T6(["windowWhen /\nwindowToggle"]):::terminal

    Q1 -->|"Array — emit when full"| Q2A
    Q1 -->|"Observable — process live"| Q2B
    Q2A -->|Count| T1
    Q2A -->|Time| T2
    Q2A -->|Event| T3
    Q2B -->|Count| T4
    Q2B -->|Time| T5
    Q2B -->|Event| T6

    click T1 "/operators/bufferCount" "bufferCount — deep dive"
    click T2 "/operators/bufferTime" "bufferTime — deep dive"
    click T3 "/operators/bufferWhen" "bufferWhen — deep dive"
    click T4 "/operators/windowCount" "windowCount — deep dive"
    click T5 "/operators/windowTime" "windowTime — deep dive"
    click T6 "/operators/windowWhen" "windowWhen — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/windowing-buffering) · [All decision trees](../decisions/)
