import { Observable } from "../core/Observable";
import type { OperatorFunction } from "../core/types";

/**
 * Applies a projection function to each value emitted by the source Observable.
 * 
 * @template T Source value type
 * @template R Result value type
 * @param project Function to transform each value
 * @returns Operator function that returns a new Observable
 * 
 * @example
 * ```ts
 * // Simple transformation
 * of(1, 2, 3)
 *   .pipe(map(x => x * 10))
 *   .subscribe(console.log);
 * // Output: 10, 20, 30
 * ```
 * 
 * @example
 * ```ts
 * // Transform objects
 * interface User { id: number; name: string; }
 * const users$: Observable<User> = ...;
 * const names$ = users$.pipe(map(user => user.name));
 * ```
 * 
 * @example
 * ```ts
 * // Chain multiple transformations
 * of(1, 2, 3, 4, 5)
 *   .pipe(
 *     map(x => x * 2),
 *     map(x => x + 1),
 *     map(x => `Value: ${x}`)
 *   )
 *   .subscribe(console.log);
 * // Output: "Value: 3", "Value: 5", "Value: 7", ...
 * ```
 * 
 * @remarks
 * - Synchronous transformation (no delay)
 * - Errors and completion pass through unchanged
 * - If project throws, error propagates downstream
 * - Most commonly used operator
 * - Equivalent to Array.map() for streams
 * 
 * @category Transformation Operators
 */
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
