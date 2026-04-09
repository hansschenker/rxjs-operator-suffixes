# RxJS Core Stream Machines

A small, readable set of stream machines that sit underneath many RxJS operators.

---

## 1. Read current value when something happens

**Machine:** `when(trigger, behavior)`

**Meaning:**
When the trigger emits, read the current remembered value.

**What flows over time:**
- trigger events
- a current contextual value

**Typical use:**
- read current state on click
- gate a source by current permission
- compare current value with previous value

**RxJS under it:**
- `withLatestFrom`
- `sample` (if you swap which stream is the trigger)
- `pairwise` / `distinctUntilChanged` after adding memory

**Friendly forms:**
- `when(state$)`
- `whenTrue(gate$)`
- `at(clock$, value$)`

---

## 2. Recompute the current tuple when any input changes

**Machine:** `wheneverAny(inputs...)`

**Meaning:**
Whenever any input emits, recompute using the latest value from all inputs.

**What flows over time:**
- multiple remembered latest values
- updates from any side

**Typical use:**
- derive view-models from multiple state streams
- combine filters, sort, query, data

**RxJS under it:**
- `combineLatest`
- `combineLatestWith`

**Friendly form:**
- `wheneverAny(a$, b$, c$)`

---

## 3. Let values through only under a condition or lifecycle window

**Machine:** `gate(source, condition)`

**Meaning:**
Values try to pass. A gate decides whether they may continue.

**What flows over time:**
- source values
- open/closed state

**Typical use:**
- ignore until started
- stop when destroyed
- allow only while enabled

**RxJS under it:**
- `filter`
- `skipUntil`
- `takeUntil`
- `takeWhile`
- `skipWhile`

**Friendly forms:**
- `whenTrue(gate$)`
- `after(start$)`
- `until(stop$)`
- `during(open$)`

---

## 4. Change the time shape of a stream

**Machine:** `shapeTime(source, policy)`

**Meaning:**
Keep the same source values, but apply a timing rule.

**What flows over time:**
- source values
- time windows / silence periods / delays

**Typical use:**
- wait for silence before searching
- emit first click, then ignore bursts
- emit latest value at window end
- delay values

**RxJS under it:**
- `debounceTime`
- `throttleTime`
- `auditTime`
- `sampleTime`
- `delay`

**Friendly forms:**
- `afterQuiet(ms)`
- `firstThenPause(ms)`
- `lastAtWindowEnd(ms)`
- `laterBy(ms)`

---

## 5. Remember and evolve state over time

**Machine:** `evolve(events, reducer, seed)`

**Meaning:**
Each event updates the current state. The new state is remembered for the next event.

**What flows over time:**
- events/actions
- current state
- next state

**Typical use:**
- counters
- forms
- game state
- UI view-models

**RxJS under it:**
- `scan`
- often followed by `startWith` and `shareReplay(1)`

**Friendly forms:**
- `accumulate(reducer, seed)`
- `evolve(state$, reducer)`

**Practical rule:**
State is a stream that remembers.

---

## 6. Start inner work for each event, then choose an overlap policy

**Machine:** `forEach(event, project, policy)`

**Meaning:**
Each source value starts inner work. The policy decides what to do if new work starts before old work finishes.

**What flows over time:**
- outer trigger events
- inner streams
- overlap policy

**Typical use:**
- requests
- save operations
- typeahead
- button spam protection

**RxJS under it:**
- `mergeMap`
- `switchMap`
- `concatMap`
- `exhaustMap`

**Friendly forms:**
- `forEach(project, 'merge')` → allow overlap
- `forEach(project, 'switch')` → only latest
- `forEach(project, 'concat')` → queue
- `forEach(project, 'exhaust')` → ignore while busy

---

## 7. Choose how multiple sources coexist

**Machine:** `composeMany(sources, topology)`

**Meaning:**
Multiple sources are present. Topology decides how they are arranged.

**What flows over time:**
- values from multiple sources
- rules for coexistence or ordering

**Typical use:**
- forward all values from all sources
- run one source after another
- align values by position

