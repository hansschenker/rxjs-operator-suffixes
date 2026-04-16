---
module: 5
lesson: "5.3"
title: The throttle and debounce families
key_insight: throttle gives immediate feedback then blocks; debounce waits for silence then emits. Using debounce where you need responsiveness — or throttle where you need to wait for completion — ships a visibly broken interaction.
---

## Hook

Throttle and debounce both reduce emission frequency, so developers often treat them as interchangeable configuration knobs — just pick a millisecond value and move on. They are not interchangeable. A UI that uses `debounceTime` where it needs `throttleTime` feels laggy: the user clicks a button and nothing happens until they stop clicking. A search box that uses `throttleTime` where it needs `debounceTime` fires mid-word, fetching results for incomplete queries on every burst boundary. Each mistake is perceptible to every user on every interaction.

## Insight

The two families differ on one axis: when relative to a burst does the emission happen?

**`throttleTime(ms)`** emits the first value of a burst immediately, then ignores all subsequent values for the specified duration. This is leading-edge behavior. The user always gets instant feedback — the emission fires the moment the burst begins. Rate-limiting happens after that immediate response; the silent period is a cooldown, not a delay. Best for: scroll handlers, resize events, mouse move, game input, any scenario where instant response is critical and rate-limiting is a background concern that the user should never feel.

**`debounceTime(ms)`** waits until a specified period of silence has elapsed since the last emission, then emits the most recent value. This is trailing-edge behavior. Nothing fires until the burst has ended. The longer or faster the burst, the longer the wait before anything emits. Best for: search typeahead, form validation, autocomplete — any scenario where you want to wait until the user has finished a thought before acting on it.

Both families also have signal variants — `throttle(signal$)` and `debounce(fn)` — that accept a factory returning an Observable. This enables adaptive window durations: a fast network might use a shorter debounce window; a slow one might use a longer one, driven dynamically by another stream. Both variants are lossy.

## Example

The same rapid input sequence through both operators makes the behavioral difference concrete:

```
source:          --a-b-c---------d-e-f--|
throttleTime(3): --a-------------d------|   (emits at burst start, then blocks)
debounceTime(3): ----------c---------f-|   (emits after silence, most recent value)
```

`throttleTime` responds the instant the burst starts and emits `a` — the first value. `debounceTime` says nothing until the burst ends and emits `c` — the last value before the silence. On the second burst the same pattern repeats: throttle fires `d` immediately; debounce waits and fires `f`.

The practical read: throttle tells the user "I heard you right now"; debounce tells the system "the user has finished, here is what they said."

## Summary

- throttle = leading edge (immediate response, then block); debounce = trailing edge (wait for silence, emit last value)
- Use throttle for responsive interactions where the user must feel immediate feedback: scroll, drag, resize, game input
- Use debounce for "user has finished" signals where acting mid-burst is wrong: search typeahead, form validation, autocomplete
