# RxJS Operator Family Mermaid Decision Tree

Below is a Mermaid decision tree version of the operator-family chooser.

The decision questions are shortened by removing phrases like:
- “Do you need to ...”
- “Do you want to ...”

That makes the tree read more like a fast routing guide.

---

## Mermaid Decision Tree

```mermaid
flowchart TD
    A[What to do?]

    A --> B[Create stream?    A --> C[CoCombine streams?> D[Reshape vaReshape values?select values?Filter/select values?er streams?]
 Flatten inner streams?te?]
    A -->Accumulate state?[Control time?Branch/group stream?dary values?]
Control time?ution?]
    A Add context/boundary values?]
    A --> M[Share execution? N[Recover retInspect/convert notifications?[DOM callback Control scheduler? B2[Fresh logiRecover/retry/timeout?B --> B3[PlainConvert boundary?s?]
    B --> B4[Generate values?]
    B --> B5[Create terminal error?]
    B --> B6[Choose source by condition?]

    B1 --> BX1[Creation / Adaptation\nWeb callback external source adapters]
    B2 --> BX2[Creation / Adaptation\nCreate on subscription]
    B3 --> BX3[Creation / Adaptation\nCreate from values / containers]
    B4 --> BX4[Creation / Adaptation\nGenerate values]
    B5 --> BX5[Creation / Adaptation\nCreate terminal error]
    B6 --> BX6[Creation / Adaptation\nConditional creation]

    C --> C1[Latest values from all?]
    C --> C2[One after another?]
    C --> C3[As values arrive?]
    C --> C4[First source wins?]
    C --> C5[Align by position?]
    C --> C6[Final values after all complete?]

    C1 --> CX1[Static Multi-Source Combination\ncombineLatest family]
    C2 --> CX2[Static Multi-Source Combination\nconcat family]
    C3 --> CX3[Static Multi-Source Combination\nmerge family]
    C4 --> CX4[Static Multi-Source Combination\nrace family]
    C5 --> CX5[Static Multi-Source Combination\nzip family]
    C6 --> CX6[Static Multi-Source Combination\nforkJoin family]

    D --> D1[One input becomes one output?]
    D --> D2[Collect values into arrays?]
    D --> D3[Cut into inner Observables?]

    D1 --> DX1[Projection / Shape Change\nValue projection]
    D2 --> DX2[Projection / Shape Change\nCollect values into arrays]
    D3 --> DX3[Projection / Shape Change\nCut stream into inner Observables]

    E --> E1[Match a predicate?]
    E --> E2[Remove duplicates globally?]
    E --> E3[Remove repeated neighbours?]
    E --> E4[Pick first last single or elementAt?]
    E --> E5[Suppress all next values?]
    E --> E6[Keep or drop by position or lifetime?]
    E --> E7[Search first match or index?]

    E1 --> EX1[Filtering / Selection\nFilter by predicate]
    E2 --> EX2[Filtering / Selection\nGlobal uniqueness]
    E3 --> EX3[Filtering / Selection\nNeighbor-based uniqueness]
    E4 --> EX4[Filtering / Selection\nSelect a particular value]
    E5 --> EX5[Filtering / Selection\nSuppress normal values]
    E6 --> EX6[Filtering / Selection\nFilter by position / lifetime]
    E7 --> EX7[Filtering / Selection\nSearch-like selection]

    F --> F1[Allow overlap?]
    F --> F2[Queue one after another?]
    F --> F3[Cancel previous keep latest?]
    F --> F4[Ignore new ones while busy?]

    F1 --> FX1[Flattening Policies\nAllow overlap]
    F2 --> FX2[Flattening Policies\nQueue]
    F3 --> FX3[Flattening Policies\nOnly latest]
    F4 --> FX4[Flattening Policies\nIgnore while busy]

    G --> G1[Evolving state on every value?]
    G --> G2[One final summary on completion?]
    G --> G3[State plus higher-order async policy?]

    G1 --> GX1[State / Accumulation / Reduction\nContinuous accumulation]
    G2 --> GX2[State / Accumulation / Reduction\nFinal reduction]
    G3 --> GX3[State / Accumulation / Reduction\nStateful higher-order reducers]

    H --> H1[Split true and false branches?]
    H --> H2[Group by key into inner streams?]
    H --> H3[Expand recursively?]

    H1 --> HX1[Grouping / Branching / Recursive Expansion\nSplit into two branches]
    H2 --> HX2[Grouping / Branching / Recursive Expansion\nGroup into keyed inner streams]
    H3 --> HX3[Grouping / Branching / Recursive Expansion\nRecursive expansion]

    I --> I1[Keep every value move later?]
    I --> I2[Drop or select by timing rules?]
    I --> I3[Annotate with time information?]

    I1 --> IX1[Time Control\nTime shifting non-lossy]
    I2 --> IX2[Time Control\nLossy time-based gating / rate control]
    I3 --> IX3[Time Control\nTime metadata / measurement]

    J --> J1[Read latest from another stream?]
    J --> J2[Add values at start or end?]

    J1 --> JX1[Combination by Context / Sequence Augmentation\nCombine with latest side input]
    J2 --> JX2[Combination by Context / Sequence Augmentation\nAdd values at the boundaries]

    K --> K1[Explicit multicasting or connectable style?]
    K --> K2[Automatic shared execution?]

    K1 --> KX1[Sharing / Multicasting\nmulticast publish family]
    K2 --> KX2[Sharing / Multicasting\nshare family]

    L --> L1[Peek without changing the stream?]
    L --> L2[Turn notifications into values and back?]

    L1 --> LX1[Inspection / Notification Conversion\nInspect values without changing them]
    L2 --> LX2[Inspection / Notification Conversion\nConvert between values and explicit notifications]

    M --> M1[Shift downstream notifications?]
    M --> M2[Shift subscription side effects?]

    M1 --> MX1[Scheduler Control\nShift downstream notifications]
    M2 --> MX2[Scheduler Control\nShift subscription side effects]

    N --> N1[Recover after error?]
    N --> N2[Retry after failure?]
    N --> N3[Fail on timing condition?]

    N1 --> NX1[Error / Recovery / Timeout\nRecover from error]
    N2 --> NX2[Error / Recovery / Timeout\nRetry policy]
    N3 --> NX3[Error / Recovery / Timeout\nFail on timing condition]

    O --> O1[Convert to another boundary abstraction?]
    O1 --> OX1[Interop / Boundary Conversion\nConvert out of Observable world]
```

