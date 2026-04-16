import { Observable, BehaviorSubject } from 'rxjs';
import { withLatestFrom, filter } from 'rxjs/operators';

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
		);
}
