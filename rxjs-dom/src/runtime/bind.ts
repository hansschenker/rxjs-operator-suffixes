import type { Observable, Subscription } from "rxjs";
import type { Instance } from "../types";

/**
 * Subscribe to an RxJS state stream and update bindings.
 * This is the intended side-effect boundary: DOM mutations happen here.
 */
export function bind<S>(instance: Instance<S>, state$: Observable<S>): Subscription {
  return state$.subscribe({
    next: (s) => instance.update(s),
  });
}
