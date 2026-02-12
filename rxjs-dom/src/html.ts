import type { Instance, Template, TemplateValue, TextBinding } from "./types";
import { escapeHtml } from "./internal/escapeHtml";

type Binding<S> = {
  select: (s: S) => unknown;
  node: Text;
  last: unknown;
};

const INIT = Symbol("init");

export function html<S>(
  strings: TemplateStringsArray,
  ...values: Array<TemplateValue<S>>
): Template<S> {
  // Build an HTML string with comment markers for dynamic text slots.
  let htmlString = "";
  for (let i = 0; i < strings.length; i++) {
    htmlString += strings[i];
    if (i < values.length) {
      const v = values[i];
      if (isTextBinding<S>(v)) {
        htmlString += `<!--o:${i}-->`;
      } else {
        // Static interpolation is baked in
        htmlString += escapeHtml(String(v ?? ""));
      }
    }
  }

  const tpl = document.createElement("template");
  tpl.innerHTML = htmlString;

  const create = (): Instance<S> => {
    const fragment = tpl.content.cloneNode(true) as DocumentFragment;

    const bindings: Binding<S>[] = [];

    // Find comment markers and replace them with text nodes.
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_COMMENT);
    const comments: Comment[] = [];
    let n: Node | null;
    while ((n = walker.nextNode())) comments.push(n as Comment);

    for (const c of comments) {
      const m = /^o:(\d+)$/.exec(c.data.trim());
      if (!m) continue;

      const idx = Number(m[1]);
      const v = values[idx];
      if (!isTextBinding<S>(v)) continue;

      const t = document.createTextNode("");
      c.replaceWith(t);

      bindings.push({
        select: v.select,
        node: t,
        last: INIT,
      });
    }

    const update = (state: S) => {
      for (const b of bindings) {
        const next = b.select(state);
        if (!Object.is(next, b.last)) {
          b.last = next;
          b.node.data = next == null ? "" : String(next);
        }
      }
    };

    const destroy = () => {
      // v0.1: no resources to cleanup (future: event listeners, ranges, etc.)
    };

    return { fragment, update, destroy };
  };

  return { create };
}

function isTextBinding<S>(v: TemplateValue<S>): v is TextBinding<S> {
  return typeof v === "object" && v !== null && (v as any).kind === "text";
}