**RxJS under it:**
- `merge`
- `concat`
- `zip`
- `race`
- `forkJoin`

**Friendly forms:**
- `either(a$, b$)`
- `then(a$, b$)`
- `togetherByIndex(a$, b$)`
- `firstToWin(a$, b$)`
- `onceAllComplete(a$, b$)`

---

## 8. Choose execution sharing and memory for subscribers

**Machine:** `shareExecution(source, memory)`

**Meaning:**
Decide whether each subscriber gets a fresh execution or whether execution is shared, and whether past values are remembered.

**What flows over time:**
- subscriptions
- source execution
- replayed memory

**Typical use:**
- share one HTTP/cache stream
- keep latest state available
- avoid duplicate side effects

**RxJS under it:**
- `share`
- `shareReplay`
- `publish` / old multicasting ideas
- `BehaviorSubject`-style current value behavior

**Friendly forms:**
- `shareWhileObserved()`
- `rememberLatest()`
- `replayLast(n)`

---

# Minimal set

If you want the smallest useful basis, use these **6 core machines**:

1. **Read current value on trigger** — `when(...)`
2. **Recompute on any input change** — `wheneverAny(...)`
3. **Gate flow** — `after(...)`, `until(...)`, `whenTrue(...)`
4. **Shape time** — `afterQuiet(...)`, `firstThenPause(...)`
5. **Evolve state** — `accumulate(...)` / `evolve(...)`
6. **Flatten by policy** — `forEach(..., policy)`

Everything else is usually a specialization of one of these.

---

# The smallest teaching sentence for each

- **when**: when this happens, read the current value there
- **wheneverAny**: whenever any input changes, recompute from the latest of all
- **gate**: values may pass only under this condition
- **shapeTime**: keep the values, change the timing rule
- **evolve**: each event updates remembered state
- **forEach + policy**: each event starts work; policy handles overlap

---

# One practical map

| Friendly machine | Main RxJS family |
|---|---|
| `when(...)` | `withLatestFrom`, `sample` |
| `wheneverAny(...)` | `combineLatest` |
| `gate(...)` | `filter`, `skipUntil`, `takeUntil` |
| `shapeTime(...)` | `debounceTime`, `throttleTime`, `auditTime`, `delay` |
| `evolve(...)` | `scan` |
| `forEach(..., policy)` | `switchMap`, `mergeMap`, `concatMap`, `exhaustMap` |
| `composeMany(..., topology)` | `merge`, `concat`, `zip`, `race`, `forkJoin` |
| `shareExecution(..., memory)` | `share`, `shareReplay` |

---

# Runtime contract for the 6 core machines

## 1. `when(behavior)`

**Runtime rule:**
When the source emits, read the latest value from `behavior`, then emit a pair or a projection.

**Who drives time:**
- the source

**What memory is required:**
- latest value of `behavior`

**First emission requirement:**
- the source alone is not enough
- `behavior` must already have emitted at least once

**Typical outputs:**
- `[event, behavior]`
- projected value from both

**Best operator family match:**
- `withLatestFrom`
- source-driven sampling
- source-driven gating

**One-line teaching phrase:**
- when this happens, read the current value there

---

## 2. `wheneverAny(inputs...)`

**Runtime rule:**
Whenever any input emits, recompute from the latest remembered value of all required inputs.

**Who drives time:**
- any input

**What memory is required:**
- latest value of every input

**First emission requirement:**
- every required input must have emitted at least once

**Typical outputs:**
- a tuple of latest values
- a projection derived from the tuple

**Best operator family match:**
- `combineLatest`
- derived view-model construction

**One-line teaching phrase:**
- whenever any input changes, recompute from the latest of all

---

## 3. `gate(condition)`

**Runtime rule:**
Source values attempt to pass. A condition or lifecycle state decides whether they continue.

**Who drives time:**
- usually the source
- sometimes a notifier changes the gate state

**What memory is required:**
- current gate state, or a predicate evaluated per source value

**First emission requirement:**
- depends on the kind of gate
- stateful gates usually need an initial open/closed value

