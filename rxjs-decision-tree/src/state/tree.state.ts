// src/state/tree.state.ts
import { Subject, scan, startWith, shareReplay } from 'rxjs'
import { ROOT } from '../tree/tree.config'
import { makeReducer } from './tree.reducer'
import type { Action, TreeState } from '../tree/tree.types'

export const action$ = new Subject<Action>()

export const initial: TreeState = {
	currentNode: ROOT,
	history:     [],
	breadcrumb:  [],
}

const treeReducer = makeReducer(initial)

export const state$ = action$.pipe(
	scan(treeReducer, initial),
	startWith(initial),
	shareReplay(1),
)
