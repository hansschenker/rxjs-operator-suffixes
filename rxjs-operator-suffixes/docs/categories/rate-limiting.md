---
title: "Rate Limiting"
---

> Not sure which operator to use? [Decision tree →](../decisions/rate-limiting)

Control the **pace** of emissions by selectively suppressing values within a time window. All four families are **lossy** — values that fall in the suppression window are silently dropped. The `Time` suffix replaces a trigger Observable with a plain millisecond duration.

## audit

**Base:** After a source value arrives, open a silence window and emit the **most recent** value at the end of that window. Ignores all intermediate values during the window.

### [auditTime](../operators/auditTime)(duration, scheduler?)
The silence window is a fixed millisecond duration. Equivalent to `audit(() => timer(duration))`.

---

## debounce

**Base:** Emit a value only after the source has been **silent** for the full window duration. Resets the timer on every new emission — only the last value in a rapid burst passes through.

### [debounceTime](../operators/debounceTime)(dueTime, scheduler?)
The silence window is a fixed millisecond duration. Standard operator for search-as-you-type — waits until the user stops typing before firing.

---

## sample

**Base:** Emit the **most recent** source value whenever a separate **notifier** Observable emits. If the source has not emitted since the last sample, nothing is emitted.

### [sampleTime](../operators/sampleTime)(period, scheduler?)
The notifier is a regular interval — samples the source every `period` milliseconds.

---

## throttle

**Base:** Emit the **first** value in a burst, then suppress all subsequent values for the duration. The inverse of `debounce` — the leading edge wins, the trailing burst is silenced.

### [throttleTime](../operators/throttleTime)(duration, scheduler?, config?)
The suppression window is a fixed millisecond duration. Default config `{ leading: true, trailing: false }` — set `trailing: true` to also emit the last value after the window expires.

---