**Typical outputs:**
- original source values that were allowed through

**Best operator family match:**
- `filter`
- `skipUntil`
- `takeUntil`
- `takeWhile`
- `skipWhile`

**One-line teaching phrase:**
- values may pass only under this condition

---

## 4. `shapeTime(policy)`

**Runtime rule:**
Preserve the value stream conceptually, but apply a timing policy that delays, suppresses, samples, or batches emissions.

**Who drives time:**
- source values plus time windows or notifiers

**What memory is required:**
- often the latest pending value
- sometimes a busy/open timer window

**First emission requirement:**
- depends on the policy
- some policies emit immediately, others only after silence or window end

**Typical outputs:**
- source values at different timestamps
- possibly fewer values than came in

**Best operator family match:**
- `debounceTime`
- `throttleTime`
- `auditTime`
- `sampleTime`
- `delay`

**One-line teaching phrase:**
- keep the values, change the timing rule

---

## 5. `evolve(reducer, seed)`

**Runtime rule:**
Each source event updates remembered state. The new state becomes the current state for the next event.

**Who drives time:**
- the source event stream

**What memory is required:**
- current accumulated state

**First emission requirement:**
- an initial seed, or some other initial state source

**Typical outputs:**
- the full state after each update
- sometimes derived state slices

**Best operator family match:**
- `scan`
- reducer-driven state machines
- MVU-style state transitions

**One-line teaching phrase:**
- each event updates remembered state

---

## 6. `forEach(project, policy)`

**Runtime rule:**
Each source value starts inner work. The policy decides what happens if a new source value arrives while earlier inner work is still active.

**Who drives time:**
- the source starts inner work
- inner streams produce output timing after that

**What memory is required:**
- active inner subscriptions
- possibly a queue or busy flag depending on policy

**First emission requirement:**
- the source must emit
- then the projected inner observable must emit

**Typical outputs:**
- values from projected inner streams

**Best operator family match:**
- `mergeMap`
- `switchMap`
- `concatMap`
- `exhaustMap`

**Policy meanings:**
- `merge` = allow overlap
- `switch` = only latest
- `concat` = queue
- `exhaust` = ignore while busy

**One-line teaching phrase:**
- each event starts work; policy handles overlap

---

# Strongest distinctions between the machines

## Source-driven read vs symmetric recompute

- `when(...)` is asymmetric: the source is the driver
- `wheneverAny(...)` is symmetric: any input can trigger recomputation

## Gate vs time shape

- `gate(...)` decides whether a value may pass
- `shapeTime(...)` decides when a value may appear

## Evolve vs when

- `when(...)` reads current state
- `evolve(...)` changes current state

## forEach vs the others

- `forEach(..., policy)` is not about reading latest memory
- it is about starting inner work and managing overlap between executions

---

# A compact design pack for each machine

For each stream machine, describe it with these 6 questions:

1. **What drives time?**
2. **What memory is retained?**
3. **What must happen before the first output?**
4. **What happens on a new source value?**
5. **Can values be dropped, delayed, replaced, or queued?**
6. **What happens when subscriptions end?**

---

# Operator → machine map

