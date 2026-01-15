import { Observable } from "../core/Observable";
import type { OperatorFunction } from "../core/types";

export function map<T, R>(project: (value: T) => R): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>((subscriber) => {
      const sub = source.subscribe({
        next: (v) => subscriber.next(project(v)),
        error: (e) => subscriber.error(e),
        complete: () => subscriber.complete(),
      });
      return () => sub.unsubscribe();
    });
}
