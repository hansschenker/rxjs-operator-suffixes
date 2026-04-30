// src/tree/tree.config.ts
import type { QuestionNode } from './tree.types'
import { CREATE }      from './branches/create.branch'
import { ONE }         from './branches/one.branch'
import { MANY }        from './branches/many.branch'
import { NESTED }      from './branches/nested.branch'
import { ERROR }       from './branches/error.branch'
import { MULTICAST }   from './branches/multicast.branch'
import { AGGREGATION } from './branches/aggregation.branch'
import { CONDITIONAL } from './branches/conditional.branch'
import { HOT_COLD }    from './branches/hot-cold.branch'
import { INSPECTION }  from './branches/inspection.branch'

export { WIKI_BASE } from './tree.builders'

export const ROOT: QuestionNode = {
	kind: 'question',
	id: 'root',
	question: 'How many Observables do you have?',
	hint: 'The number of streams shapes every operator choice. Choose a concern on the left if none of the first four apply.',
	branches: [
		{ label: 'None — I need to create an Observable',                          next: CREATE      },
		{ label: 'One Observable',                                                  next: ONE         },
		{ label: 'Many Observables to combine',                                     next: MANY        },
		{ label: 'One that emits Observables (nested / higher-order)',              next: NESTED      },
		{ label: 'Error handling',                                                  next: ERROR       },
		{ label: 'Multicasting — share one source among subscribers',              next: MULTICAST   },
		{ label: 'Aggregation — fold or accumulate values',                        next: AGGREGATION },
		{ label: 'Conditional — boolean query about the stream',                   next: CONDITIONAL },
		{ label: 'Hot vs Cold — Subjects and sharing',                             next: HOT_COLD    },
		{ label: 'Inspection — tap into the stream without changing it',           next: INSPECTION  },
	],
}
