// src/marble/render-higher-order.ts
import type { MarbleDiagramConfig, SourceEmission, InnerObservable } from './marble.types'

const SVG_W         = 900
const LABEL_X       = 104
const TL_START      = 110
const TL_END        = 830
const ARROW_END     = TL_END + 40
const CIRCLE_R      = 14
const SOURCE_Y      = 80
const FIRST_INNER_Y = 185
const INNER_SPACING = 90
const QUEUE_CHANNEL_Y = SOURCE_Y + 28

function x(t: number, totalTime: number): number {
	return TL_START + (t / totalTime) * (TL_END - TL_START)
}

function innerY(i: number): number {
	return FIRST_INNER_Y + i * INNER_SPACING
}

function ghostPx(totalTime: number): number {
	return 1.3 * (TL_END - TL_START) / totalTime
}

function resolveSpawn(em: SourceEmission, ei: number): number | null {
	if (em.spawnsInnerIndex === null) return null
	if (typeof em.spawnsInnerIndex === 'number') return em.spawnsInnerIndex
	return ei
}

function spawnPath(em: SourceEmission, innerIdx: number, inners: InnerObservable[], tt: number): string {
	const x1 = x(em.time, tt)
	const y1 = SOURCE_Y + CIRCLE_R
	const x2 = x(inners[innerIdx].startTime, tt)
	const y2 = innerY(innerIdx) - CIRCLE_R
	// Integer time values assumed — strict equality is safe for all planned configs
	if (em.time === inners[innerIdx].startTime) {
		return `M ${x1},${y1} V ${y2}`
	}
	return `M ${x1},${y1} V ${QUEUE_CHANNEL_Y} H ${x2} V ${y2}`
}

function innerLabel(i: number): string {
	return `inner ${String.fromCharCode(65 + i)}`
}

