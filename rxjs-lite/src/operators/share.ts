import { Observable } from "../core/Observable";
import type { OperatorFunction, SubscriptionLike } from "../core/types";
import { Subject } from "../subject/Subject";

/**
 * RefCounted multicasting.
 *
 * - first subscriber connects to source (single upstream execution)
 * - subsequent subscribers share the same execution via an internal Subject
 * - when the last subscriber unsubscribes, disconnect upstream and reset
 * - after source completes/errors, state resets (fresh source execution for future subscribers) once refCount reaches 0
 */
export function share<T>(): OperatorFunction<T, T> {
  return (source: Observable<T>) => {
    let refCount = 0;
    let subject: Subject<T> | null = null;
    let connection: SubscriptionLike | null = null;
    let terminated = false;

    const reset = () => {
      subject = null;
      connection = null;
      terminated = false;
      refCount = 0;
    };

    const ensureSubject = () => {
      // If no subject, or we terminated and there are no remaining subscribers, start fresh.
      if (!subject || (terminated && refCount === 0)) {
        subject = new Subject<T>();
        terminated = false;
      }
      return subject;
    };

    const connect = () => {
      if (connection || !subject) return;
      connection = source.subscribe({
        next: (v) => subject!.next(v),
        error: (e) => {
          terminated = true;
          connection = null;
          subject!.error(e);
        },
        complete: () => {
          terminated = true;
          connection = null;
          subject!.complete();
        },
      });
    };

    return new Observable<T>((subscriber) => {
      const subj = ensureSubject();
      refCount++;

      // Subscribe the downstream to the subject.
      const innerSub = subj.subscribe(subscriber);

      // On first subscriber, connect upstream.
      if (refCount === 1) connect();

      let closed = false;

      return () => {
        if (closed) return;
        closed = true;

        innerSub.unsubscribe();
        refCount--;

        // If nobody is listening anymore, disconnect and reset.
        if (refCount === 0) {
          connection?.unsubscribe();
          reset();
        }
      };
    });
  };
}
