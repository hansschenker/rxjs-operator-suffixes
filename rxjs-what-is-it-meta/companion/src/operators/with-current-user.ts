import { Observable } from 'rxjs';
import { withLatestFrom, filter, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export interface CurrentUser {
	id: number;
	name: string;
	role: 'admin' | 'viewer';
}

// Simulated current user — in a real app, update this from your auth stream
export const currentUser$ = new BehaviorSubject<CurrentUser | null>(null);

export function withCurrentUser<T>() {
	return (source$: Observable<T>): Observable<[T, CurrentUser]> =>
		source$.pipe(
			withLatestFrom(currentUser$),
			filter((pair): pair is [T, CurrentUser] => pair[1] !== null),
			map(([value, user]: [T, CurrentUser | null]): [T, CurrentUser] => [value, user as CurrentUser]),
		);
}
