// src/state/tree.state.test.ts
import { describe, test, expect } from 'vitest'
import { makeReducer } from './tree.reducer'
import type { TreeState, QuestionNode, LeafNode } from '../tree/tree.types'

const MOCK_LEAF: LeafNode = {
	kind: 'leaf',
	id: 'mock-leaf',
	operators: [{ name: 'of', oneliner: 'Emit values.', wikiPath: '/operators/of', primary: true }],
}

const MOCK_ROOT: QuestionNode = {
	kind: 'question',
	id: 'mock-root',
	question: 'Test question?',
	branches: [{ label: 'Answer A', next: MOCK_LEAF }],
}

const mockInitial: TreeState = {
	currentNode: MOCK_ROOT,
	history:     [],
	breadcrumb:  [],
}

const treeReducer = makeReducer(mockInitial)

describe('treeReducer', () => {
	test('answer moves to next node, pushes history and breadcrumb', () => {
		const branch = MOCK_ROOT.branches[0]
		const next = treeReducer(mockInitial, { kind: 'answer', next: branch.next, label: branch.label })

		expect(next.currentNode).toBe(MOCK_LEAF)
		expect(next.history).toEqual([MOCK_ROOT])
		expect(next.breadcrumb).toEqual([{ nodeId: 'mock-root', label: 'Answer A' }])
	})

	test('back at root is a no-op (returns same state reference)', () => {
		expect(treeReducer(mockInitial, { kind: 'back' })).toBe(mockInitial)
	})

	test('back after answer returns to previous node', () => {
		const afterAnswer = treeReducer(mockInitial, {
			kind: 'answer',
			next: MOCK_LEAF,
			label: 'Answer A',
		})
		const afterBack = treeReducer(afterAnswer, { kind: 'back' })

		expect(afterBack.currentNode).toBe(MOCK_ROOT)
		expect(afterBack.history).toHaveLength(0)
		expect(afterBack.breadcrumb).toHaveLength(0)
	})

	test('reset returns initial state', () => {
		const afterAnswer = treeReducer(mockInitial, {
			kind: 'answer',
			next: MOCK_LEAF,
			label: 'Answer A',
		})
		const afterReset = treeReducer(afterAnswer, { kind: 'reset' })

		expect(afterReset).toBe(mockInitial)
	})

	test('breadcrumb length always equals history length', () => {
		const s1 = treeReducer(mockInitial, { kind: 'answer', next: MOCK_LEAF, label: 'A' })
		expect(s1.breadcrumb.length).toBe(s1.history.length)
		const s2 = treeReducer(s1, { kind: 'back' })
		expect(s2.breadcrumb.length).toBe(s2.history.length)
	})
})
