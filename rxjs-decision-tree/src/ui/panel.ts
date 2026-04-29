// src/ui/panel.ts
import { WIKI_BASE } from '../tree/tree.config'
import { action$ } from '../state/tree.state'
import type { TreeState, LeafNode, QuestionNode, OperatorResult } from '../tree/tree.types'

export function renderPanel(container: HTMLElement, state: TreeState): void {
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

function renderOperator(op: OperatorResult, primary: boolean): string {
	const href = `${WIKI_BASE}${op.wikiPath}`
	if (primary) {
		return `
			<div class="result-primary">
				<div class="op-name">${op.name}</div>
				<div class="op-oneliner">${op.oneliner}</div>
				<a class="wiki-link" href="${href}" target="_blank" rel="noopener">
					Learn more in the RxJS wiki →
				</a>
			</div>`
	}
	return `
		<div class="result-alt">
			<span class="alt-name">${op.name}</span>
			<span class="alt-desc">— ${op.oneliner}</span>
			<a class="alt-link" href="${href}" target="_blank" rel="noopener">Wiki →</a>
		</div>`
}

function renderLeaf(
	container: HTMLElement,
	node: LeafNode,
	breadcrumb: TreeState['breadcrumb'],
	historyLen: number,
): void {
	const bc = renderBreadcrumb(breadcrumb, '✓ Result', 'result')
	const ops = node.operators.map(op => renderOperator(op, op.primary)).join('')

	container.innerHTML = `
		${bc}
		${ops}
		<div class="nav-actions">
			<button class="nav-btn" id="back-btn" ${historyLen === 0 ? 'disabled' : ''}>← Back</button>
			<button class="nav-btn" id="reset-btn">↺ Start over</button>
		</div>
	`

	container.querySelector('#back-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'back' })
	})

	container.querySelector('#reset-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'reset' })
	})
}
