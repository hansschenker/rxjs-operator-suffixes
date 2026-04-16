---
module: 7
lesson: "7.5"
title: exhaustMap
exercise: Implement a login button using exhaustMap to prevent double-submit while the request is in flight.
difficulty: intermediate
---

## Scenario

A login button dispatches an authentication request. Without rate limiting, rapid clicks fire multiple simultaneous login requests, causing race conditions where the second response overwrites a successful first login. The fix must ignore subsequent clicks while the first request is active — no flags, no disabled button state, no manual guards.

## Starter Code

```typescript
import { fromEvent } from 'rxjs';
import { mergeMap, map, tap } from 'rxjs/operators'; // BUG: mergeMap allows double-submit
import { ajax } from 'rxjs/ajax';

interface LoginPayload { username: string; password: string; }
interface AuthToken { token: string; expiresAt: string; }

const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;

const loginClicks$ = fromEvent<MouseEvent>(loginBtn, 'click').pipe(
	map((): LoginPayload => ({
		username: usernameInput.value,
		password: passwordInput.value,
	})),
);

// BUG: mergeMap allows multiple simultaneous login requests
const login$ = loginClicks$.pipe(
	mergeMap((payload: LoginPayload) =>
		ajax.post<AuthToken>('/api/auth/login', payload).pipe(
			tap((response: { response: AuthToken }) =>
				console.log('Token:', response.response.token),
			),
		),
	),
);
```

## Task

1. Replace `mergeMap` with the operator that ignores all clicks while a login request is active.
2. Explain in one sentence what happens to clicks that arrive during the in-flight request — are they queued, cancelled, or dropped?
3. Compare: what would `concatMap` do instead — and why is that wrong for a login button?

## Hint

Ignore-while-busy prevents double-execution structurally — no flags, no disabled states needed. The operator that does this subscribes to the inner Observable only when no inner Observable is currently active.
