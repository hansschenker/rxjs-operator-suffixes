import { Observable } from "../core/Observable";
import type { OperatorFunction } from "../core/types";

export function scan<T, S>(accumulator: (state: S, value: T) => S, seed: S): OperatorFunction<T, S> {
  return (source: Observable<T>) =>
    new Observable<S>((subscriber) => {
      let state = seed;
      const sub = source.subscribe({
        next: (v) => {
          state = accumulator(state, v);
          subscriber.next(state);
        },
        error: (e) => subscriber.error(e),
        complete: () => subscriber.complete(),
      });
      return () => sub.unsubscribe();
    });
}
