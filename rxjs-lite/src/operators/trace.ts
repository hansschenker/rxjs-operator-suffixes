import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction } from "../core/types";

/**
 * trace(label)
 *
 * Learning-first operator that logs the lifecycle of a stream:
 * - subscribe
 * - next(value)
 * - error(err)
 * - complete
 * - unsubscribe (teardown)
 *
 * Intended for debugging/education, not for production logging pipelines.
 */
export function trace<T>(
  label: string,
  log: (...args: unknown[]) => void = console.log,
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const root = new Subscription();
      let closed = false;

      log(`[${label}] subscribe`);

      const srcSub = source.subscribe({
        next: (v) => {
          log(`[${label}] next`, v);
          subscriber.next(v);
        },
        error: (e) => {
          log(`[${label}] error`, e);
          subscriber.error(e);
        },
        complete: () => {
          log(`[${label}] complete`);
          subscriber.complete();
        },
      });

      root.add(() => srcSub.unsubscribe());
      root.add(() => {
        if (closed) return;
        closed = true;
        log(`[${label}] unsubscribe`);
      });

      return () => root.unsubscribe();
    });
}