| RxJS operator / family | Core machine | Who drives time | Main memory | Main rule |
|---|---|---|---|---|
| `withLatestFrom` | `when(...)` | source | latest from other input | when source emits, read current other value |
| `sample` | `when(...)` with reversed roles | notifier/clock | latest source value | when notifier emits, read current source value |
| `pairwise` | `when(...)` + previous memory | source | previous source value | on each new value, emit previous + current |
| `distinctUntilChanged` | `when(...)` + previous memory | source | last emitted value | compare current against previous |
| `combineLatest` / `combineLatestWith` | `wheneverAny(...)` | any input | latest of all inputs | whenever any input changes, recompute from all latest |
| `filter` | `gate(...)` | source | none or predicate only | values pass only if condition holds |
| `skipUntil` | `gate(...)` | source after notifier opens gate | start/open state | ignore until gate opens |
| `takeUntil` | `gate(...)` | source until notifier closes gate | stop/closed state | pass until stop signal arrives |
| `debounceTime` | `shapeTime(...)` | source + silence window | latest pending value | emit only after quiet period |
| `throttleTime` | `shapeTime(...)` | source + busy window | busy/open window, sometimes latest | emit first, then suppress for a period |
| `auditTime` | `shapeTime(...)` | source + window end | latest value during window | emit latest at the end of the window |
| `delay` | `shapeTime(...)` | source | pending delayed values | same values, later timestamps |
| `scan` | `evolve(...)` | source | accumulated state | each value updates remembered state |
| `mergeMap` | `forEach(..., 'merge')` | source starts inner work | active inner subscriptions | allow overlap |
| `switchMap` | `forEach(..., 'switch')` | source starts inner work | current active inner only | only latest |
| `concatMap` | `forEach(..., 'concat')` | source starts inner work | queue of pending inners | queue |
| `exhaustMap` | `forEach(..., 'exhaust')` | source starts inner work | busy flag / current inner | ignore while busy |
| `merge` | `composeMany(..., topology)` | any input | no latest tuple needed | forward values from all sources |
| `concat` | `composeMany(..., topology)` | current active source | source ordering | run next source after previous completes |
| `zip` | `composeMany(..., topology)` | all inputs jointly | per-input queues | align values by position |
| `share` | `shareExecution(..., memory)` | source execution | subscriber count / shared execution | one execution, shared subscribers |
| `shareReplay` | `shareExecution(..., memory)` | source execution | replay buffer | share execution and remember past values |

---

# Why each family belongs where it does

## `when(...)`

Use this family when the output is **source-driven** and another stream only supplies current context.

Typical question:
- when this event happens, what is the current value over there?

## `wheneverAny(...)`

Use this family when the output is **symmetrically recomputed** from the latest of multiple inputs.

Typical question:
- whenever any dependency changes, what is the latest derived value now?

## `gate(...)`

Use this family when values are trying to pass and some condition or lifecycle state decides whether they continue.

Typical question:
- may this value pass right now?

## `shapeTime(...)`

Use this family when the values conceptually stay the same, but the timing policy changes.

Typical question:
- should this value appear now, later, only after silence, or only at window end?

## `evolve(...)`

Use this family when each event changes remembered state.

Typical question:
- given current state and new event, what is the next state?

## `forEach(..., policy)`

Use this family when each source value starts inner work and overlap policy is the main concern.

Typical question:
- if new work starts before old work finishes, do we overlap, replace, queue, or ignore?

## `composeMany(..., topology)`

Use this family when multiple sources coexist and you need a topology rule.

Typical question:
- do these sources run together, one after another, by index, or in a race?

## `shareExecution(..., memory)`

Use this family when subscription topology matters.

Typical question:
- does each subscriber get a fresh execution, or do they share one, and is any past value remembered?

---

# Fast operator classification test

To place an RxJS operator into a machine, ask in this order:

1. **Is this mainly about reading current remembered context when something happens?** → `when(...)`
2. **Is this mainly about recomputing from the latest of multiple dependencies?** → `wheneverAny(...)`
3. **Is this mainly about allowing or blocking values?** → `gate(...)`
4. **Is this mainly about changing timing without changing the core value meaning?** → `shapeTime(...)`
5. **Is this mainly about updating state over time?** → `evolve(...)`
6. **Is this mainly about starting inner work and choosing an overlap policy?** → `forEach(..., policy)`
7. **Is this mainly about how multiple sources coexist structurally?** → `composeMany(..., topology)`
8. **Is this mainly about unicast vs shared execution and replay memory?** → `shareExecution(..., memory)`

---

# Detailed runtime table

