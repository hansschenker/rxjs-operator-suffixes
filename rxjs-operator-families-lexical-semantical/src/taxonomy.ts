export interface Operator {
  readonly name: string
  readonly slug: string
  readonly tagline: string
}

export interface SubFamily {
  readonly label: string
  readonly operators: readonly Operator[]
}

export interface Family {
  readonly label: string
  readonly letter: string
  readonly subFamilies: readonly SubFamily[]
}

export const taxonomy: readonly Family[] = [
  {
    label: 'Creation / Adaptation',
    letter: 'B',
    subFamilies: [
      {
        label: 'Web callbacks',
        operators: [
          { name: 'fromEvent', slug: 'fromEvent', tagline: 'Create stream from DOM or Node.js event' },
          { name: 'fromEventPattern', slug: 'fromEventPattern', tagline: 'Wrap add/remove handler pairs as Observable' },
          { name: 'bindCallback', slug: 'bindCallback', tagline: 'Convert Node-style callback function to Observable factory' },
          { name: 'bindNodeCallback', slug: 'bindNodeCallback', tagline: 'Convert Node-style error-first callback to Observable factory' },
        ]
      },
      {
        label: 'Create on subscription',
        operators: [
          { name: 'defer', slug: 'defer', tagline: 'Create a fresh Observable for each subscriber' },
        ]
      },
      {
        label: 'From values / containers',
        operators: [
          { name: 'of', slug: 'of', tagline: 'Emit a fixed list of values then complete' },
          { name: 'from', slug: 'from', tagline: 'Convert array, Promise, iterable or Observable-like to Observable' },
          { name: 'fromFetch', slug: 'fromFetch', tagline: 'Wrap fetch() with cancellation on unsubscribe' },
        ]
      },
      {
        label: 'Generate values',
        operators: [
          { name: 'interval', slug: 'interval', tagline: 'Emit incrementing integers on a fixed timer' },
          { name: 'timer', slug: 'timer', tagline: 'Emit after a delay, optionally repeat on interval' },
          { name: 'range', slug: 'range', tagline: 'Emit a sequential range of integers synchronously' },
          { name: 'generate', slug: 'generate', tagline: 'Emit values produced by a custom iterator-like loop' },
        ]
      },
      {
        label: 'Create terminal / empty',
        operators: [
          { name: 'throwError', slug: 'throwError', tagline: 'Create an Observable that immediately errors' },
          { name: 'EMPTY', slug: 'EMPTY', tagline: 'Observable that completes immediately without emitting' },
          { name: 'NEVER', slug: 'NEVER', tagline: 'Observable that never emits, errors, or completes' },
        ]
      },
      {
        label: 'Conditional creation',
        operators: [
          { name: 'iif', slug: 'iif', tagline: 'Subscribe to one of two Observables based on a condition' },
        ]
      },
    ]
  },
  {
    label: 'Static Multi-Source Combination',
    letter: 'C',
    subFamilies: [
      {
        label: 'Latest values from all',
        operators: [
          { name: 'combineLatest', slug: 'combineLatest', tagline: 'Emit array of latest values whenever any source emits' },
          { name: 'combineLatestWith', slug: 'combineLatestWith', tagline: 'Pipe-friendly combineLatest with one other source' },
          { name: 'combineLatestAll', slug: 'combineLatestAll', tagline: 'Flatten higher-order Observable using combineLatest' },
        ]
      },
      {
        label: 'One after another',
        operators: [
          { name: 'concat', slug: 'concat', tagline: 'Subscribe to sources in sequence, wait for each to complete' },
          { name: 'concatWith', slug: 'concatWith', tagline: 'Pipe-friendly concat with one or more sources' },
        ]
      },
      {
        label: 'As values arrive',
        operators: [
          { name: 'merge', slug: 'merge', tagline: 'Subscribe to all sources at once, emit as values arrive' },
          { name: 'mergeWith', slug: 'mergeWith', tagline: 'Pipe-friendly merge with one or more sources' },
        ]
      },
      {
        label: 'First source wins',
        operators: [
          { name: 'race', slug: 'race', tagline: 'Mirror the first source to emit, ignore the rest' },
          { name: 'raceWith', slug: 'raceWith', tagline: 'Pipe-friendly race against one or more sources' },
        ]
      },
      {
        label: 'Align by position',
        operators: [
          { name: 'zip', slug: 'zip', tagline: 'Pair nth values from each source into arrays' },
          { name: 'zipWith', slug: 'zipWith', tagline: 'Pipe-friendly zip with one or more sources' },
          { name: 'zipAll', slug: 'zipAll', tagline: 'Flatten higher-order Observable using zip semantics' },
        ]
      },
      {
        label: 'Final values after all complete',
        operators: [
          { name: 'forkJoin', slug: 'forkJoin', tagline: 'Emit last value from each source once all complete' },
        ]
      },
    ]
  },
  {
    label: 'Projection / Shape Change',
    letter: 'D',
    subFamilies: [
      {
        label: 'Value projection',
        operators: [
          { name: 'map', slug: 'map', tagline: 'Transform each value with a projection function' },
          { name: 'mapTo', slug: 'mapTo', tagline: 'Replace every emitted value with a constant' },
          { name: 'pairwise', slug: 'pairwise', tagline: 'Emit [previous, current] pairs on each emission' },
        ]
      },
      {
        label: 'Collect values into arrays',
        operators: [
          { name: 'bufferCount', slug: 'bufferCount', tagline: 'Collect N values then emit as array' },
          { name: 'bufferTime', slug: 'bufferTime', tagline: 'Collect values for a time window then emit as array' },
          { name: 'bufferWhen', slug: 'bufferWhen', tagline: 'Collect values until a closing Observable emits' },
          { name: 'bufferToggle', slug: 'bufferToggle', tagline: 'Open/close buffer windows with separate Observables' },
          { name: 'buffer', slug: 'buffer', tagline: 'Collect values until a notifier Observable emits' },
        ]
      },
      {
        label: 'Cut stream into inner Observables',
        operators: [
          { name: 'windowCount', slug: 'windowCount', tagline: 'Emit inner Observables of N values each' },
          { name: 'windowTime', slug: 'windowTime', tagline: 'Emit inner Observables for each time window' },
          { name: 'windowWhen', slug: 'windowWhen', tagline: 'Open new inner Observable when closing Observable emits' },
          { name: 'windowToggle', slug: 'windowToggle', tagline: 'Open/close inner Observable windows with separate Observables' },
          { name: 'window', slug: 'window', tagline: 'Cut source into inner Observables on each notifier emission' },
        ]
      },
    ]
  },
  {
    label: 'Filtering / Selection',
    letter: 'E',
    subFamilies: [
      {
        label: 'Filter by predicate',
        operators: [
          { name: 'filter', slug: 'filter', tagline: 'Pass only values that satisfy a predicate' },
        ]
      },
      {
        label: 'Global uniqueness',
        operators: [
          { name: 'distinct', slug: 'distinct', tagline: 'Suppress values already seen anywhere in the stream' },
        ]
      },
      {
        label: 'Neighbor-based uniqueness',
        operators: [
          { name: 'distinctUntilChanged', slug: 'distinctUntilChanged', tagline: 'Suppress consecutive duplicate values' },
          { name: 'distinctUntilKeyChanged', slug: 'distinctUntilKeyChanged', tagline: 'Suppress consecutive duplicates by object key' },
        ]
      },
      {
        label: 'Select a particular value',
        operators: [
          { name: 'first', slug: 'first', tagline: 'Emit only the first value (or first matching predicate)' },
          { name: 'last', slug: 'last', tagline: 'Emit only the last value before completion' },
          { name: 'elementAt', slug: 'elementAt', tagline: 'Emit only the value at a specific index' },
          { name: 'single', slug: 'single', tagline: 'Emit the only value; error if zero or more than one match' },
        ]
      },
      {
        label: 'Suppress all values',
        operators: [
          { name: 'ignoreElements', slug: 'ignoreElements', tagline: 'Pass through only error and complete notifications' },
        ]
      },
      {
        label: 'Filter by position / lifetime',
        operators: [
          { name: 'take', slug: 'take', tagline: 'Emit the first N values then complete' },
          { name: 'takeLast', slug: 'takeLast', tagline: 'Emit the last N values when source completes' },
          { name: 'takeUntil', slug: 'takeUntil', tagline: 'Complete when a notifier Observable emits' },
          { name: 'takeWhile', slug: 'takeWhile', tagline: 'Complete as soon as predicate returns false' },
          { name: 'skip', slug: 'skip', tagline: 'Ignore the first N values' },
          { name: 'skipLast', slug: 'skipLast', tagline: 'Ignore the last N values' },
          { name: 'skipUntil', slug: 'skipUntil', tagline: 'Ignore values until a notifier Observable emits' },
          { name: 'skipWhile', slug: 'skipWhile', tagline: 'Ignore values while predicate holds true' },
        ]
      },
      {
        label: 'Search-like selection',
        operators: [
          { name: 'find', slug: 'find', tagline: 'Emit the first value matching a predicate then complete' },
          { name: 'findIndex', slug: 'findIndex', tagline: 'Emit the index of the first value matching a predicate' },
        ]
      },
    ]
  },
  {
    label: 'Flattening Policies',
    letter: 'F',
    subFamilies: [
      {
        label: 'Allow overlap',
        operators: [
          { name: 'mergeMap', slug: 'mergeMap', tagline: 'Subscribe to every inner Observable concurrently' },
          { name: 'mergeAll', slug: 'mergeAll', tagline: 'Flatten higher-order Observable with unlimited concurrency' },
        ]
      },
      {
        label: 'Queue — preserve order',
        operators: [
          { name: 'concatMap', slug: 'concatMap', tagline: 'Wait for each inner Observable to complete before next' },
          { name: 'concatAll', slug: 'concatAll', tagline: 'Flatten higher-order Observable sequentially' },
        ]
      },
      {
        label: 'Only latest',
        operators: [
          { name: 'switchMap', slug: 'switchMap', tagline: 'Cancel previous inner Observable, subscribe to latest' },
          { name: 'switchAll', slug: 'switchAll', tagline: 'Flatten higher-order Observable, always switching to latest' },
          { name: 'switchScan', slug: 'switchScan', tagline: 'Accumulate state with switchMap flattening policy' },
        ]
      },
      {
        label: 'Ignore while busy',
        operators: [
          { name: 'exhaustMap', slug: 'exhaustMap', tagline: 'Ignore new source values while inner Observable is active' },
          { name: 'exhaustAll', slug: 'exhaustAll', tagline: 'Flatten higher-order Observable, dropping while busy' },
        ]
      },
    ]
  },
  {
    label: 'State / Accumulation / Reduction',
    letter: 'G',
    subFamilies: [
      {
        label: 'Continuous accumulation',
        operators: [
          { name: 'scan', slug: 'scan', tagline: 'Emit running accumulated state on every value' },
        ]
      },
      {
        label: 'Final reduction',
        operators: [
          { name: 'reduce', slug: 'reduce', tagline: 'Emit a single accumulated result when source completes' },
        ]
      },
      {
        label: 'Stateful higher-order reducers',
        operators: [
          { name: 'mergeScan', slug: 'mergeScan', tagline: 'Accumulate state where each step returns an Observable' },
        ]
      },
    ]
  },
  {
    label: 'Grouping / Branching / Recursive Expansion',
    letter: 'H',
    subFamilies: [
      {
        label: 'Split into two branches',
        operators: [
          { name: 'partition', slug: 'partition', tagline: 'Split one Observable into [truthy, falsy] tuple' },
        ]
      },
      {
        label: 'Group into keyed inner streams',
        operators: [
          { name: 'groupBy', slug: 'groupBy', tagline: 'Emit GroupedObservable per unique key value' },
        ]
      },
      {
        label: 'Recursive expansion',
        operators: [
          { name: 'expand', slug: 'expand', tagline: 'Recursively project values into Observables and merge' },
        ]
      },
    ]
  },
  {
    label: 'Time Control',
    letter: 'I',
    subFamilies: [
      {
        label: 'Time shifting — non-lossy',
        operators: [
          { name: 'delay', slug: 'delay', tagline: 'Shift all emissions forward in time by a fixed duration' },
          { name: 'delayWhen', slug: 'delayWhen', tagline: 'Delay each value by a duration returned per-value' },
        ]
      },
      {
        label: 'Lossy time-based gating',
        operators: [
          { name: 'debounce', slug: 'debounce', tagline: 'Emit value only after silence period from a notifier' },
          { name: 'debounceTime', slug: 'debounceTime', tagline: 'Emit value only after N ms of silence' },
          { name: 'throttle', slug: 'throttle', tagline: 'Emit first value then ignore for duration from notifier' },
          { name: 'throttleTime', slug: 'throttleTime', tagline: 'Emit first value then suppress for N ms' },
          { name: 'audit', slug: 'audit', tagline: 'Emit latest value after silence from a notifier Observable' },
          { name: 'auditTime', slug: 'auditTime', tagline: 'Emit latest value after N ms window' },
          { name: 'sample', slug: 'sample', tagline: 'Emit latest value whenever a notifier Observable emits' },
          { name: 'sampleTime', slug: 'sampleTime', tagline: 'Emit latest value on a fixed timer interval' },
        ]
      },
      {
        label: 'Time metadata / measurement',
        operators: [
          { name: 'timeInterval', slug: 'timeInterval', tagline: 'Annotate each value with the elapsed time since previous' },
          { name: 'timestamp', slug: 'timestamp', tagline: 'Annotate each value with the wall-clock time of emission' },
        ]
      },
    ]
  },
  {
    label: 'Combination by Context / Sequence Augmentation',
    letter: 'J',
    subFamilies: [
      {
        label: 'Combine with latest side input',
        operators: [
          { name: 'withLatestFrom', slug: 'withLatestFrom', tagline: 'Sample a second stream on each source emission' },
        ]
      },
      {
        label: 'Add values at boundaries',
        operators: [
          { name: 'startWith', slug: 'startWith', tagline: 'Prepend one or more values before source emissions' },
          { name: 'endWith', slug: 'endWith', tagline: 'Append one or more values after source completes' },
        ]
      },
    ]
  },
  {
    label: 'Sharing / Multicasting',
    letter: 'K',
    subFamilies: [
      {
        label: 'Explicit multicast / connectable',
        operators: [
          { name: 'publish', slug: 'publish', tagline: 'Make Observable connectable with a Subject' },
          { name: 'publishBehavior', slug: 'publishBehavior', tagline: 'Connectable Observable backed by a BehaviorSubject' },
          { name: 'publishLast', slug: 'publishLast', tagline: 'Connectable Observable backed by an AsyncSubject' },
          { name: 'publishReplay', slug: 'publishReplay', tagline: 'Connectable Observable backed by a ReplaySubject' },
          { name: 'multicast', slug: 'multicast', tagline: 'Multicast through a provided Subject' },
          { name: 'connectable', slug: 'connectable', tagline: 'Create a connectable Observable from any source' },
        ]
      },
      {
        label: 'Automatic shared execution',
        operators: [
          { name: 'share', slug: 'share', tagline: 'Share a single subscription among multiple subscribers' },
          { name: 'shareReplay', slug: 'shareReplay', tagline: 'Share and replay last N values to late subscribers' },
        ]
      },
    ]
  },
  {
    label: 'Inspection / Notification Conversion',
    letter: 'L',
    subFamilies: [
      {
        label: 'Peek without changing stream',
        operators: [
          { name: 'tap', slug: 'tap', tagline: 'Perform side effects on each emission without altering values' },
          { name: 'finalize', slug: 'finalize', tagline: 'Execute a callback when the Observable terminates for any reason' },
        ]
      },
      {
        label: 'Convert notifications ↔ values',
        operators: [
          { name: 'materialize', slug: 'materialize', tagline: 'Wrap each notification as a Notification value object' },
          { name: 'dematerialize', slug: 'dematerialize', tagline: 'Unwrap Notification objects back into notifications' },
        ]
      },
    ]
  },
  {
    label: 'Scheduler Control',
    letter: 'M',
    subFamilies: [
      {
        label: 'Shift downstream notifications',
        operators: [
          { name: 'observeOn', slug: 'observeOn', tagline: 'Deliver all notifications on a specified scheduler' },
        ]
      },
      {
        label: 'Shift subscription side effects',
        operators: [
          { name: 'subscribeOn', slug: 'subscribeOn', tagline: 'Perform subscription on a specified scheduler' },
        ]
      },
    ]
  },
  {
    label: 'Error / Recovery / Timeout',
    letter: 'N',
    subFamilies: [
      {
        label: 'Recover from error',
        operators: [
          { name: 'catchError', slug: 'catchError', tagline: 'Replace an errored stream with a recovery Observable' },
          { name: 'onErrorResumeNextWith', slug: 'onErrorResumeNextWith', tagline: 'Continue with next source regardless of error or completion' },
        ]
      },
      {
        label: 'Retry policy',
        operators: [
          { name: 'retry', slug: 'retry', tagline: 'Re-subscribe on error, up to N times' },
          { name: 'retryWhen', slug: 'retryWhen', tagline: 'Re-subscribe on error when a notifier Observable emits' },
          { name: 'repeat', slug: 'repeat', tagline: 'Re-subscribe after completion, up to N times' },
          { name: 'repeatWhen', slug: 'repeatWhen', tagline: 'Re-subscribe after completion when a notifier Observable emits' },
        ]
      },
      {
        label: 'Fail on timing condition',
        operators: [
          { name: 'timeout', slug: 'timeout', tagline: 'Error if no value arrives within a time limit' },
          { name: 'timeoutWith', slug: 'timeoutWith', tagline: 'Switch to a fallback Observable if no value arrives in time' },
        ]
      },
    ]
  },
  {
    label: 'Interop / Boundary Conversion',
    letter: 'O',
    subFamilies: [
      {
        label: 'Convert out of Observable world',
        operators: [
          { name: 'toArray', slug: 'toArray', tagline: 'Collect all values into an array, emit on completion' },
          { name: 'firstValueFrom', slug: 'firstValueFrom', tagline: 'Await the first value as a Promise' },
          { name: 'lastValueFrom', slug: 'lastValueFrom', tagline: 'Await the last value as a Promise' },
        ]
      },
    ]
  },
]
