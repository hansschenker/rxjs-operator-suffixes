---
module: 7
lesson: "7.5"
title: exhaustMap — ignore while busy, prevent double-submit
key_insight: exhaustMap ignores all new outer values while an inner Observable is active, making double-execution structurally impossible — and intentionally dropping user intent if the inner Observable takes too long.
---

## Hook

A user clicks "Submit" twice because the network is slow. With `mergeMap`, two requests fire simultaneously. With `switchMap`, the first is cancelled and only the second runs. With `exhaustMap`, the second click is silently ignored and only the first runs. For a payment form, only one of these three behaviors is correct — and it is the one that most developers never think to reach for.

## Insight

When an inner Observable is active, `exhaustMap` drops all new outer values. Not queues them, not cancels the running one — drops them permanently with no signal. When the inner Observable completes (or errors), the operator becomes receptive again and the next outer value will start a new inner Observable.

Concurrency is either 0 (idle, will accept the next outer value) or 1 (busy, discarding everything). This makes double-execution structurally impossible — not by adding a loading boolean flag, not by disabling a button in the DOM, but by the operator's definition. The protection exists in the data layer, not in the view layer.

`exhaustMap` is the correct choice for: login buttons, form submit buttons, payment triggers, confirmation dialogs, any user action that must not execute twice before completing. It expresses the intent "start this work; ignore repeated requests until it is done" in a single operator.

The risk is the mirror of `concatMap`'s risk: where `concatMap` queues too much, `exhaustMap` discards too much. If the inner Observable never completes — a stuck HTTP request, a hanging WebSocket call — `exhaustMap` will silently ignore all subsequent outer values permanently. The operator is only as reliable as the inner Observable's termination guarantee. Always pair `exhaustMap` with a `timeout` on the inner Observable as a safety net, and handle the timeout error with `catchError` returning `EMPTY` to reset the operator to its receptive state.

## Example

```typescript
interface LoginResult { token: string; userId: number; }

// Prevent double-login — rapid clicks are structurally ignored
loginBtn$.pipe(
	exhaustMap(() =>
		authService.login(credentials).pipe(
			timeout(10000), // safety: fail if login hangs for 10 seconds
			catchError((err: Error) => {
				tap(() => showError(err.message));
				return EMPTY; // complete inner Observable so exhaustMap resets
			}),
		)
	),
).subscribe((result: LoginResult) => navigateToDashboard(result));
```

Without `timeout`, a hung login request would leave `exhaustMap` permanently busy — no subsequent login attempt would ever fire. Returning `EMPTY` from `catchError` ensures the operator returns to its idle state even on failure, so the user can try again.

## Summary

- `exhaustMap` drops all outer values while an inner Observable is active — double-execution is structurally impossible without any flag or DOM manipulation
- Use for submit buttons, login, payment triggers, and any action that must not run twice concurrently
- Inner Observables must be guaranteed to terminate — use `timeout` as a safety net and return `EMPTY` from `catchError` to reset the operator to its receptive state
