// src/state/tree.reducer.ts
import type { Action, TreeState } from '../tree/tree.types'

export function makeReducer(initial: TreeState): (state: TreeState, action: Action) => TreeState {
	return function treeReducer(state: TreeState, action: Action): TreeState {
		switch (action.kind) {
			case 'answer': {
				if (state.currentNode.kind !== 'question') return state
				return {
					currentNode: action.next,
					history:     [...state.history, state.currentNode],
					breadcrumb:  [...state.breadcrumb, { nodeId: state.currentNode.id, label: action.label }],
					detailView:  null,
				}
			}
			case 'back':
				if (state.history.length === 0) return state
				return {
					currentNode: state.history.at(-1)!,
					history:     state.history.slice(0, -1),
					breadcrumb:  state.breadcrumb.slice(0, -1),
					detailView:  null,
				}
			case 'reset':
				return initial
			case 'open-detail':
				return {
					...state,
					detailView: {
						operatorName: action.operatorName,
						oneliner:     action.oneliner,
						wikiPath:     action.wikiPath,
					},
				}
			case 'close-detail':
				return {
					...state,
					detailView: null,
				}
		}
	}
}
