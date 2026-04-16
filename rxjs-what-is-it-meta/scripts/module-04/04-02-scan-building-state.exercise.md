---
module: 4
lesson: "4.2"
title: scan — building state
exercise: Build a reactive todo list state using scan, dispatching AddTodo/RemoveTodo/ToggleTodo actions as a stream.
difficulty: intermediate
---

## Scenario

A todo-list feature needs state management. A junior developer has reached for a `BehaviorSubject` that gets mutated directly in event handlers. Your job is to replace that imperative approach with a pure reducer + `scan` pattern: all state transitions become predictable, testable functions, and the entire state history is derivable by replaying the action stream.

## Starter Code

```typescript
import { Subject } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';

interface Todo { id: number; text: string; done: boolean; }

type AddTodo    = { type: 'ADD_TODO';    text: string; };
type RemoveTodo = { type: 'REMOVE_TODO'; id: number; };
type ToggleTodo = { type: 'TOGGLE_TODO'; id: number; };

type Action = AddTodo | RemoveTodo | ToggleTodo;

interface TodoState { todos: Todo[]; nextId: number; }

const initialState: TodoState = { todos: [], nextId: 1 };

// EXERCISE: implement the pure reducer
function reducer(state: TodoState, action: Action): TodoState {
	switch (action.type) {
		case 'ADD_TODO':    return /* ??? */;
		case 'REMOVE_TODO': return /* ??? */;
		case 'TOGGLE_TODO': return /* ??? */;
		default:            return state;
	}
}

// EXERCISE: wire up the state stream — no mutable variables outside pipe()
const action$ = new Subject<Action>();
const state$ = action$.pipe(
	/* ??? use scan, startWith, shareReplay */
);

// Dispatch actions
action$.next({ type: 'ADD_TODO', text: 'Buy groceries' });
action$.next({ type: 'ADD_TODO', text: 'Write tests' });
action$.next({ type: 'TOGGLE_TODO', id: 1 });
action$.next({ type: 'REMOVE_TODO', id: 2 });

state$.subscribe((s: TodoState) => console.log('state:', s.todos));
```

## Task

1. Implement all three `reducer` cases using immutable updates (spread syntax, `Array.filter`, `Array.map` — no `push`, `splice`, or direct assignment).
2. Wire `state$` with `scan(reducer, initialState)`, `startWith(initialState)`, and `shareReplay(1)`.
3. Write the expected console output for the four dispatched actions above, tracing each state transition step by step.

## Hint

`scan` is `reduce` for streams: it accumulates state across emissions, passing the previous accumulator as the first argument to the reducer on each tick. `startWith(initialState)` ensures that subscribers get the initial state synchronously before any action fires. `shareReplay(1)` ensures late subscribers see the current state immediately.
