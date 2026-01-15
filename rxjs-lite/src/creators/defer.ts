import { Observable } from "../core/Observable";

export function defer<T>(factory: () => Observable<T>): Observable<T> {
  return new Observable<T>((subscriber) => {
    const created = factory();
    return created.subscribe(subscriber);
  });
}
