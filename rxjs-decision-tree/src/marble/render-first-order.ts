// src/marble/render-first-order.ts
import type { FirstOrderDiagramConfig, FirstOrderValue } from './marble.types'

const SVG_W    = 900
const LABEL_X  = 104
const TL_START = 110
const TL_END   = 830
const ARROW_END = TL_END + 40
const CIRCLE_R = 14
const SOURCE_Y = 80
const RESULT_Y = 200
const OP_BOX_Y = 118
const SVG_H    = 260

function x(t: number, totalTime: number): number {
	return TL_START + (t / totalTime) * (TL_END - TL_START)
}

export function renderFirstOrderSVG(config: FirstOrderDiagramConfig): string {
	const tt = config.totalTime
	const active = config.source.values.filter((v: FirstOrderValue) => v.active)

	const sourceCircles = config.source.values.map((v: FirstOrderValue) => {
		const cx = x(v.time, tt)
		const op = v.active ? 1 : 0.25
		const sw = v.active ? 2.5 : 1.5
		const fw = v.active ? 600 : 400
		return `<g>
			<circle class="src-circle" cx="${cx}" cy="${SOURCE_Y}" r="${CIRCLE_R}"
				fill="#0f172a" stroke="${v.color}" stroke-width="${sw}" opacity="${op}"/>
			<text x="${cx}" y="${SOURCE_Y + 4}" text-anchor="middle"
				fill="${v.color}" font-size="11" font-weight="${fw}" opacity="${op}">${v.label}</text>
		</g>`
	}).join('\n')

	const completionSource = config.source.completedAt
		? `<line x1="${x(config.source.completedAt, tt)}" y1="${SOURCE_Y - 12}"
			x2="${x(config.source.completedAt, tt)}" y2="${SOURCE_Y + 12}"
			stroke="#475569" stroke-width="2.5"/>`
		: ''

	const dropLines = active.map((v: FirstOrderValue) => {
		const x1 = x(v.time, tt)
		const x2 = x(v.resultTime ?? v.time, tt)
		return `<line x1="${x1}" y1="${SOURCE_Y + CIRCLE_R}"
			x2="${x2}" y2="${RESULT_Y - CIRCLE_R}"
			stroke="${v.color}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.45"/>`
	}).join('\n')

	const resultCircles = active.map((v: FirstOrderValue) => {
		const cx = x(v.resultTime ?? v.time, tt)
		return `<g>
			<circle cx="${cx}" cy="${RESULT_Y}" r="${CIRCLE_R}"
				fill="#0f172a" stroke="${v.color}" stroke-width="2.5"/>
			<text x="${cx}" y="${RESULT_Y + 4}" text-anchor="middle"
				fill="${v.color}" font-size="11" font-weight="600">${v.resultLabel ?? v.label}</text>
		</g>`
	}).join('\n')

	const completionResult = config.result.completedAt
		? `<line x1="${x(config.result.completedAt, tt)}" y1="${RESULT_Y - 12}"
			x2="${x(config.result.completedAt, tt)}" y2="${RESULT_Y + 12}"
			stroke="#475569" stroke-width="2.5"/>`
		: ''

	const title = config.title ?? `${config.operatorName} — marble diagram`

	return `<svg width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}"
		xmlns="http://www.w3.org/2000/svg"
		font-family="ui-monospace,'Cascadia Code','JetBrains Mono',monospace"
		font-size="12" role="img" aria-label="${config.operatorName} marble diagram">
	<defs>
		<marker id="arr-fo" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
			<polygon points="0 0,10 3.5,0 7" fill="#475569"/>
		</marker>
	</defs>
	<rect width="${SVG_W}" height="${SVG_H}" fill="#0f172a" rx="12"/>
	<text x="${SVG_W / 2}" y="30" text-anchor="middle" fill="#e2e8f0"
		font-size="14" font-weight="600" letter-spacing="0.5">${title}</text>
	<text x="${LABEL_X}" y="${SOURCE_Y}" text-anchor="end" dominant-baseline="middle"
		fill="#64748b" font-size="11">source</text>
	<text x="${LABEL_X}" y="${RESULT_Y}" text-anchor="end" dominant-baseline="middle"
		fill="#64748b" font-size="11">result</text>
	<line x1="${TL_START}" y1="${SOURCE_Y}" x2="${ARROW_END}" y2="${SOURCE_Y}"
		stroke="#475569" stroke-width="1.5" marker-end="url(#arr-fo)"/>
	${sourceCircles}
	${completionSource}
	${dropLines}
	<rect x="${SVG_W / 2 - 155}" y="${OP_BOX_Y}" width="310" height="28"
		rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
	<text x="${SVG_W / 2}" y="${OP_BOX_Y + 14}" text-anchor="middle" dominant-baseline="middle"
		fill="#94a3b8" font-size="12" letter-spacing="2" font-weight="500">${config.operatorName}</text>
	<line x1="${TL_START}" y1="${RESULT_Y}" x2="${ARROW_END}" y2="${RESULT_Y}"
		stroke="#475569" stroke-width="1.5" marker-end="url(#arr-fo)"/>
	${resultCircles}
	${completionResult}
	<g transform="translate(110,${SVG_H - 22})" fill="#475569" font-size="10">
		<circle cx="6" cy="5" r="5" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
		<text x="16" y="9">passes to result</text>
		<circle cx="170" cy="5" r="5" fill="none" stroke="#94a3b8" stroke-width="1" opacity="0.3"/>
		<text x="180" y="9" opacity="0.45">filtered / dropped</text>
		<line x1="340" y1="5" x2="365" y2="5"
			stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.5"/>
		<text x="372" y="9">drop line</text>
	</g>
</svg>`
}
