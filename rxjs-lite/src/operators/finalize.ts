import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction } from "../core/types";

export function finalize<T>(callback: () => void): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const root = new Subscription();

      const sub = source.subscribe({
        next: (v) => subscriber.next(v),
        error: (e) => subscriber.error(e),
        complete: () => subscriber.complete(),
      });

      root.add(() => sub.unsubscribe());
      root.add(() => {
        try { callback(); } catch { /* swallow */ }
      });

      return () => root.unsubscribe();
    });
}
