// src/marble/configs/index.ts
import type { FirstOrderDiagramConfig, MarbleDiagramConfig } from '../marble.types'
import { renderFirstOrderSVG } from '../render-first-order'
import { renderHigherOrderSVG } from '../render-higher-order'

import { switchMapConfig }   from './switchMap'
import { mergeMapConfig }    from './mergeMap'
import { concatMapConfig }   from './concatMap'
import { exhaustMapConfig }  from './exhaustMap'
import { ofConfig }          from './of'
import { fromConfig }        from './from'
import { fromEventConfig }   from './fromEvent'
import { intervalConfig }    from './interval'
import { timerConfig }       from './timer'
import { observableConfig }  from './Observable'
import { deferConfig }       from './defer'
import { iifConfig }         from './iif'
import { emptyConfig }       from './EMPTY'
import { neverConfig }       from './NEVER'
import { mapConfig }         from './map'
import { scanConfig }        from './scan'
import { reduceConfig }      from './reduce'
import { toArrayConfig }     from './toArray'
import { countConfig }       from './count'
import { filterConfig }      from './filter'
import { distinctUntilChangedConfig } from './distinctUntilChanged'
import { distinctConfig }    from './distinct'
import { debounceTimeConfig } from './debounceTime'
import { debounceConfig }    from './debounce'
import { throttleTimeConfig } from './throttleTime'
import { throttleConfig }    from './throttle'
import { auditTimeConfig }   from './auditTime'
import { sampleTimeConfig }  from './sampleTime'
import { sampleConfig }      from './sample'
import { bufferTimeConfig }  from './bufferTime'
import { bufferCountConfig } from './bufferCount'
import { bufferConfig }      from './buffer'
import { windowTimeConfig }  from './windowTime'
import { windowCountConfig } from './windowCount'
import { delayConfig }       from './delay'
import { delayWhenConfig }   from './delayWhen'
import { takeConfig }        from './take'
import { takeWhileConfig }   from './takeWhile'
import { takeUntilConfig }   from './takeUntil'
import { skipConfig }        from './skip'
import { skipWhileConfig }   from './skipWhile'
import { skipUntilConfig }   from './skipUntil'
import { firstConfig }       from './first'
import { lastConfig }        from './last'
import { forkJoinConfig }    from './forkJoin'
import { combineLatestConfig } from './combineLatest'
import { withLatestFromConfig } from './withLatestFrom'
import { zipConfig }         from './zip'
import { mergeConfig }       from './merge'
import { concatConfig }      from './concat'
import { raceConfig }        from './race'
import { catchErrorConfig }  from './catchError'
import { retryConfig }       from './retry'
import { retryWhenConfig }   from './retryWhen'
import { onErrorResumeNextWithConfig } from './onErrorResumeNextWith'
import { timeoutConfig }     from './timeout'
import { shareReplayConfig } from './shareReplay'
import { shareConfig }       from './share'
import { everyConfig }       from './every'
import { findConfig }        from './find'
import { findIndexConfig }   from './findIndex'
import { isEmptyConfig }     from './isEmpty'
import { defaultIfEmptyConfig } from './defaultIfEmpty'
import { materializeConfig } from './materialize'
import { dematerializeConfig } from './dematerialize'
import { subjectConfig }     from './Subject'
import { behaviorSubjectConfig } from './BehaviorSubject'
import { replaySubjectConfig }   from './ReplaySubject'
import { publishConfig }     from './publish'
import { tapConfig }         from './tap'
import { finalizeConfig }    from './finalize'

type MarbleEntry =
	| { kind: 'first-order';  config: FirstOrderDiagramConfig }
	| { kind: 'higher-order'; config: MarbleDiagramConfig }

