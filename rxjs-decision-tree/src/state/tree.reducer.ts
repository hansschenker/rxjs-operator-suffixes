// src/state/tree.reducer.ts
import type { Action, TreeState, QuestionNode } from '../tree/tree.types'

export function makeReducer(initial: TreeState) {
	return function treeReducer(state: TreeState, action: Action): TreeState {
		switch (action.kind) {
			case 'answer':
				return {
					currentNode: action.next,
					history:     [...state.history, state.currentNode as QuestionNode],
					breadcrumb:  [...state.breadcrumb, { nodeId: state.currentNode.id, label: action.label }],
				}
			case 'back':
				if (state.history.length === 0) return state
				return {
					currentNode: state.history.at(-1)!,
					history:     state.history.slice(0, -1),
					breadcrumb:  state.breadcrumb.slice(0, -1),
				}
			case 'reset':
				return initial
		}
	}
}
