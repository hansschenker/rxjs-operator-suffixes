---
title: RxJS map operator and function inputs
tags:
  - "Programming/RxJS"
createdAt: Fri Dec 19 2025 16:07:06 GMT+0100 (Central European Standard Time)
updatedAt: Fri Dec 19 2025 16:07:27 GMT+0100 (Central European Standard Time)
---




Detailed summary


## bufferByTime Overview and Parameters
- The [[bufferByTime]] function is an operator that buffers emissions based on time intervals with a configurable content strategy, allowing users to collect values emitted during specified time windows and emit them according to the chosen content strategy.
- The function takes two parameters: `duration`, which is the time window duration in milliseconds, and `content`, which specifies what to emit from each buffer, with options including `'values'`, `'count'`, `'first'`, and `'last'`, and defaults to `'values'` if not provided.
- The `bufferByTime` function returns an `OperatorFunction` that buffers values by time and emits them according to the content strategy, with each time window being independent and empty buffers not being emitted.
- The function uses the `bufferTime` operator from `rxjs/operators` to buffer the emissions, and then applies additional operators such as `map` and `filter` to transform the buffered values based on the chosen content strategy.

## bufferByTime Use Cases and Related Functions
- The function has several use cases, including collecting all clicks per second, counting events per time window, getting the first event of each minute, and capturing the final state per interval, with examples provided in the documentation to demonstrate its usage.
- The function is part of a larger library that includes other buffering functions, such as `bufferByCount` and `bufferBySignal`, and is also related to the `throttle` operator, which can be used for rate limiting without buffering.
- The function has some important remarks, including that each subscription has independent buffers, memory usage is O(n) where n is the number of values per window, and empty buffers are not emitted, with the function being available since version 1.0.0.

## bufferByCount Function Details
- The `bufferByCount` function is an operator that buffers values by count and emits according to a specified content strategy, allowing for overlapping or skipping windows with the `startEvery` parameter, which can be set to null for consecutive buffers, less than the size for overlapping buffers, or greater than the size for skipping buffers.
- The `bufferByCount` function takes three parameters: `size`, which is the number of values to collect before emitting, `startEvery`, which determines how often to start new buffers, and `content`, which specifies what to emit from the buffer, such as the array of collected values, the count of values, the first value, or the last value.
- The function returns an operator that buffers values by count and emits according to the specified content strategy, and it includes examples of how to use the function for batch processing, overlapping windows, skipping windows, and getting every nth value.

## bufferBySignal Function Details
- The `bufferBySignal` function is another operator that buffers emissions until an Observable emits, with a configurable content strategy, and it takes two parameters: `closingNotifier`, which is the Observable that triggers buffer emission when it emits any value, and `content`, which specifies what to emit from the buffer.
- The `bufferBySignal` function returns an operator that buffers until a signal and emits according to the content strategy, and it includes examples of how to use the function for buffering clicks until a button is pressed and counting events between user actions.

## Common Content Strategies and Cross-Function Links
- Both functions have a content strategy that can be set to `'values'`, `'count'`, `'first'`, or `'last'`, and they use the `pipe` and `map` functions to transform the buffered values according to the specified content strategy.
- The functions also have links to other related functions, such as [[bufferByTime]] and `take`, and they include remarks about memory usage and the behavior of the last buffer when the source completes.

## bufferByToggle Function Details and Examples
- The `bufferByToggle` function is an operator that buffers the emissions of an Observable between toggle signals and emits the buffered values according to a specified content strategy, which can be set to `'values'`, `'count'`, `'first'`, or `'last'` using the `BufferContent` parameter.
- The function takes three parameters: `openings`, which is an Observable that signals when to open a new buffer; `closingSelector`, a function that returns an Observable that signals when to close the buffer; and `content`, which specifies what to emit from the buffer, with `'values'` being the default.
- The `bufferByToggle` function returns an `OperatorFunction` that can be used to buffer emissions of an Observable, and it provides several examples of how to use this function, including buffering mouse movements while dragging, counting events during an active state, and capturing input buffers during game animation.
- The function also provides links to similar operators, such as `bufferBySignal` and `window`, and notes that multiple buffer windows can be active simultaneously, with each opening emission creating a new independent buffer that closes individually based on its closing selector.

## bufferByToggle Library Information and Enum
- The `bufferByToggle` function is part of the `@yourname/rxjs-strategies` library and has been available since version 1.0.0, with the `BufferContent` enum providing a way to specify the content strategy, including `BufferContent.Values`, `BufferContent.Count`, `BufferContent.First`, and `BufferContent.Last`.




## Sources
- [website](https://claude.ai/share/7ab7f755-3680-4cd4-83f1-e14fdf7780c6)
