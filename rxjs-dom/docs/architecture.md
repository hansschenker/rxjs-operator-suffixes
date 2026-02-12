# Architecture

## Goal

Achieve “virtual-DOM-like” efficiency for text updates **without** a DOM diff:
- create DOM once per mount
- track explicit text bindings
- on state updates, recompute only bindings and mutate only changed `Text` nodes

This is closer to *fine-grained reactivity* than classic VDOM.

## Components

- `html<S>` template tag
  - produces a `Template<S>` that holds an underlying `<template>` element
  - dynamic text slots are emitted as `<!--o:i-->` comment markers

- `Template<S>.create()`
  - clones the underlying template DOM
  - locates comment markers
  - replaces each marker with a concrete `Text` node
  - records `(Text node, selector, lastValue)` as a binding

- `Instance<S>.update(state)`
  - runs each selector against the state
  - compares with `Object.is`
  - writes only changed text nodes (`textNode.data = ...`)

- `bind(instance, state$)`
  - subscribes to state$
  - calls instance.update(state) as the side effect at the subscription boundary

## Non-goals (v0.1)

- attribute/property/event directives
- structural control flow (if/for)
- keyed diffing / list reconciliation

These can be added later with range markers (start/end comments) and per-range mounts.
