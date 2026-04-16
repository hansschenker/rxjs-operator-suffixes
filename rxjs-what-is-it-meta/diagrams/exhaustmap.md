# exhaustMap — ignore while busy

```ascii
clicks$:   --A-----B--C--------D--|
            exhaustMap(click => request$(click))

request$(A):  ----a1--a2--|
request$(B):              (dropped — A still running)
request$(C):              (dropped — A still running)
request$(D):                       ----d1--d2--|

output$:   ----a1--a2--X-----------d1--d2--|
```
X = B and C arrive while A is running and are silently dropped

**Read it:** While `request$(A)` is still in progress, clicks B and C are ignored entirely — no new inner subscription is created, no error is thrown. The next inner subscription starts only after the current one completes. D fires after A completes, so it is accepted.

**Use when:** duplicate triggering should be silently ignored until the current operation finishes — login button, payment confirm, file export.

```typescript
import { fromEvent } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface LoginResponse { token: string; }
interface LoginPayload { username: string; password: string; }

declare const credentials$: import('rxjs').Observable<LoginPayload>;

const login$ = credentials$.pipe(
	exhaustMap((creds: LoginPayload) =>
		ajax.post<LoginResponse>('/api/login', creds),
	),
);
```