export function renderHigherOrderSVG(config: MarbleDiagramConfig): string {
	const tt = config.totalTime
	const numInners = config.inners.length
	const lastInnerY = FIRST_INNER_Y + (numInners - 1) * INNER_SPACING
	const resultY = lastInnerY + 100
	const operatorBoxY = lastInnerY + 28
	const svgH = resultY + 55
	const ghost = ghostPx(tt)

	const sourceCircles = config.source.emissions.map((em, ei) => {
		const spawned = resolveSpawn(em, ei)
		const op = spawned !== null ? 1 : 0.25
		const sw = spawned !== null ? 2.5 : 1.5
		const cx = x(em.time, tt)
		return `<g>
			<circle cx="${cx}" cy="${SOURCE_Y}" r="${CIRCLE_R}"
				fill="#0f172a" stroke="${em.color}" stroke-width="${sw}" opacity="${op}"/>
			<text x="${cx}" y="${SOURCE_Y + 4}" text-anchor="middle"
				fill="${em.color}" font-weight="700" opacity="${op}">${em.label}</text>
		</g>`
	}).join('\n')

	const sourceCompletion = config.source.completedAt
		? `<line x1="${x(config.source.completedAt, tt)}" y1="${SOURCE_Y - 12}"
			x2="${x(config.source.completedAt, tt)}" y2="${SOURCE_Y + 12}"
			stroke="#475569" stroke-width="2.5"/>`
		: ''

	const spawnLines = config.source.emissions.map((em, ei) => {
		const idx = resolveSpawn(em, ei)
		if (idx === null) return ''
		return `<path d="${spawnPath(em, idx, config.inners, tt)}"
			stroke="${em.color}" stroke-width="1.5" stroke-dasharray="4,3" fill="none" opacity="0.6"/>`
	}).join('\n')

	const innerLanes = config.inners.map((inner, i) => {
		const iy = innerY(i)
		const endX = x(inner.cancelledAt ?? inner.completedAt ?? tt, tt)

		const cancelMark = inner.cancelledAt !== undefined ? `
			<line class="cancel-mark" x1="${x(inner.cancelledAt, tt) - 8}" y1="${iy - 8}"
				x2="${x(inner.cancelledAt, tt) + 8}" y2="${iy + 8}"
				stroke="${inner.color}" stroke-width="2.5"/>
			<line x1="${x(inner.cancelledAt, tt) + 8}" y1="${iy - 8}"
				x2="${x(inner.cancelledAt, tt) - 8}" y2="${iy + 8}"
				stroke="${inner.color}" stroke-width="2.5"/>
			<line x1="${x(inner.cancelledAt, tt)}" y1="${iy}"
				x2="${x(inner.cancelledAt, tt) + ghost}" y2="${iy}"
				stroke="${inner.color}" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.22"/>` : ''

		const completeMark = inner.completedAt !== undefined ? `
			<line x1="${x(inner.completedAt, tt)}" y1="${iy - 12}"
				x2="${x(inner.completedAt, tt)}" y2="${iy + 12}"
				stroke="${inner.color}" stroke-width="2.5"/>` : ''

		const values = inner.values.map(val => {
			const vx = x(val.time, tt)
			const vop = val.active ? 1 : 0.22
			const vsw = val.active ? 2.5 : 1.5
			const vfw = val.active ? 600 : 400
			const dropLine = val.active
				? `<line x1="${vx}" y1="${iy + CIRCLE_R}" x2="${vx}" y2="${resultY - CIRCLE_R}"
					stroke="${inner.color}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.45"/>`
				: ''
			return `<g>
				<circle cx="${vx}" cy="${iy}" r="${CIRCLE_R}"
					fill="#0f172a" stroke="${inner.color}" stroke-width="${vsw}" opacity="${vop}"/>
				<text x="${vx}" y="${iy + 4}" text-anchor="middle"
					fill="${inner.color}" font-size="11" font-weight="${vfw}" opacity="${vop}">${val.label}</text>
				${dropLine}
			</g>`
		}).join('\n')

		return `<g>
			<text x="${LABEL_X}" y="${iy}" text-anchor="end" dominant-baseline="middle"
				fill="${inner.color}" font-size="11">${innerLabel(i)}</text>
			<line x1="${x(inner.startTime, tt)}" y1="${iy}" x2="${endX}" y2="${iy}"
				stroke="${inner.color}" stroke-width="2"/>
			${cancelMark}${completeMark}${values}
		</g>`
	}).join('\n')

	const resultCircles = config.result.values.map(val => {
		const cx = x(val.time, tt)
		return `<g>
			<circle cx="${cx}" cy="${resultY}" r="${CIRCLE_R}"
				fill="#0f172a" stroke="${val.color}" stroke-width="2.5"/>
			<text x="${cx}" y="${resultY + 4}" text-anchor="middle"
				fill="${val.color}" font-size="11" font-weight="600">${val.label}</text>
		</g>`
	}).join('\n')

	const resultCompletion = config.result.completedAt
		? `<line x1="${x(config.result.completedAt, tt)}" y1="${resultY - 12}"
			x2="${x(config.result.completedAt, tt)}" y2="${resultY + 12}"
			stroke="#475569" stroke-width="2.5"/>`
		: ''

	const title = config.title ?? `${config.operatorName} — marble diagram`

	return `<svg width="${SVG_W}" height="${svgH}" viewBox="0 0 ${SVG_W} ${svgH}"
		xmlns="http://www.w3.org/2000/svg"
		font-family="ui-monospace,'Cascadia Code','JetBrains Mono',monospace"
		font-size="12" role="img" aria-label="${config.operatorName} marble diagram">
	<defs>
		<marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
			<polygon points="0 0,10 3.5,0 7" fill="#475569"/>
		</marker>
	</defs>
	<rect width="${SVG_W}" height="${svgH}" fill="#0f172a" rx="12"/>
	<text x="${SVG_W / 2}" y="30" text-anchor="middle" fill="#e2e8f0"
		font-size="14" font-weight="600" letter-spacing="0.5">${title}</text>
	<text x="${LABEL_X}" y="${SOURCE_Y}" text-anchor="end" dominant-baseline="middle"
		fill="#64748b" font-size="11">source</text>
	<text x="${LABEL_X}" y="${resultY}" text-anchor="end" dominant-baseline="middle"
		fill="#64748b" font-size="11">result</text>
	<line x1="${TL_START}" y1="${SOURCE_Y}" x2="${ARROW_END}" y2="${SOURCE_Y}"
		stroke="#475569" stroke-width="1.5" marker-end="url(#arr)"/>
	${sourceCircles}
	${sourceCompletion}
	${spawnLines}
	${innerLanes}
	<rect x="${SVG_W / 2 - 155}" y="${operatorBoxY}" width="310" height="28"
		rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
	<text x="${SVG_W / 2}" y="${operatorBoxY + 14}" text-anchor="middle" dominant-baseline="middle"
		fill="#94a3b8" font-size="12" letter-spacing="2" font-weight="500">${config.operatorName}</text>
	<line x1="${TL_START}" y1="${resultY}" x2="${ARROW_END}" y2="${resultY}"
		stroke="#475569" stroke-width="1.5" marker-end="url(#arr)"/>
	${resultCircles}
	${resultCompletion}
</svg>`
}