| RxJS operator / family | Core machine | Trigger | Retained memory | First emission rule | Drop / queue / replace policy |
|---|---|---|---|---|---|
| `withLatestFrom` | `when(...)` | source only | latest from other input(s) | source must emit, and every required other input must have emitted at least once | none by itself |
| `sample` | `when(...)` with reversed roles | notifier | latest source value | notifier must emit, and source must have emitted at least once | intermediate source values are overwritten by newer latest values |
| `pairwise` | `when(...)` + previous memory | source | previous source value | needs at least two source values | none; first value is held as memory |
| `distinctUntilChanged` | `when(...)` + previous memory | source | last emitted value | first source value emits immediately | repeated equal values are dropped |
| `combineLatest` / `combineLatestWith` | `wheneverAny(...)` | any input | latest of every input | each required input must emit at least once | intermediate per-input history is overwritten by latest values |
| `filter` | `gate(...)` | source | none beyond predicate / optional external gate state | first source value can emit if predicate passes | failing values are dropped |
| `skipUntil` | `gate(...)` | source after gate opens | started/open state | notifier must emit once before source can pass | pre-open values are dropped |
| `takeUntil` | `gate(...)` | source until stop signal | stopped/closed state | source values emit immediately until notifier emits | post-stop values are dropped by completion |
| `debounceTime` | `shapeTime(...)` | source + silence timer | latest pending value, active timer | emits only after quiet period elapses | earlier pending values are replaced by newer ones |
| `throttleTime` | `shapeTime(...)` | source + throttle window | busy/open window, optionally trailing latest | usually first source value emits immediately | values during busy window are dropped, or trailing one may be kept depending on config |
| `auditTime` | `shapeTime(...)` | source starts window, window end emits | latest value seen during window | no immediate first output; window must end | intermediate values inside window are replaced by the latest |
| `delay` | `shapeTime(...)` | source | pending delayed notifications | each source value emits after its delay | none; values are shifted later |
| `scan` | `evolve(...)` | source | accumulated state | source must emit; seed provides initial state | none by itself |
| `mergeMap` | `forEach(..., 'merge')` | source starts inner work | active inner subscriptions | source must emit, then an inner must emit | none; overlap allowed |
| `switchMap` | `forEach(..., 'switch')` | source starts inner work | current inner subscription only | source must emit, then latest inner must emit | previous active inner is replaced/cancelled |
| `concatMap` | `forEach(..., 'concat')` | source starts inner work | current inner + queue of pending inners | source must emit, then current inner must emit | later work is queued |
| `exhaustMap` | `forEach(..., 'exhaust')` | source starts inner work | busy flag + current inner | source must emit, then first active inner must emit | new work while busy is dropped |
| `merge` | `composeMany(..., topology)` | any input | no shared tuple memory required | any input can emit immediately | none; forward all |
| `concat` | `composeMany(..., topology)` | current active source | source ordering / current source index | first source can emit immediately; next waits for completion of previous | later sources are queued by source order |
| `zip` | `composeMany(..., topology)` | joint availability across inputs | per-input queues | each input must provide the next matching item | values are queued until partners arrive |
| `share` | `shareExecution(..., memory)` | source execution shared by subscribers | subscriber count / shared connection | output depends on source; first subscriber starts shared execution | no replay memory by default |
| `shareReplay` | `shareExecution(..., memory)` | source execution shared by subscribers | replay buffer + shared connection | buffered values may emit immediately to late subscribers | older values are retained up to replay buffer size |

---

# One-line runtime reads

- `withLatestFrom` → source fires, read current context
- `sample` → clock fires, read current source value
- `pairwise` → new value arrives, pair it with previous
- `distinctUntilChanged` → new value arrives, compare with last emitted
- `combineLatest` → any dependency changes, recompute from all latest
- `filter` → value arrives, ask if it may pass
- `skipUntil` → ignore values until lifecycle opens
- `takeUntil` → pass values until lifecycle closes
- `debounceTime` → wait for silence before emitting latest
- `throttleTime` → emit, then ignore for a while
- `auditTime` → wait through the window, then emit latest
- `delay` → emit the same value later
- `scan` → update remembered state with this event
- `mergeMap` → start work, allow overlap
- `switchMap` → start work, keep only latest
- `concatMap` → start work, queue the rest
- `exhaustMap` → start work, ignore while busy
- `merge` → forward from any source
- `concat` → run sources one after another
- `zip` → match values by position
- `share` → share one execution
- `shareReplay` → share one execution and remember some past values

