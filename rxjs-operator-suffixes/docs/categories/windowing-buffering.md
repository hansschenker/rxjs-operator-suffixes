---
title: "Windowing & Buffering"
---

> Not sure which to use? [Decision tree →](../decisions/windowing-buffering)

Collect source emissions into **groups** instead of passing them one by one. `buffer` emits **arrays**, `window` emits **Observables**. The suffix controls the boundary condition that closes each group.

## buffer

**Base:** Accumulate source values into an array; emit the array when a boundary is triggered. Non-lossy — every value is kept until the flush.

### [bufferCount](../operators/bufferCount)(count, startBufferEvery?)
Flushes when the buffer has collected exactly `count` values. With `startBufferEvery`, a new overlapping buffer starts every N values.

### [bufferTime](../operators/bufferTime)(timeSpan, interval?, maxBufferSize?)
Flushes on a fixed time boundary. Emits an empty array if the source is silent during a window.

### [bufferToggle](../operators/bufferToggle)(openings$, closingSelector)
Opens a buffer when `openings$` emits; closes it when the Observable returned by `closingSelector` emits. Multiple overlapping buffers are possible simultaneously.

### [bufferWhen](../operators/bufferWhen)(closingSelector)
Opens one buffer immediately; closes and re-opens it each time the Observable returned by `closingSelector` emits.

---

## window

**Base:** Like `buffer` but emits an **Observable** (the window) for each group instead of a plain array. Downstream operators can process each window as a live stream before it completes.

### [windowCount](../operators/windowCount)(windowSize, startWindowEvery?)
Emits a new inner Observable every `windowSize` values.

### [windowTime](../operators/windowTime)(windowTimeSpan, windowCreationInterval?, maxWindowSize?)
Emits a new inner Observable on a fixed time boundary.

### [windowToggle](../operators/windowToggle)(openings$, closingSelector)
Opens a window when `openings$` emits; closes it when the returned Observable emits.

### [windowWhen](../operators/windowWhen)(closingSelector)
Closes and re-opens a window each time the closing Observable emits.

---
