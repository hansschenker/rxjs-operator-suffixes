// src/state/tree.state.ts
import { Subject, scan, startWith, shareReplay, map, distinctUntilChanged } from 'rxjs'
import { ROOT } from '../tree/tree.config'
import { makeReducer } from './tree.reducer'
import type { Action, TreeState, TreeNode, BreadcrumbStep, DetailView } from '../tree/tree.types'

export const action$ = new Subject<Action>()

export const initial: TreeState = {
	currentNode: ROOT,
	history:     [],
	breadcrumb:  [],
	detailView:  null,
}

const treeReducer = makeReducer(initial)

export const state$ = action$.pipe(
	scan(treeReducer, initial),
	startWith(initial),
	shareReplay(1),
)

export interface SidebarSlice {
	currentNode: TreeNode
	breadcrumb:  BreadcrumbStep[]
}

export interface PanelSlice {
	currentNode: TreeNode
	breadcrumb:  BreadcrumbStep[]
	historyLen:  number
	detailView:  DetailView | null
}

export const sidebarState$ = state$.pipe(
	map(({ currentNode, breadcrumb }): SidebarSlice => ({ currentNode, breadcrumb })),
	distinctUntilChanged((a, b) =>
		a.currentNode === b.currentNode && a.breadcrumb === b.breadcrumb
	),
)

export const panelState$ = state$.pipe(
	map(({ currentNode, breadcrumb, history, detailView }): PanelSlice => ({
		currentNode,
		breadcrumb,
		historyLen: history.length,
		detailView,
	})),
	distinctUntilChanged((a, b) =>
		a.currentNode === b.currentNode &&
		a.historyLen  === b.historyLen  &&
		a.detailView  === b.detailView
	),
)
