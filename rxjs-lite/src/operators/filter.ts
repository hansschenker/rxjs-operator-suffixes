import { Observable } from "../core/Observable";
import type { OperatorFunction } from "../core/types";

export function filter<T>(predicate: (value: T) => boolean): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const sub = source.subscribe({
        next: (v) => {
          if (predicate(v)) subscriber.next(v);
        },
        error: (e) => subscriber.error(e),
        complete: () => subscriber.complete(),
      });
      return () => sub.unsubscribe();
    });
}
