---
module: 8
lesson: "8.3"
title: withLatestFrom — actions with context
key_insight: withLatestFrom emits only when the primary source emits, sampling the latest value from secondary sources as context. Secondary source emissions never trigger output — making it the correct operator for actions that need context.
related: ["8.1", "8.2"]
---

## Hook

Here is the most subtle `combineLatest` misuse: you want to add context to an action, so you combine the action stream with a context stream using `combineLatest`. The feature works — until a user changes a filter, and the form submission fires again on its own without anyone clicking save. The context stream triggered an output. `withLatestFrom` exists precisely to prevent this.

## Insight

`primary$.pipe(withLatestFrom(secondary$))` emits a `[primary, secondary]` tuple only when `primary$` emits. The `secondary$` observable is subscribed internally, but its emissions are silently discarded — they merely update the "latest value" slot that the next primary emission will read. This is trigger-plus-context semantics: the primary is the trigger, the secondaries are read-only context.

This asymmetry is the entire point. The primary drives the cadence. Secondary sources have zero influence over when output occurs — they only determine what additional data accompanies each primary emission.

The critical gotcha: if `secondary$` has never emitted when `primary$` fires, `withLatestFrom` silently drops the primary emission. No output, no error, no warning. The most reliable defence is `startWith(defaultValue)` on every secondary source so a value is always available. This is especially important for secondaries derived from state management or HTTP — they may not have resolved before the user triggers the primary action.

Use `withLatestFrom` for: save button click with current form state, search submit with current user credentials, pagination button with current sort and filter state, any "when X happens, read current Y" pattern.

## Example

```typescript
interface SavePayload {
	userId: string;
	formData: FormData;
}

saveBtn$.pipe(
	withLatestFrom(
		currentUser$.pipe(startWith(null)),
		formValues$.pipe(startWith({} as FormData)),
	),
	filter(([_evt, user]: [Event, User | null, FormData]) => user !== null),
	map(([_evt, user, form]: [Event, User, FormData]): SavePayload => ({
		userId: user.id,
		formData: form,
	})),
	switchMap((payload: SavePayload) => saveToApi(payload)),
	tap(() => showSuccessToast()),
).subscribe();
```

`startWith(null)` on `currentUser$` prevents silent suppression if the user triggers save before authentication resolves. The `filter` guard keeps the null case from reaching `map`. `switchMap` cancels any in-flight save if the user clicks again before the previous request completes.

## Summary

- Only the primary source triggers output; secondary sources provide context only
- Secondary emissions update an internal "latest value" slot but never produce output on their own
- Seed all secondaries with `startWith` to avoid silent suppression when the primary fires before secondaries have emitted

## Pitfall

Forgetting that `withLatestFrom` silently produces no output if the secondary source has not yet emitted. Primary emissions that arrive before the secondary has produced its first value are dropped with no error or warning. Guard with `startWith` on the secondary source when its first emission may be delayed.
