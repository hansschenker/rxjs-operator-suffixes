import { from, type Observable } from 'rxjs';

export function createCrudService<T extends { id: string }>(basePath: string) {
	return {
		getAll$: (): Observable<T[]> =>
			from(fetch(basePath).then(r => r.json() as Promise<T[]>)),

		create$: (body: unknown): Observable<T> =>
			from(fetch(basePath, {
				method:  'POST',
				headers: { 'Content-Type': 'application/json' },
				body:    JSON.stringify(body),
			}).then(r => r.json() as Promise<T>)),

		update$: (id: string, body: unknown): Observable<T> =>
			from(fetch(`${basePath}/${id}`, {
				method:  'PUT',
				headers: { 'Content-Type': 'application/json' },
				body:    JSON.stringify(body),
			}).then(r => r.json() as Promise<T>)),

		remove$: (id: string): Observable<void> =>
			from(fetch(`${basePath}/${id}`, { method: 'DELETE' }).then(() => undefined)),
	};
}
