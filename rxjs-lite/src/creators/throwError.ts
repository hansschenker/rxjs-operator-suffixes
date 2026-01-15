import { Observable } from "../core/Observable";

export function throwError(errFactory: () => unknown): Observable<never> {
  return new Observable<never>((subscriber) => {
    subscriber.error(errFactory());
  });
}
