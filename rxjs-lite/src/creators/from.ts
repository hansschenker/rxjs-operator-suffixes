import { Observable } from "../core/Observable";
import type { SubscriptionLike } from "../core/types";

function isPromiseLike<T = unknown>(x: unknown): x is PromiseLike<T> {
  return typeof x === "object" && x !== null && "then" in (x as any) && typeof (x as any).then === "function";
}

function isIterable<T = unknown>(x: unknown): x is Iterable<T> {
  return typeof x === "object" && x !== null && Symbol.iterator in (x as any) && typeof (x as any)[Symbol.iterator] === "function";
}

function isObservableLike<T = unknown>(x: unknown): x is { subscribe: (...args: any[]) => SubscriptionLike } {
  return typeof x === "object" && x !== null && "subscribe" in (x as any) && typeof (x as any).subscribe === "function";
}

export function from<T>(input: Iterable<T> | PromiseLike<T> | Observable<T> | { subscribe: (...args: any[]) => SubscriptionLike }): Observable<T> {
  if (isObservableLike<T>(input)) {
    // Delegate to foreign subscribable.
    return new Observable<T>((subscriber) => {
      const sub = input.subscribe({
        next: (v: T) => subscriber.next(v),
        error: (e: unknown) => subscriber.error(e),
        complete: () => subscriber.complete(),
      } as any);
      return () => sub.unsubscribe();
    });
  }

  if (isPromiseLike<T>(input)) {
    return new Observable<T>((subscriber) => {
      let canceled = false;
      input.then(
        (v) => {
          if (canceled) return;
          subscriber.next(v);
          subscriber.complete();
        },
        (e) => {
          if (canceled) return;
          subscriber.error(e);
        }
      );
      return () => {
        canceled = true;
      };
    });
  }

  if (isIterable<T>(input)) {
    return new Observable<T>((subscriber) => {
      for (const v of input) {
        if ((subscriber as any).closed) return;
        subscriber.next(v);
      }
      subscriber.complete();
    });
  }

  // Should be unreachable due to typing, but keep runtime safety.
  return new Observable<T>((subscriber) => subscriber.error(new TypeError("Unsupported input for from()")));
}
