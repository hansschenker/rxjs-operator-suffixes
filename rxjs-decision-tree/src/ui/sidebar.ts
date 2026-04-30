// src/ui/sidebar.ts
import { ROOT } from '../tree/tree.config'
import { action$ } from '../state/tree.state'
import type { SidebarSlice } from '../state/tree.state'
import type { TreeNode } from '../tree/tree.types'

export function renderSidebar(container: HTMLElement, state: SidebarSlice): void {
	const activeIds = new Set(state.breadcrumb.map(s => s.nodeId))

	container.innerHTML = `
		<div class="sidebar-tree">
			${renderNode(ROOT, 0, activeIds, state.currentNode)}
		</div>
		<div class="sidebar-reset">
			<button class="reset-btn">↺ Start over</button>
		</div>
	`

	container.querySelector('.reset-btn')!.addEventListener('click', () => {
		action$.next({ kind: 'reset' })
	})
}

function truncate(text: string, max: number): string {
	return text.length > max ? text.slice(0, max) + '…' : text
}

function renderNode(
	node: TreeNode,
	depth: number,
	activeIds: Set<string>,
	current: TreeNode,
): string {
	const isCurrent = node === current
	const isOnPath  = activeIds.has(node.id)
	const style     = `style="--indent: ${depth}"`

	if (node.kind === 'leaf') {
		const cls = `sidebar-item leaf${isCurrent ? ' active-leaf' : ''}`
		const label = node.operators[0].name
		return `<div class="${cls}" ${style}>● ${label}</div>`
	}

	const expanded = depth === 0 || isOnPath || isCurrent
	const arrow    = expanded ? '▼' : '▷'
	const label    = truncate(node.question, 30)
	const cls      = [
		'sidebar-item question',
		isCurrent ? 'active' : '',
		isOnPath  ? 'on-path' : '',
	].filter(Boolean).join(' ')

	const children = expanded
		? node.branches.map(b => renderNode(b.next, depth + 1, activeIds, current)).join('')
		: ''

	return `<div class="${cls}" ${style}>${arrow} ${label}</div>${children}`
}