---

# Irreducible core vs derived machines

## Irreducible core

These are the smallest machines I would keep as **fundamental**.

### 1. `sampleOn(trigger, memory)`

**Canonical meaning:**
When a trigger happens, read current remembered value.

This covers:
- `when(...)`
- `sample` after swapping roles
- previous/current comparisons after adding suitable memory

**Why it is fundamental:**
- it captures asymmetric causality
- one thing drives time, another provides context

---

### 2. `recomputeLatest(inputs...)`

**Canonical meaning:**
Whenever any dependency changes, recompute from the latest of all.

This covers:
- `wheneverAny(...)`
- `combineLatest`
- many view-model derivations

**Why it is fundamental:**
- it captures symmetric dependency recomputation
- no single source is privileged as the trigger

---

### 3. `reduceState(events, reducer, seed)`

**Canonical meaning:**
Each event updates remembered state; the new state becomes current state.

This covers:
- `evolve(...)`
- `accumulate(...)`
- `scan`

**Why it is fundamental:**
- state evolution is more than simple sampling
- it introduces feedback memory as a first-class machine

---

### 4. `flattenWithPolicy(project, policy)`

**Canonical meaning:**
Each event starts inner work; policy decides overlap behavior.

This covers:
- `mergeMap`
- `switchMap`
- `concatMap`
- `exhaustMap`

**Why it is fundamental:**
- higher-order execution policy is its own runtime problem
- overlap policy cannot be reduced cleanly to simple sampling or recomputation

---

### 5. `composeTopology(sources, topology)`

**Canonical meaning:**
Multiple sources coexist; topology decides how they are arranged.

This covers:
- `merge`
- `concat`
- `zip`
- `race`
- `forkJoin`

**Why it is fundamental:**
- this is about structural coexistence of sources
- not about state read, recomputation, or inner overlap

---

### 6. `shareExecution(source, memory)`

**Canonical meaning:**
Subscription topology decides whether execution is fresh or shared, and whether past values are remembered.

This covers:
- `share`
- `shareReplay`
- subject-based shared behaviors

**Why it is fundamental:**
- unicast vs multicast changes the runtime graph itself
- replay memory changes what late subscribers see

---

## Derived rather than fundamental

These are important, but I would treat them as **derived views** over the core machines.

### `gate(...)`
Derived from:
- `sampleOn(...)` + boolean memory
- or direct predicate filtering

Why derived:
- it is usually a sampling/read decision expressed as pass/block

### `shapeTime(...)`
Derived from:
- timer/notifier sources
- internal pending memory
- sometimes `sampleOn(...)`
- sometimes topology over timer windows

Why derived:
- it is a family of timing policies rather than one single core machine

### `when(...)`
Derived from:
- `sampleOn(source, behavior)`

Why derived:
- it is the source-driven specialization of the more general sampling machine

### `wheneverAny(...)`
Derived from:
- `recomputeLatest(inputs...)`

Why derived:
- just a more readable name for the symmetric latest recomputation machine

### `evolve(...)`
Derived from:
- `reduceState(...)`

Why derived:
- same machine, friendlier wording

---

# Minimal irreducible basis

If you want the **smallest serious basis**, I would keep these 6:

1. `sampleOn(trigger, memory)`
2. `recomputeLatest(inputs...)`
3. `reduceState(events, reducer, seed)`
4. `flattenWithPolicy(project, policy)`
5. `composeTopology(sources, topology)`
6. `shareExecution(source, memory)`

Everything else becomes a specialization, naming layer, or convenience view.

---

# Mapping the behavioral axes onto the machines

## Axis: Trigger / driver of time

Question:
- what causes output work to happen?

Best mapped machines:
- `sampleOn(...)` → one privileged trigger
- `recomputeLatest(...)` → any input can trigger
- `flattenWithPolicy(...)` → source starts inner work, then inners continue timing
- `composeTopology(...)` → depends on topology

This is the **first axis** to classify with.

---

## Axis: Memory / retained context

Question:
- what value or runtime state is remembered between emissions?

