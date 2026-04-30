import { getMarbleSVG } from '../marble/configs/index'
import { explanations } from './explanations'
import type { OperatorExplanation } from './explanations'

export interface OperatorDetail {
	marbleSVG:   string | null
	explanation: OperatorExplanation | null
}

export function getOperatorDetail(wikiPath: string): OperatorDetail {
	const key = wikiPath.split('/').pop() ?? ''
	return {
		marbleSVG:   getMarbleSVG(wikiPath),
		explanation: explanations[key] ?? null,
	}
}
