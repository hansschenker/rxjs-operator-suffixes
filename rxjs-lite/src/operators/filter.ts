import { Observable } from "../core/Observable";
import type { OperatorFunction } from "../core/types";

/**
 * Filters values emitted by the source Observable using a predicate function.
 * 
 * @template T Value type
 * @param predicate Function that tests each value
 * @returns Operator function
 * 
 * @example
 * ```ts
 * // Filter even numbers
 * of(1, 2, 3, 4, 5, 6)
 *   .pipe(filter(x => x % 2 === 0))
 *   .subscribe(console.log);
 * // Output: 2, 4, 6
 * ```
 * 
 * @example
 * ```ts
 * // Filter objects by property
 * interface User { name: string; active: boolean; }
 * users$
 *   .pipe(filter(user => user.active))
 *   .subscribe(displayUser);
 * ```
 * 
 * @example
 * ```ts
 * // Filter out nulls/undefined
 * values$
 *   .pipe(filter(v => v != null))
 *   .subscribe(processValue);
 * ```
 * 
 * @remarks
 * - Type preserving: input and output types match
 * - Errors and completion pass through unchanged
 * - Only values where predicate returns true are emitted
 * - If predicate throws, error propagates downstream
 * - Equivalent to Array.filter() for streams
 * 
 * @category Filtering Operators
 */
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