Best mapped machines:
- `sampleOn(...)` → latest remembered context
- `recomputeLatest(...)` → latest of all dependencies
- `reduceState(...)` → current accumulated state
- `flattenWithPolicy(...)` → active inner, queue, or busy flag
- `shareExecution(...)` → replay buffer / shared execution state

This is the **second axis** to classify with.

---

## Axis: Cardinality / output relation

Question:
- how many output values can one input value cause?

Best mapped machines:
- `sampleOn(...)` → usually 0 or 1 per trigger
- `recomputeLatest(...)` → 0 or 1 per input change after initialization
- `reduceState(...)` → usually 1 state per event
- `flattenWithPolicy(...)` → 0 to many per outer event
- `composeTopology(...)` → varies widely by topology

This axis strongly separates plain machines from higher-order flattening.

---

## Axis: Lossiness

Question:
- can values be dropped, replaced, or ignored?

Best mapped machines:
- `sampleOn(...)` → latest memory can overwrite earlier unseen memory states
- `gate(...)` derived from sampling can drop values
- `shapeTime(...)` derived family often replaces or drops pending values
- `flattenWithPolicy(...)` → `switch` replaces, `exhaust` drops, `concat` queues, `merge` preserves overlap

This axis is often a **policy axis**, not a machine axis.

---

## Axis: Ordering / topology

Question:
- are values interleaved, serialized, aligned by position, or raced?

Best mapped machines:
- `composeTopology(...)` → primary home of this axis
- `flattenWithPolicy(..., 'concat')` also serializes inner work

This is mostly a **topology axis**.

---

## Axis: Statefulness

Question:
- does the operator need memory to do its job?

Best mapped machines:
- all core machines except some simple topology cases can be stateful
- strongest forms are `sampleOn(...)`, `recomputeLatest(...)`, `reduceState(...)`, `shareExecution(...)`

This axis cuts across machines rather than defining one machine alone.

---

## Axis: Initial emission condition

Question:
- what must already have happened before the first output can occur?

Best mapped machines:
- `sampleOn(...)` → trigger + initialized memory
- `recomputeLatest(...)` → every input initialized
- `reduceState(...)` → seed or initial state source
- `flattenWithPolicy(...)` → outer must emit, then inner must emit
- `composeTopology(...)` → topology-specific

This is one of the most useful runtime axes.

---

## Axis: Completion behavior

Question:
- what completion event shuts down the machine?

Best mapped machines:
- `composeTopology(...)` and `flattenWithPolicy(...)` vary strongly here
- `shareExecution(...)` also matters because shared execution changes teardown timing

This is not a machine by itself, but a lifecycle attribute of every machine.

---

## Axis: Sharing / unicast vs multicast

Question:
- does each subscriber get a fresh execution?

Best mapped machine:
- `shareExecution(...)`

This is its own machine because it changes the runtime graph globally.

---

## Axis: Higher-order depth

Question:
- are values plain packages, or are they streams of streams?

Best mapped machine:
- `flattenWithPolicy(...)`

This is the defining axis for flattening families.

---

# Recommended axis order for practical classification

If I had to order the most useful axes for your machine model, I would use:

1. **Trigger** — who drives time?
2. **Memory** — what is remembered?
3. **Higher-order depth** — are we flattening inner work?
4. **Topology / ordering** — how do multiple sources coexist?
5. **Lossiness / replacement / queueing** — what happens under pressure?
6. **Initial emission condition** — what must happen before the first output?
7. **Sharing** — unicast or shared execution?
8. **Completion / teardown** — what shuts it down?

That gives you a compact but operational taxonomy.

---

# Final recommendation

For teaching:
- keep the friendly names: `when`, `wheneverAny`, `evolve`, `forEach`

For the formal model:
- use the irreducible core names: `sampleOn`, `recomputeLatest`, `reduceState`, `flattenWithPolicy`, `composeTopology`, `shareExecution`

That gives you two layers:
- a **teaching DSL**
- a **runtime semantics DSL**

---

# Guiding idea

The domain can change.
The stream machines stay the same.

