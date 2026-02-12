export type TextBinding<S> = {
  kind: "text";
  select: (s: S) => unknown;
};

export type TemplateValue<S> = string | number | boolean | null | undefined | TextBinding<S>;

export type Template<S> = {
  /** Create a new mounted instance (clone) of the template. */
  create(): Instance<S>;
};

export type Instance<S> = {
  /** Root fragment to append into the DOM. */
  fragment: DocumentFragment;
  /** Update dynamic bindings using the provided state. */
  update(state: S): void;
  /** Cleanup resources (v0.1: noop). */
  destroy(): void;
};
