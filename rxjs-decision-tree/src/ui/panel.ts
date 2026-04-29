// src/ui/panel.ts
import { action$ } from '../state/tree.state'
import { renderDetail } from './detail'
import type { TreeState, LeafNode, QuestionNode, OperatorResult } from '../tree/tree.types'

export function renderPanel(container: HTMLElement, state: TreeState): void {
	if (state.detailView) {
		renderDetail(container, state.detailView)
		return
	}

	const { currentNode, breadcrumb, history } = state
	if (currentNode.kind === 'question') {
		renderQuestion(container, currentNode, breadcrumb, history.length)
	} else {
		renderLeaf(container, currentNode, breadcrumb, history.length)
	}
}

function renderBreadcrumb(
	breadcrumb: TreeState['breadcrumb'],
	terminalLabel: string,
	terminalClass: string,
): string {
	const chips = breadcrumb.map(step =>
		`<span class="bc-chip">${step.label}</span><span class="bc-sep">›</span>`
	).join('')
	return `<div class="breadcrumb">${chips}<span class="bc-chip ${terminalClass}">${terminalLabel}</span></div>`
}

function renderQuestion(
	container: HTMLElement,
	node: QuestionNode,
	breadcrumb: TreeState['breadcrumb'],
	historyLen: number,
): void {
	const bc = renderBreadcrumb(breadcrumb, node.question, 'current')
	const hint = node.hint ? `<p class="q-hint">${node.hint}</p>` : ''
	const buttons = node.branches.map((branch, i) =>
		`<button class="answer-btn" data-branch="${i}">${branch.label}</button>`
	).join('')

	container.innerHTML = `
		${bc}
		<h1 class="q-heading">${node.question}</h1>
		${hint}
		<div class="answer-list">${buttons}</div>
		<div class="nav-actions">
			<button class="nav-btn" id="back-btn" ${historyLen === 0 ? 'disabled' : ''}>← Back</button>
		</div>
	`

	container.querySelectorAll('.answer-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const i = Number((btn as HTMLButtonElement).dataset['branch'])
			const branch = node.branches[i]
			action$.next({ kind: 'answer', next: branch.next, label: branch.label })
		})
	})

	container.querySelector('#back-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'back' })
	})
}

function renderOperator(op: OperatorResult): string {
	const detailBtn = `<button class="op-detail-btn"
		data-name="${op.name}"
		data-oneliner="${op.oneliner.replace(/"/g, '&quot;')}"
		data-wiki="${op.wikiPath}">
		${op.primary ? '★ ' : ''}${op.name}
	</button>`

	if (op.primary) {
		return `
			<div class="result-primary">
				${detailBtn}
				<div class="op-oneliner">${op.oneliner}</div>
			</div>`
	}
	return `
		<div class="result-alt">
			${detailBtn}
			<span class="alt-desc">— ${op.oneliner}</span>
		</div>`
}

function renderLeaf(
	container: HTMLElement,
	node: LeafNode,
	breadcrumb: TreeState['breadcrumb'],
	historyLen: number,
): void {
	const bc = renderBreadcrumb(breadcrumb, '✓ Result', 'result')
	const ops = node.operators.map(op => renderOperator(op)).join('')

	container.innerHTML = `
		${bc}
		${ops}
		<div class="nav-actions">
			<button class="nav-btn" id="back-btn" ${historyLen === 0 ? 'disabled' : ''}>← Back</button>
			<button class="nav-btn" id="reset-btn">↺ Start over</button>
		</div>
	`

	container.querySelectorAll('.op-detail-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const el = btn as HTMLButtonElement
			action$.next({
				kind:         'open-detail',
				operatorName: el.dataset['name']!,
				oneliner:     el.dataset['oneliner']!,
				wikiPath:     el.dataset['wiki']!,
			})
		})
	})

	container.querySelector('#back-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'back' })
	})

	container.querySelector('#reset-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'reset' })
	})
}