---

## Ultra-Compact Mermaid Version

```mermaid
flowchart TD
    A[What to do?]
    A --> B[Create stream?]
    A --> C[Combine streams?]
    A --> D[Reshape values?]
    A --> E[Filter/select values?]
    A --> F[Flatten inner streaCreate stream?[Accumulate stCombine streams?/group stream?Reshape values??]
    A --> JFilter/select values?ues?]
    A --Flatten inner streams? A --> L[InspeAccumulate state? M[Control schBranch/group stream?-> O[Convert oControl time??]

 n]
    C Add context/boundary values?on]
    D --> Share execution?
    E --> EX[Inspect/convert notifications? FX[FlatteningControl scheduler?te / AccumulatRecover/retry/timeout?> HX[Grouping Convert boundary?n]
    I --> IX[Time Control]
    J --> JX[Combination by Context / Sequence Augmentation]
    K --> KX[Sharing / Multicasting]
    L --> LX[Inspection / Notification Conversion]
    M --> MX[Scheduler Control]
    N --> NX[Error / Recovery / Timeout]
    O --> OX[Interop / Boundary Conversion]
```

---

## Shortened Question Set

These are the shortened question labels used in the Mermaid tree:

- Create stream?
- Combine streams?
- Reshape values? not: `Do you want to keep some values and drop others?`
- better: `Filter/select values?`

Create stream?Combine streams?Reshape values?Filter/select values?Filter/select values?Flatten inner streams?Accumulate state?Branch/group stream?Control time?Add context/boundary values?Share execution?Inspect/convert notifications?Control scheduler?Recover/retry/timeout?Convert boundary?