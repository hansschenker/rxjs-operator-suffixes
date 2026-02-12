# rxjs-dom

Fine-grained DOM text bindings powered by a TypeScript template tag and RxJS state streams.

This library focuses on a specific goal: **update only the `Text` nodes whose value depends on changed state**.
It does this by compiling template literals into:
1) a DOM tree created once per mount, and
2) a list of concrete `Text` nodes + selectors, updated only when their derived value actually changes.

## Install

```bash
npm i rxjs-dom rxjs
```

## Quick start

```ts
import { BehaviorSubject } from "rxjs";
import { html, text, mount, bind } from "rxjs-dom";

type State = { name: string; count: number };

const state$ = new BehaviorSubject<State>({ name: "Ada", count: 0 });

const template = html<State>`
  <div>
    Hello ${text(s => s.name)}.
    Count: ${text(s => s.count)}
  </div>
`;

const { instance, destroy } = mount(document.getElementById("app")!, template);

// Effects at the subscribe boundary:
const sub = bind(instance, state$);

// drive state
setInterval(() => {
  const s = state$.value;
  state$.next({ ...s, count: s.count + 1 });
}, 1000);

// later:
// sub.unsubscribe(); destroy();
```

## API

- `html<S>\`...\``: compile a template into a `Template<S>`
- `text(select)`: declare a dynamic text binding
- `mount(host, template)`: mount a template into a host element
- `bind(instance, state$)`: subscribe to an RxJS state stream and update bindings

## Notes and constraints (v0.1)

- This version supports **text bindings** only (no attribute or event directives yet).
- It is intentionally minimal: no virtual DOM diffing, no list reconciliation, no conditional blocks.
- Updates are deduplicated via `Object.is(previous, next)`.

## Roadmap

- Attribute and property directives (e.g. `attr("class", s => ...)`, `prop("value", s => ...)`)
- Event directives (e.g. `on("click", ev => ...)`)
- Conditional blocks and keyed list rendering using range markers

## Credits

This library concept and API shape were inspired by a series of design sessions with ChatGPT (GPT-5.2 Thinking), exploring a “brain/body” workflow where the model specifies architecture and acceptance criteria, and an implementation agent executes discrete coding tasks.

## License

MIT
