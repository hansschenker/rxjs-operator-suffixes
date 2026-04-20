---
title: "Notification Objects"
---

> Not sure which operator to use? [Decision tree →](../decisions/notification)

Operators that **reify** stream notifications into plain value objects (`Notification<T>`), or **unreify** them back into live notifications. Used for higher-order error handling, stream introspection, and testing.

## materialize

**Base:** Convert each **next**, **error**, and **complete** notification into a `Notification<T>` value object emitted on the `next` channel. After materializing, the stream never errors or completes conventionally — all lifecycle events become data.

### [materialize](../operators/materialize)()
No variants. `next(v)` → `Notification.createNext(v)`, `error(e)` → `Notification.createError(e)`, `complete()` → `Notification.createComplete()`. The resulting stream completes normally after the materialized complete notification is emitted.

---

## dematerialize

**Base:** The inverse of `materialize` — converts a stream of `Notification<T>` objects back into live next/error/complete notifications.

### [dematerialize](../operators/dematerialize)()
No variants. Typically paired with `materialize` to implement operators that manipulate notifications as values — delay an error, suppress a specific error type, or replay error events through a non-error channel.
