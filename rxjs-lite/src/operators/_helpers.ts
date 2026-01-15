import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction, PartialObserver } from "../core/types";

export function operate<T, R>(init: (source: Observable<T>, subscriber: PartialObserver<R>) => Subscription | (() => void) | void): OperatorFunction<T, R> {
  return (source) =>
    new Observable<R>((dest) => {
      const teardown = init(source, dest);
      if (typeof teardown === "function") return teardown;
      if (teardown instanceof Subscription) return () => teardown.unsubscribe();
    });
}
