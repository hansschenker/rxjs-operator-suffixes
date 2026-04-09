---
title: TIL: auditTime’s Completion Behaviour Is Unlike debounceTime’s
tags:
  - "Programming/RxJS"
createdAt: Sun Sep 28 2025 13:41:48 GMT+0200 (Central European Summer Time)
updatedAt: Sun Sep 28 2025 13:41:56 GMT+0200 (Central European Summer Time)
---


Detailed summary

- The debounceTime and auditTime operators in RxJS are similar, but they have distinct behaviors, particularly in terms of how they handle intermediate next notifications and completion within a specified time window.
- The key difference between debounceTime and auditTime is that debounceTime resets its internal timer whenever a new notification is received within the time window, whereas auditTime does not reset its timer, resulting in different emission patterns for the most-recently-received value.
- When it comes to completion behavior, debounceTime and auditTime exhibit different characteristics: debounceTime completes immediately and emits the most-recently-received value if completion occurs within the time window, whereas auditTime completes immediately without emitting the most-recently-received value if completion occurs within the time window.
- The reason behind auditTime's completion behavior is that its purpose is to emit the audited value when it receives a signal from its notifier, the timer, and if the source completes before the operator receives a signal, there is no final emission.
- In contrast, debounceTime's purpose is to emit the most-recently-received value after a source has not emitted notifications for the specified duration, so if the source completes, the operator can be sure that no further values will be received and the most-recently-received value can be emitted, which is why it behaves differently than auditTime in terms of completion.




## Sources
- [website](https://ncjamieson.com/til-audittime-completion-behaviour/)
