---
module: 8
lesson: "8.2"
title: combineLatest — reactive derived state
key_insight: combineLatest emits whenever any source emits, always combining the latest value from every source. It is the reactive equivalent of a derived computation — automatically recomputed when any dependency changes.
related: ["8.1", "8.3"]
---

## Hook

In a spreadsheet, a formula cell recomputes automatically whenever any of its input cells changes — you do not have to tell it to update. `combineLatest` gives streams the same behaviour: derived state that recomputes whenever any dependency changes. That analogy also reveals the gotcha: if two input cells update in the same tick, the formula fires twice. The same thing happens here.

## Insight

`combineLatest([a$, b$, c$])` emits a `[a, b, c]` tuple whenever any of the three sources emits a new value, always pairing each emission with the most recent cached value from every other source. It does not emit until every source has emitted at least once — sources that are slow to produce their first value block the entire combination.

The standard fix is `startWith(defaultValue)` on any source that might be slow. An HTTP request that takes 500ms keeps `combineLatest` silent until it resolves — seeding it with `startWith(null)` unblocks the combination immediately while the real data loads.

The glitch problem: if two sources emit synchronously in the same JavaScript microtask, `combineLatest` fires twice in quick succession. The first emission carries an intermediate mixed state (new value from source A, stale value from source B) before the second emission stabilises. This can cause double renders, redundant API calls, or incorrect intermediate state. The practical defence is `distinctUntilChanged()` placed after the `map` projection — it suppresses re-emissions when the projected result is the same, which covers the most common case where intermediate mixed state produces the same output as the final state.

Use `combineLatest` for: form validity derived from multiple fields, dashboard panels that depend on both user state and filter state, any derived stream where every input change should recompute the output.

## Example

```typescript
interface FormValidity {
	emailOk: boolean;
	passwordOk: boolean;
	valid: boolean;
}

const formValid$ = combineLatest([
	emailControl.valueChanges.pipe(startWith('')),
	passwordControl.valueChanges.pipe(startWith('')),
]).pipe(
	map(([email, password]: [string, string]): FormValidity => ({
		emailOk: email.includes('@'),
		passwordOk: password.length >= 8,
		valid: email.includes('@') && password.length >= 8,
	})),
	distinctUntilChanged((a: FormValidity, b: FormValidity) => a.valid === b.valid),
	shareReplay(1),
);
```

`startWith('')` ensures `combineLatest` emits immediately on subscription rather than waiting for the user to type. `distinctUntilChanged` prevents re-rendering the submit button every time intermediate glitch emissions pass through while the overall `valid` flag has not changed.

## Summary

- Emits on any source change; always uses the latest cached value from every source
- Requires all sources to have emitted at least once — use `startWith` to seed slow sources
- Use `distinctUntilChanged` after the projection to suppress glitch emissions when sources fire synchronously
