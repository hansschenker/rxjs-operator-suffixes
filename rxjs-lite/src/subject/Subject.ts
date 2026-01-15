import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { Observer, PartialObserver } from "../core/types";

export class Subject<T> extends Observable<T> implements Observer<T> {
  private observers: Set<SubjectSubscription<T>> = new Set();
  private isStopped = false;
  private hasError = false;
  private thrownError: unknown = null;

  constructor() {
    super((subscriber) => this._innerSubscribe(subscriber));
  }

  private _innerSubscribe(observer: PartialObserver<T>): Subscription {
    if (this.hasError) {
      observer.error?.(this.thrownError);
      return new Subscription();
    }
    if (this.isStopped) {
      observer.complete?.();
      return new Subscription();
    }

    const sub = new SubjectSubscription(this, observer);
    this.observers.add(sub);
    return sub;
  }

  next(value: T): void {
    if (this.isStopped) return;
    for (const sub of [...this.observers]) sub.destination.next?.(value);
  }

  error(err: unknown): void {
    if (this.isStopped) return;
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    for (const sub of [...this.observers]) sub.destination.error?.(err);
    this.observers.clear();
  }

  complete(): void {
    if (this.isStopped) return;
    this.isStopped = true;
    for (const sub of [...this.observers]) sub.destination.complete?.();
    this.observers.clear();
  }

  /** internal: called by SubjectSubscription */
  _remove(sub: SubjectSubscription<T>): void {
    this.observers.delete(sub);
  }
}

class SubjectSubscription<T> extends Subscription {
  constructor(private readonly subject: Subject<T>, public readonly destination: PartialObserver<T>) {
    super();
  }

  override unsubscribe(): void {
    if (this.closed) return;
    super.unsubscribe();
    this.subject._remove(this);
  }
}
