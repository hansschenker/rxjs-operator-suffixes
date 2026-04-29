// src/ui/detail.ts
import { action$ } from '../state/tree.state'
import { getMarbleSVG } from '../marble/configs/index'
import { explanations } from '../data/explanations'
import { WIKI_BASE } from '../tree/tree.config'
import { escHtml } from './utils'
import type { DetailView } from '../tree/tree.types'

export function renderDetail(container: HTMLElement, detail: DetailView): void {
	const { operatorName, oneliner, wikiPath } = detail

	// Registry key is wikiPath's last segment — matches operatorName in explanations
	const cacheKey = wikiPath.split('/').pop() ?? operatorName
	const explanation = explanations[cacheKey]
	const marbleSVG  = getMarbleSVG(wikiPath)

	const marbleSection = marbleSVG
		? `<div class="detail-marble">${marbleSVG}</div>`
		: ''

	const codeSection = explanation?.code
		? `<pre class="detail-code"><code>${escHtml(explanation.code)}</code></pre>`
		: ''

	const gotchasSection = explanation?.gotchas?.length
		? `<details class="detail-section">
			<summary class="detail-summary">Gotchas (${explanation.gotchas.length})</summary>
			<ol class="detail-gotchas">
				${explanation.gotchas.map(g => `<li>${escHtml(g)}</li>`).join('\n')}
			</ol>
		</details>`
		: ''

	const relatedSection = explanation?.related
		? `<details class="detail-section">
			<summary class="detail-summary">Related operators</summary>
			<div class="detail-related">${markdownTable(explanation.related)}</div>
		</details>`
		: ''

	const ruleSection = explanation?.rule
		? `<p class="detail-rule">${escHtml(explanation.rule)}</p>`
		: ''

	const wikiLink = `<a class="detail-wiki-link" href="${WIKI_BASE}${wikiPath}" target="_blank" rel="noopener">
		Full documentation →
	</a>`

	container.innerHTML = `
		<div class="detail-header">
			<button class="nav-btn" id="detail-back-btn">← Back to results</button>
			<span class="detail-op-name">${escHtml(operatorName)}</span>
		</div>
		<p class="detail-oneliner">${escHtml(oneliner)}</p>
		${marbleSection}
		${codeSection}
		${gotchasSection}
		${relatedSection}
		${ruleSection}
		${wikiLink}
	`

	container.querySelector('#detail-back-btn')?.addEventListener('click', () => {
		action$.next({ kind: 'close-detail' })
	})
}

function markdownTable(md: string): string {
	const lines = md.trim().split('\n').filter(l => !l.match(/^\|[-| ]+\|$/))
	if (lines.length < 2) return `<pre>${escHtml(md)}</pre>`
	const header = lines[0]
	if (!header) return `<pre>${escHtml(md)}</pre>`
	const rows = lines.slice(1)
	const th = header.split('|').filter(Boolean).map(c => `<th>${escHtml(c.trim())}</th>`).join('')
	const trs = rows.map(r =>
		`<tr>${r.split('|').filter(Boolean).map(c => `<td>${escHtml(c.trim())}</td>`).join('')}</tr>`
	).join('\n')
	return `<table class="detail-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`
}
