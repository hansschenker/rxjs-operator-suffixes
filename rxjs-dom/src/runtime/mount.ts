import type { Instance, Template } from "../types";

export function mount<S>(host: Element, template: Template<S>): { instance: Instance<S>; destroy: () => void } {
  const instance = template.create();
  host.appendChild(instance.fragment);

  const destroy = () => {
    instance.destroy();
    // If the host should be cleared, users can do it explicitly; we avoid surprise deletions.
  };

  return { instance, destroy };
}
