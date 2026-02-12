# Codex Task Pack: rxjs-dom

Use this document as a set of “work orders” for an implementation agent (e.g., Codex).
Each task includes scope, acceptance criteria, and suggested tests.

## How to work

- One task per branch.
- Implement + tests in the same PR.
- Keep the public API stable; add new APIs as additive.
- Avoid large refactors unless explicitly required by the task.

## Task 1 — Add attribute directive

**Goal:** Support a directive to update element attributes based on state, without re-render.

**Proposed API:**
- `attr(name, select)` used as an interpolation in attribute position, e.g.
  - `<div class="${attr("class", s => s.isActive ? "on" : "off")}">...</div>`

**Acceptance criteria:**
- Mount creates the element once.
- On update, only the attribute is mutated when derived value changes.
- Values `null | undefined | false` remove the attribute; otherwise set to `String(value)`.

**Tests:**
- initial mount sets correct attribute
- update changes attribute
- update with same value does not write (spy via MutationObserver or instrumented setter)

## Task 2 — Add `prop` directive

Like `attr`, but writes `(el as any)[name] = value` for properties such as `value`, `checked`.

## Task 3 — Add `on` directive (event listeners)

**Goal:** Attach an event listener once at mount time.

**Proposed API:**
- `on(type, handler)` where handler receives `(event, stateSnapshot?)` (decide and document)

**Acceptance criteria:**
- Listeners are added once and removed on `destroy()`.
- No listener duplication on repeated updates.

## Task 4 — Conditional blocks (range directive)

Implement a `when(predicate, thenTemplate, elseTemplate?)` that mounts/unmounts subtrees using start/end comment markers.

## Task 5 — Keyed lists (repeat)

Implement `repeat(selectItems, keyFn, itemTemplateFn)` with minimal DOM moves.

## Non-functional tasks

- Add ESLint + formatting
- Add CI workflow (GitHub Actions): typecheck, test, build