const registry: Record<string, MarbleEntry> = {
	switchMap:             { kind: 'higher-order', config: switchMapConfig },
	mergeMap:              { kind: 'higher-order', config: mergeMapConfig },
	concatMap:             { kind: 'higher-order', config: concatMapConfig },
	exhaustMap:            { kind: 'higher-order', config: exhaustMapConfig },
	of:                    { kind: 'first-order',  config: ofConfig },
	from:                  { kind: 'first-order',  config: fromConfig },
	fromEvent:             { kind: 'first-order',  config: fromEventConfig },
	interval:              { kind: 'first-order',  config: intervalConfig },
	timer:                 { kind: 'first-order',  config: timerConfig },
	Observable:            { kind: 'first-order',  config: observableConfig },
	defer:                 { kind: 'first-order',  config: deferConfig },
	iif:                   { kind: 'first-order',  config: iifConfig },
	EMPTY:                 { kind: 'first-order',  config: emptyConfig },
	NEVER:                 { kind: 'first-order',  config: neverConfig },
	map:                   { kind: 'first-order',  config: mapConfig },
	scan:                  { kind: 'first-order',  config: scanConfig },
	reduce:                { kind: 'first-order',  config: reduceConfig },
	toArray:               { kind: 'first-order',  config: toArrayConfig },
	count:                 { kind: 'first-order',  config: countConfig },
	filter:                { kind: 'first-order',  config: filterConfig },
	distinctUntilChanged:  { kind: 'first-order',  config: distinctUntilChangedConfig },
	distinct:              { kind: 'first-order',  config: distinctConfig },
	debounceTime:          { kind: 'first-order',  config: debounceTimeConfig },
	debounce:              { kind: 'first-order',  config: debounceConfig },
	throttleTime:          { kind: 'first-order',  config: throttleTimeConfig },
	throttle:              { kind: 'first-order',  config: throttleConfig },
	auditTime:             { kind: 'first-order',  config: auditTimeConfig },
	sampleTime:            { kind: 'first-order',  config: sampleTimeConfig },
	sample:                { kind: 'first-order',  config: sampleConfig },
	bufferTime:            { kind: 'first-order',  config: bufferTimeConfig },
	bufferCount:           { kind: 'first-order',  config: bufferCountConfig },
	buffer:                { kind: 'first-order',  config: bufferConfig },
	windowTime:            { kind: 'first-order',  config: windowTimeConfig },
	windowCount:           { kind: 'first-order',  config: windowCountConfig },
	delay:                 { kind: 'first-order',  config: delayConfig },
	delayWhen:             { kind: 'first-order',  config: delayWhenConfig },
	take:                  { kind: 'first-order',  config: takeConfig },
	takeWhile:             { kind: 'first-order',  config: takeWhileConfig },
	takeUntil:             { kind: 'first-order',  config: takeUntilConfig },
	skip:                  { kind: 'first-order',  config: skipConfig },
	skipWhile:             { kind: 'first-order',  config: skipWhileConfig },
	skipUntil:             { kind: 'first-order',  config: skipUntilConfig },
	first:                 { kind: 'first-order',  config: firstConfig },
	last:                  { kind: 'first-order',  config: lastConfig },
	forkJoin:              { kind: 'first-order',  config: forkJoinConfig },
	combineLatest:         { kind: 'first-order',  config: combineLatestConfig },
	withLatestFrom:        { kind: 'first-order',  config: withLatestFromConfig },
	zip:                   { kind: 'first-order',  config: zipConfig },
	merge:                 { kind: 'first-order',  config: mergeConfig },
	concat:                { kind: 'first-order',  config: concatConfig },
	race:                  { kind: 'first-order',  config: raceConfig },
	catchError:            { kind: 'first-order',  config: catchErrorConfig },
	retry:                 { kind: 'first-order',  config: retryConfig },
	retryWhen:             { kind: 'first-order',  config: retryWhenConfig },
	onErrorResumeNextWith: { kind: 'first-order',  config: onErrorResumeNextWithConfig },
	timeout:               { kind: 'first-order',  config: timeoutConfig },
	shareReplay:           { kind: 'first-order',  config: shareReplayConfig },
	share:                 { kind: 'first-order',  config: shareConfig },
	every:                 { kind: 'first-order',  config: everyConfig },
	find:                  { kind: 'first-order',  config: findConfig },
	findIndex:             { kind: 'first-order',  config: findIndexConfig },
	isEmpty:               { kind: 'first-order',  config: isEmptyConfig },
	defaultIfEmpty:        { kind: 'first-order',  config: defaultIfEmptyConfig },
	materialize:           { kind: 'first-order',  config: materializeConfig },
	dematerialize:         { kind: 'first-order',  config: dematerializeConfig },
	Subject:               { kind: 'first-order',  config: subjectConfig },
	BehaviorSubject:       { kind: 'first-order',  config: behaviorSubjectConfig },
	ReplaySubject:         { kind: 'first-order',  config: replaySubjectConfig },
	publish:               { kind: 'first-order',  config: publishConfig },
	tap:                   { kind: 'first-order',  config: tapConfig },
	finalize:              { kind: 'first-order',  config: finalizeConfig },
}

export function getMarbleSVG(wikiPath: string): string | null {
	const key = wikiPath.split('/').pop() ?? ''
	const entry = registry[key]
	if (!entry) return null
	if (entry.kind === 'higher-order') return renderHigherOrderSVG(entry.config)
	return renderFirstOrderSVG(entry.config)
}
