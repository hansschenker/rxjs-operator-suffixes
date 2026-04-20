---
title: "Which Filtering Operator?"
---

# Which Filtering Operator?

Filtering has two distinct axes: **position/count** (where in the sequence) and **value/predicate** (what the value is). Use the diagram that matches your question.

## By Position or Count

```mermaid
flowchart TD
    Q1{"Do you know\nthe exact index?"}
    Q2{"Skip or take?"}
    Q3A{"Boundary condition?"}
    Q3B{"Boundary condition?"}
    T1(["elementAt"]):::terminal
    T2(["skip"]):::terminal
    T3(["skipWhile"]):::terminal
    T4(["skipUntil"]):::terminal
    T5(["skipLast"]):::terminal
    T6(["take"]):::terminal
    T7(["takeWhile"]):::terminal
    T8(["takeUntil"]):::terminal
    T9(["takeLast"]):::terminal

    Q1 -->|Yes| T1
    Q1 -->|No| Q2
    Q2 -->|Skip — suppress from start| Q3A
    Q2 -->|Take — pass from start| Q3B
    Q3A -->|Count| T2
    Q3A -->|Predicate| T3
    Q3A -->|Notifier fires| T4
    Q3A -->|From the end| T5
    Q3B -->|Count| T6
    Q3B -->|Predicate| T7
    Q3B -->|Notifier fires| T8
    Q3B -->|From the end| T9

    click T1 "/operators/elementAt" "elementAt — deep dive"
    click T2 "/operators/skip" "skip — deep dive"
    click T3 "/operators/skipWhile" "skipWhile — deep dive"
    click T4 "/operators/skipUntil" "skipUntil — deep dive"
    click T5 "/operators/skipLast" "skipLast — deep dive"
    click T6 "/operators/take" "take — deep dive"
    click T7 "/operators/takeWhile" "takeWhile — deep dive"
    click T8 "/operators/takeUntil" "takeUntil — deep dive"
    click T9 "/operators/takeLast" "takeLast — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

## By Value or Predicate

```mermaid
flowchart TD
    Q1{"Suppress consecutive\nduplicates?"}
    Q2A{"Compare full value\nor one key?"}
    Q2B{"How many results\ndo you want?"}
    Q3{"Need the index,\nnot the value?"}
    Q4{"Source must not\nbe empty?"}
    T1(["distinctUntilChanged"]):::terminal
    T2(["distinctUntilKeyChanged"]):::terminal
    T3(["first / find"]):::terminal
    T4(["findIndex"]):::terminal
    T5(["last"]):::terminal
    T6(["single"]):::terminal
    T7(["filter"]):::terminal
    T8(["defaultIfEmpty"]):::terminal
    T9(["throwIfEmpty"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No| Q2B
    Q2A -->|Full value| T1
    Q2A -->|One key| T2
    Q2B -->|First match| Q3
    Q2B -->|Last match| T5
    Q2B -->|Exactly one| T6
    Q2B -->|All matching| T7
    Q2B -->|Guard on empty| Q4
    Q3 -->|Yes| T4
    Q3 -->|No| T3
    Q4 -->|Emit a default| T8
    Q4 -->|Error| T9

    click T1 "/operators/distinctUntilChanged" "distinctUntilChanged — deep dive"
    click T2 "/operators/distinctUntilKeyChanged" "distinctUntilKeyChanged — deep dive"
    click T3 "/operators/first" "first — deep dive"
    click T4 "/operators/findIndex" "findIndex — deep dive"
    click T5 "/operators/last" "last — deep dive"
    click T6 "/operators/single" "single — deep dive"
    click T7 "/operators/filter" "filter — deep dive"
    click T8 "/operators/defaultIfEmpty" "defaultIfEmpty — deep dive"
    click T9 "/operators/throwIfEmpty" "throwIfEmpty — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/filtering) · [All decision trees](../decisions/)
