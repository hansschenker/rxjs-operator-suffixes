import type { TextBinding } from "../types";

export const text = <S>(select: (s: S) => unknown): TextBinding<S> => ({
  kind: "text",
  select,
});
