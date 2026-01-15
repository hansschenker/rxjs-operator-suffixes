import { Observable } from "../core/Observable";

export function of<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const v of values) {
      if ((subscriber as any).closed) return;
      subscriber.next(v);
    }
    subscriber.complete();
  });
}
