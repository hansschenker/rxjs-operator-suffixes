---
title: RxJS Value-based Time-based
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:31:05 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:01:01 GMT+0100 (Central European Standard Time)
---


Rxjs operators are either time-based operators or value-based operators

Message: # Categorization of RxJS Operators: Time-Based vs. Value-Based


## Value-Based Operators
- Focus on transforming, filtering, or manipulating the actual data values emitted by an Observable.
- Examples include:
    - **Transformation Operators:** `map`, `filter`, `pluck`, `scan`, `reduce`
    - **Filtering Operators:** `distinct`, `take`, `skip`
    - **Mathematical and Aggregate Operators:** `count`, `max`, `min`
- These operators operate on the content of the stream regardless of timing.

## Time-Based Operators
- Deal with timing, scheduling, and temporal aspects of streams.
- Examples include:
    - `debounceTime`, `throttleTime`, `delay`, `timeout`, `auditTime`, `sampleTime`
    - Creation operators related to time: `interval`, `timer`
- These operators control when values are emitted, delayed, or sampled based on time intervals.


---

Understanding this distinction helps in selecting the right operators depending on whether the focus is on the data values themselves or on the timing and scheduling of their emissions. ([[RxJS - RxJS Operators]]), ([[rxjs-frp-claud-ai-new]])





