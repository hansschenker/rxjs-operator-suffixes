import { describe, it, expect } from "vitest";
import { html, text } from "../src/index";
import { JSDOM } from "jsdom";

describe("rxjs-dom (v0.1) text bindings", () => {
  it("updates only the bound text node when state changes", () => {
    const dom = new JSDOM("<!doctype html><div id='app'></div>");
    // @ts-expect-error - bind globals for this test
    globalThis.document = dom.window.document;
    // @ts-expect-error - bind globals for this test
    globalThis.NodeFilter = dom.window.NodeFilter;

    type S = { name: string; count: number };

    const tpl = html<S>`<div>Hello ${text(s => s.name)}. Count: ${text(s => s.count)}</div>`;
    const inst = tpl.create();

    const host = dom.window.document.getElementById("app")!;
    host.appendChild(inst.fragment);

    inst.update({ name: "Ada", count: 0 });
    expect(host.textContent).toBe("Hello Ada. Count: 0");

    // Update only count
    inst.update({ name: "Ada", count: 1 });
    expect(host.textContent).toBe("Hello Ada. Count: 1");

    // Update only name
    inst.update({ name: "Bob", count: 1 });
    expect(host.textContent).toBe("Hello Bob. Count: 1");
  });

  it("treats null/undefined as empty string", () => {
    const dom = new JSDOM("<!doctype html><div id='app'></div>");
    // @ts-expect-error - bind globals for this test
    globalThis.document = dom.window.document;
    // @ts-expect-error - bind globals for this test
    globalThis.NodeFilter = dom.window.NodeFilter;

    type S = { v?: string | null };

    const tpl = html<S>`<div>${text(s => s.v)}</div>`;
    const inst = tpl.create();
    const host = dom.window.document.getElementById("app")!;
    host.appendChild(inst.fragment);

    inst.update({ v: null });
    expect(host.textContent).toBe("");

    inst.update({ v: undefined });
    expect(host.textContent).toBe("");

    inst.update({ v: "x" });
    expect(host.textContent).toBe("x");
  });
});
