---
title: ChatGPT
tags:
  - "Programming"
createdAt: Thu Apr 02 2026 14:54:20 GMT+0200 (Central European Summer Time)
updatedAt: Thu Apr 02 2026 15:01:19 GMT+0200 (Central European Summer Time)
---




Detailed summary


## Implications of Assignment and State in Programming
- The professor discusses the implications of introducing assignment and state into a programming language, which leads to a breakdown of the substitution model of evaluation and requires a more complicated environment model.
- The introduction of assignment and state means that a variable is no longer just a placeholder for a value, but rather a location that holds a value that can change over time.
- This change requires programmers to think about time and the order of operations, as expressions can have side effects and produce different results depending on the context.
- The concept of pairs is also affected, as two pairs with the same components may or may not be the same object, depending on whether they are shared or not.
- The professor notes that this new way of thinking is technically harder, philosophically harder, and programming harder, as it requires considering issues like object identity, sharing, and sequencing.

## Challenges of Modular Systems and Object Identity
- The reason for introducing assignment and state is to build modular systems that can be broken down into natural chunks, such as a random number generator that can be separated from the rest of the program.
- The goal is to create systems that mirror the natural divisions of the real-world systems being modeled, such as a digital circuit with separate components that have their own state and identity.
- The professor mentions that Gerry previously introduced the idea of assignment and state, and that this concept has far-reaching implications for how programmers think about their code.
- The discussion highlights the challenges of working with objects and state in programming, including issues like aliasing and bad sequencing that can lead to bugs.

## Introduction to Stream Processing as an Alternative Approach
- The professor's lecture is part of a series, and this particular lecture is titled "Lecture 6A: Streams, Part 1", which can be found on YouTube at [https://www.youtube.com/watch?v=JkGKLILLy0I](https://www.youtube.com/watch?v=JkGKLILLy0I), and Learn more on Glasp: [https://glasp.co/reader?url=https://www.youtube.com/watch?v=JkGKLILLy0I](https://glasp.co/reader?url=https://www.youtube.com/watch?v=JkGKLILLy0I).
- The discussion revolves around the concept of building computer systems that mirror our view of reality, and how this approach can introduce technical complications, potentially due to a flawed understanding of reality, with the speaker suggesting that time might be an illusion and nothing ever changes.
- The speaker uses the example of an object, such as a piece of chalk, to illustrate how its existence can be viewed as a path in space-time, rather than a series of individual positions and velocities, and similarly, an electrical system can be seen as a whole, unchanging entity in space-time.
- The speaker draws an analogy with signal processing engineers, who think of signals as being splayed out over time, and notes that this perspective can be applied to decomposing systems, introducing the concept of [[Stream (computing) | stream]] processing as an alternative approach.
- Stream processing is presented as a way to make programs more uniform and to reduce the focus on time, with the speaker using two procedures as examples: one for summing the squares of odd numbers in a binary tree, and another for collecting function values that satisfy a certain property, such as computing Fibonacci numbers and assembling the odd ones into a list.
- The speaker highlights the difference between the traditional, recursive approach to programming and the stream processing approach, which views systems as a whole, rather than as individual components communicating with each other at specific instants.
- The concept of stream processing is introduced as a way to simplify programming and to reveal commonalities between different systems, by abandoning the traditional focus on time and instead embracing a more holistic view of systems as unchanging entities in space-time.

## Procedural Examples and Signal Processing Analogies
- The text discusses two procedures that appear different but are essentially doing the same thing, which is finding the odd Fibonacci numbers among the first n numbers, with one [[procedure]] using recursion and the other using a standard loop.
- The speaker describes the procedures in terms of signal processing, where the first procedure enumerates the leaves of a tree, filters them for oddness, puts them through a transducer, and accumulates the results, while the second procedure enumerates the numbers on an interval, computes the Fibonacci number, filters for oddness, and accumulates the results into a list.
- The speaker notes that the commonality between the two procedures is obscured when looking at the code, and that the enumerator and accumulator are not clearly defined in one place, but are instead mixed up in the recursive structure and loops.
- The speaker suggests that in order to control and understand these procedures, a new language is needed that can explicitly define and manipulate the natural pieces of the program, such as the enumerator and accumulator.

## Stream Data Structures and Basic Operations
- The key to this new language is the concept of streams, which are data structures that can be used to represent the signals flowing between the boxes in the signal processing diagram, and can be constructed and manipulated using selectors and constructors such as CONS-[[Stream (computing) | stream]], head, and tail.
- The speaker introduces the concept of streams as a data abstraction, with CONS-stream as the constructor and head and tail as the selectors, and notes that the axioms relating these components will be defined by George's contract.
- The concept of streams is introduced, where the head of a CONS-stream of x and y is x, and the tail of the CONS-stream of x and y is y, which are similar to the axioms for CONS, CAR, and CDR in pairs and lists.
- The terminology of streams is used instead of lists to introduce an extra abstraction layer, which will be explained later, and for now, streams can be considered as just a terminology for lists.
- The concept of the-empty-stream is introduced, which is similar to the-empty-list, and is used as a null test to check if a stream is empty.
- A map [[procedure]] is defined to take a stream and a procedure, and generate a new stream with the procedure applied to all the successive elements of the stream, which is similar to the map procedure used with lists.
- A filter procedure is defined to take a predicate and a [[Stream (computing) | stream]], and generate a new stream with all the elements of the original stream that satisfy the predicate.
- Other useful procedures such as accumulate, enumerate, and append are defined to manipulate streams, including adding up all the elements in a stream, enumerating the leaves of a tree, and appending two streams together.

## Stream Processing for Complex Operations
- These procedures are used to build a language for talking about streams, and can be used to express complex operations, such as summing the odd squares in a tree, by combining the procedures in a specific order, like enumerating the leaves of the tree, filtering for oddness, mapping for squareness, and accumulating the result using addition.
- The language of streams can also be used to express other complex operations, such as generating the odd Fibonacci numbers, by combining the procedures in a specific order.
- The discussion revolves around the concept of [[Stream (computing) | stream]] processing, where computations are organized using streams, and the advantage of this approach is that it allows for the establishment of conventional interfaces that enable the mixing and matching of different components, such as map, filter, and accumulate, to create new programs.
- The use of map, filter, and accumulate as standard components enables the creation of programs in a modular and flexible way, allowing for the combination of different functions to achieve specific goals, and this approach is very general, as evidenced by Richard Waters' analysis of the IBM scientific subroutine library, which found that about 60% of the programs could be expressed using just these components.
- The professor emphasizes that the essence of this approach is the use of conventional interfaces, which enables the combination of different components, and the stream is a uniform data structure that supports this, similar to the concept of arrays and vectors in APL, a programming language that also relies on conventional interfaces to combine different components.

## Advanced Stream Processing Examples
- The professor then proceeds to demonstrate more complex examples of stream processing, including the definition of a utility [[procedure]] called flatten, which collects elements from a stream of streams and combines them into a single stream, and another procedure called flat-map, which applies a function to each element of a stream and combines the resulting streams into a single stream.
- The flat-map procedure is defined as the flatten of the map of a function f down a [[Stream (computing) | stream]] s, where f is a function that produces a stream for each element in the stream, and the result is a stream that combines all the elements from the individual streams, demonstrating the flexibility and expressiveness of the stream processing approach.
- The problem presented involves finding all pairs of integers i and j, between 0 and i, with j less than i, up to a given integer n, such that i plus j is prime, and the goal is to generate a stream of all the triples like i, j, and i plus j for each n.
- To solve this problem, a procedure called prime-sum-pairs is developed, which uses a combination of map, filter, and flatmap operations to generate the desired stream of triples.
- The prime-sum-pairs procedure starts by generating all pairs of i and j, and then filters these pairs to only include those where the sum of i and j is prime, and finally maps the resulting pairs to the desired triples.
- The use of nested loops in the procedure is equivalent to compositions of flatmaps of flatmaps of maps, which can be cumbersome to write and read, so a syntactic sugar called collect is introduced to simplify the code.
- The collect operation is an abbreviation for a nest of flatmaps and filters, and it is used to rewrite the prime-sum-pairs [[procedure]] in a more concise and readable form.

## Efficiency and Comparison with Traditional Methods
- Another example of using collect is the eight queens problem, which involves finding a way to place eight queens on a chessboard such that no two queens are attacking each other, and this problem can be solved using a similar approach of generating and filtering pairs of positions.
- The eight queens problem is a classic example of a backtracking algorithm, and it can be solved using the collect operation to generate and filter possible solutions, and the solution involves placing queens in different positions on the board such that no two queens are in the same row, column, or diagonal.
- The problem of solving the eight queens problem on a chess board is being discussed, and the first step is to represent a board and positions, with a predicate called "safe" that checks if it is okay to put a queen in a particular spot given the current positions of other queens.
- The "safe" predicate takes a row and a column as input, and checks if there are any queens in the same row, column, or diagonal that would make it unsafe to place a queen in that position.
- A traditional way to organize the program to solve this problem is called backtracking, which involves trying all possible ways to put the first queen down in the first column, and then recursively trying to put the next queen down in the next column, backtracking when a dead end is reached.
- The backtracking approach can be complicated and confusing, as it is overly concerned with the order in which the queens are placed, and a simpler approach is to think of the problem recursively, where the goal is to extend a partial solution to the next column by trying all possible placements of a queen in each row and filtering out the ones that are not safe.
- The recursive strategy involves writing a sub-[[procedure]] called "fill-columns" that puts down queens up through column k, and the pattern of the recursion is to call "fill-columns" with the size of the board eventually, with the goal of finding all possible ways to put down queens in the first k columns of the chess board.
- The "fill-columns" sub-procedure is designed to solve the eight queens problem on a board of a specified size, and it uses the "safe" predicate to ensure that each placement of a queen is valid and does not attack any other queen.
- The solution to the problem being discussed involves using a recursive approach to find all possible ways to put down queens in a chess board, with the base case being when k is equal to 0, in which case the solution is an empty chess board.
- The recursive approach uses a collect function to find all ways to put down queens in the first k minus 1 columns, and then tries all possible rows to find a safe position to put a queen, using a function called adjoin to add a new row and column to the rest of the queens.
- The approach gives all solutions to the problem, resulting in a [[Stream (computing) | stream]] of all possible ways to solve it, and is considered simpler because it throws away the idea of a process happening in time with state and instead models the problem as a whole collection of solutions.
- The audience raises a question about the efficiency of this approach, comparing it to backtracking, which would search for the first solution it can find, whereas the recursive search would look for all solutions, and the professor acknowledges that this is a valid concern that will be addressed later.

## Implementation of Delay and Memoization
- The professor notes that the approach may seem elegant and simple, but it may not be efficient for large problems, and that traditional programming styles may have their weaknesses, but also have their strengths, such as being able to mix up enumerating, testing, and accumulating in a way that is not possible with the stream-based approach.
- The professor gives an example of a problem, finding the second prime between 10,000 and 1 million, to illustrate the potential inefficiency of the stream-based approach, which would involve enumerating all integers in the range, filtering them for primality, and then taking the second element, which would be impractical due to the large amount of data involved.
- The concept of [[Stream (computing) | stream]] programming is discussed, where it seems that the method of mixing up generation and testing makes it efficient, despite being conceptually ugly, and it is possible to write stream programs that are as efficient as traditional programming styles.
- The key to achieving this efficiency is that streams are not lists, but rather data structures that compute themselves incrementally, on-demand, allowing for computation to only occur when necessary.
- The image of a stream processing system is described, where a box contains integers, a filter is connected to it, and someone tugs on the filter to retrieve a result, with computation only occurring when the result is requested.
- Eric Grimson's stream machine is mentioned, which illustrates the concept of streams and processing elements, and how implementing streams as lists would require processing the entire list, whereas streams only process the necessary data.
- The difference between streams and lists is highlighted, with streams being connected gadgets that generate data on-demand, and only as much data as needed is generated and processed.
- The goal is to create a stream that is a data structure that computes itself incrementally, and this can be achieved by blurring the distinction between programs and data, using procedures as first-class objects, and utilizing existing mechanisms such as CONS-stream, head, and tail operations.
- The concept of streams is further explained, where a [[Stream (computing) | stream]] is both a data structure and a [[procedure]] that has the method of computing in it, allowing for efficient and on-demand computation.
- The concept of CONS-stream is explained, where CONS-stream of x and y is an abbreviation for a pair of x and a delay of y, with delay being a special function that takes an expression and produces a promise to compute that expression when asked.
- The head of a stream is the CAR, and the tail of a stream is the force of the CDR of the stream, where force calls in the promise and computes the expression.
- The delay function is a key component, as it allows for the creation of a promise to compute an expression without actually computing it, and force is used to call in that promise and compute the expression.
- An example is provided to illustrate how this works, where the goal is to compute the second prime between 10,000 and 1 million, and the process involves building a CONS-stream and using filter and force to compute the result.
- The substitution model is used to explain the process, as there are no side effects and state, and the filter code is used to test the head and recursively filter the tail.
- The process of filtering and forcing the promises is repeated until the desired result is obtained, with no more computation being done than necessary, and the magic of delay is explained as simply being an abbreviation for a lambda [[procedure]] with no arguments.
- The force function is used to take up a promise and compute the expression, and the example illustrates how the mechanism of delay and force allows for efficient computation of the desired result.
- The discussion revolves around the concept of delay in programming, which decouples the apparent order of events in programs from the actual order of events in the machine, allowing for more efficient computation.
- The use of delay enables [[Stream (computing) | stream]] procedures to run like traditional procedures, making them more efficient and perspicuous, and it is achieved by giving up the idea that procedures mirror a clear notion of time.
- The implementation of delay involves a technical detail called memoization, which is a hack that transforms a procedure into one that only has to do its computation once, caching the result for future calls.
- Memo-proc is a special function that takes a procedure of no arguments and returns a new procedure that will only have to do its computation once, remembering the result for subsequent calls, and it is used to implement delay.
- The memo-proc function uses two flags to track whether it has already been run and what the result was, allowing it to short circuit re-computation and improve efficiency.
- The use of memoization in delay enables streams to run with pretty much the same efficiency as traditional programs, and it is based on the idea that there is no clear dividing line between procedures and data.

## Substitution Model and Side Effects
- The concept of streams is built on the idea of writing data structures that are like procedures, allowing for the incorporation of control structures like iteration, and it is a key aspect of the discussion on delay and memoization.
- The overall goal of using delay and memoization is to make [[Stream (computing) | stream]] procedures more efficient and easier to work with, while also highlighting the flexibility and power of programming languages in blurring the line between procedures and data.
- The discussion between the professor and the audience revolves around the concept of tail-tail-tail and the execution of procedures, with the professor explaining that memo-proc helps to avoid re-computation by storing the results of previous computations.
- The audience raises a question about the use of the substitution model when there are side effects, and the professor responds that side effects can mess up the substitution model unless careful consideration is taken.
- The professor explains that memo-proc translates a [[procedure]] of no arguments into another procedure of no arguments, which is executed when called, and that the lambda expression is returned when memo-proc is called, but not evaluated until the first time it is needed.
- The audience seeks clarification on when the lambda expression is executed, and the professor clarifies that it is executed when the result of memo-proc is called, which would be the time when the original procedure would have been called.
- The professor emphasizes that when memo-proc is called, it returns the lambda expression without evaluating it, and that the evaluation only occurs when the result of memo-proc is actually needed.
- The audience asks about the process of building a list, and the professor explains that the elements of the list do not get evaluated, but rather, a promise to generate the list is created, which is a procedure that can be executed to produce the list.
- The professor uses the example of creating a [[Stream (computing) | stream]] of numbers from 1 to 1 billion to illustrate that nothing gets built up until the stream is actually walked down, and that what is created is a promise to generate the list, not the list itself.
- The professor acknowledges that the explanation of memo-proc and the building of lists could have been clearer, and thanks the audience for pointing out the need for clarification.
- The discussion highlights the importance of understanding the substitution model and its limitations when dealing with side effects and mutable state in programming.

## Streams as a Programming Abstraction
- The professor's explanation of memo-proc and the creation of streams helps to clarify the key concepts and ideas in the lecture, and provides a deeper understanding of how programming works with mutable state and side effects.
- The lecture discusses the concept of streams as a programming abstraction, which allows for the packaging of natural parts of a system, enabling modularity and mirroring the structure of the real system being modeled.
- The professor challenges the traditional time-and-state view, instead suggesting that systems can be thought of as a whole behavior spread out over time, leading to the concept of [[Stream (computing) | stream]] processing, where systems are modeled as transformations of whole signals or streams.
- Stream processing involves breaking down programs into reusable components, such as enumerators, filters, and transformers, which can be composed together to solve complex problems, as demonstrated by the examples of summing the squares of odd leaves in a tree and collecting odd Fibonacci numbers up to n.
- The lecture introduces streams as a uniform abstraction with constructors, selectors, and common operations, such as cons-stream, head, tail, map, filter, accumulate, and stream enumerators, which provide a clean and reusable vocabulary for assembling programs from standard parts.
- The stream language is shown to scale to harder problems, such as expressing prime-sum pairs and the eight queens problem in a declarative way, and its efficiency is addressed through the use of delayed computation and memoization, allowing for elegance and practical efficiency.
- The essential characteristics of a stream, as presented in the lecture, include being a uniform sequence interface, supporting composition through conventional interfaces, and representing a signal-like flow of values, which enables the expression of programs as a sequence of reusable components, such as enumerate, filter, transform, and accumulate.

## Stream Processing and Compositional Components
- The lecture discusses the concept of streams, comparing them to signals in engineering, and highlights that a [[Stream (computing) | stream]] separates program pieces that ordinary recursion tends to mix together, making the structure of a computation more explicit.
- A stream is characterized as exposing the structure of a computation more clearly than ad hoc recursion, and it is not just a list, but rather its tail is delayed, meaning the head is available now, but the tail is stored as a promise to compute the rest later.
- The key characteristic of a stream is that it computes its rest only when asked, making it lazy or on-demand, and it supports incremental computation, where nothing beyond demand is produced, allowing for efficient execution.
- A stream is both data and procedure-like, as it carries both values and the method for producing more values, enabling elegant descriptions without losing runtime efficiency, and it typically memoizes what it has already produced to avoid recomputing delayed tails.
- The lecture argues that streams let you keep the clean decomposition in the source program while still getting efficient incremental execution at runtime, and it changes how you think about time, focusing on whole collections of possibilities, transformations of flows, and declarative composition, rather than mutation, sequencing, and step-by-step state change.
- According to the lecture, a stream is a uniform sequence abstraction, built from head, tail, and empty, processed through map, filter, and accumulate, and is useful because it exposes enumeration, transformation, and accumulation as separate pieces, and is best understood as a signal-like flow rather than a prebuilt list.
- The lecture also highlights the importance of delay and force in implementing streams, where delay stores a promise to compute the rest later, and force means to compute the delayed computation, and memoization is used to remember and reuse computed [[Stream (computing) | stream]] tails, making streams an efficient and elegant way to model computation.
- The discussion highlights the similarities and differences between functional lists and streams, with both using a similar outer shape, including a head, tail, and empty value, but differing in behavior and execution model.

## Comparison of Streams with Lists and Observables
- The key similarities between lists and streams include their ability to decompose a sequence into head and tail, support recursive processing, and work well with map, filter, and accumulate-style structures, allowing for a uniform way to talk about a sequence of things.
- The crucial difference between lists and streams lies in what the tail means, with the tail of a functional list already existing and the structure already built, whereas the tail of a stream is a promise and the rest is not computed yet, with walking the stream triggering further computation only when needed.
- Streams can be thought of as a lazily unfolded list or a list-shaped interface for incremental computation, preserving the clean recursive algebra of lists but adding time separation, with the head available now and the tail available later if needed.
- The commonalities between lists and streams include their sequence shape, recursive structure, compositional processing, abstract data view, and functional clarity, with both representing a sequence by splitting it into "now" and "the rest" and supporting transformations like mapping, selecting, and reducing.
- The main difference between lists and streams is the evaluation policy, with lists having the tail already built and streams having the tail delayed, and this difference is highlighted by the fact that lists are sequences already available, while streams are sequences revealed on demand.
- The relationship between lists and streams can be summarized by saying that a [[Stream (computing) | stream]] is list-like at the interface level but lazy at the execution level, and this relationship is what makes streams feel so natural in a functional setting, with the option to compare lists, SICP streams, and RxJS observables in a three-part comparison.
- A stream is defined as a uniform sequence abstract data type with a standard interface, allowing generic sequence operations such as map, filter, and accumulate to be defined once and reused across many computations.
- The standard interface of a stream includes functions such as empty-stream, cons-stream, head, and tail, which provide a conventional interface that lets generic processing components plug together.
- The important idea behind streams is not just a sequence, but a sequence with a conventional interface that enables generic processing components to operate independently of the particular source of values.
- Streams have a uniform sequence interface with a head/tail structure, designed so generic sequence operators can work on it, while the rest of the sequence is produced on demand, with the tail being delayed.
- The processing components in streams are best understood as computation expressions over a sequence, such as map, filter, and accumulate, which describe how the flow of the stream is transformed.
- These computation expressions are generic, compositional, and declarative in structure, allowing them to be connected together into pipelines and expressed independently of the source of the sequence.
- The key components of streams include the [[Stream (computing) | stream]] itself, which provides the uniform sequence interface, the processing components, which are reusable computation expressions, and the delay/force mechanism, which controls the execution policy.
- The three-part split between the stream, processing components, and delay/force mechanism is the heart of the concept, allowing for a clean separation between the sequence-shaped data abstraction, the computation rule over that abstraction, and the execution policy.
- The concept of a compact formula is introduced, which consists of three components: Stream, Components, and Delay, representing what can be processed, how it is processed, and when it is processed, respectively.
- A comparison is made between List, Stream, and RxJS Observable in terms of data abstraction, computation expression, and execution policy, highlighting their unique characteristics and differences.
- In terms of data abstraction, a List is a sequence that already exists, a Stream is a list-shaped sequence interface that reveals its structure incrementally, and an RxJS Observable is a description of a value flow over time that does not have a head/tail structure.
- Computation expressions for Lists include map, filter, and fold, which describe transformations over a pre-existing sequence, while Streams have similar operators but with a focus on delayed computation, and Observables have operators that rewire the flow of values over time.
- Execution policies differ among the three, with Lists being immediate, Streams being on-demand and delayed, and Observables being lazy until subscription and then pushed by the source, with the ability to cancel through unsubscribe.
- The key differences and similarities between Lists, Streams, and Observables are summarized, with the main distinction being the concept of a "sequence" and how it is presented and computed.

## Execution Policies and Abstraction Characteristics
- All three concepts allow for the avoidance of manual control flow and the use of reusable operators to describe computations, but they differ in their approach to sequence structure and execution.
- The main distinction between List, [[Stream (computing) | Stream]], and Observable lies in their underlying concepts, with List being a uniform sequence structure, Stream being a sequence structure with a delayed tail, and Observable being a lazy description of values flowing over time.
- The core idea of these three abstractions is that they allow for computation over many values without manual loop control, but they model different kinds of sequences, including values already present, values exposed incrementally, and values arriving over time.
- Each of these abstractions has its own characteristics, with List having a familiar shape of first element, rest of the list, and empty case, Stream having a head, tail, and empty case but with a delayed tail, and Observable being a lazy description of values flowing over time with possible emissions, completion, or error.
- Despite their differences, List, Stream, and Observable share a compositional style, supporting operations such as transformation, selection, and combination of values, and allowing for a reusable and composable programming approach.
- The key differences between List, Stream, and Observable lie in their structure, with List being about existing structure, Stream being about structure revealed on demand, and Observable being about values moving through time, and their execution policies, with List traversing existing structure, Stream computing the next part only when asked, and Observable executing only on subscription and pushing values when they happen.
- Typical operations for each abstraction include map, filter, and fold for List, map, filter, accumulate, flatten, and flatmap for Stream, and map, filter, scan, mergeMap, and share for Observable, which define computation and flow policy.
- The execution policy for each abstraction is distinct, with List having existing data, [[Stream (computing) | Stream]] having a delayed and often memoized tail, and Observable having a lazy description and execution starting only on subscription.
- Short formulas summarize each abstraction as List being a uniform sequence structure, Stream being a uniform sequence structure with a delayed tail, and Observable being a lazy description of a value flow over time.
- The best mental model for each abstraction is values arranged in structure for List, values arranged in a list-like structure but appearing later for Stream, and values moving over time for Observable.

## Summary of Stream, List, and Observable Differences
- Streams feel close to Lists because they borrow the clean recursive shape of Lists, with the big difference lying in the delayed tail of Streams.
- The main difference between various data structures lies in their tail policy, with List tail already being present, and [[Stream (computing) | Stream]] tail being a promise that awaits fulfillment.
- Observables represent a significant shift in data processing, as they focus on the timing of value occurrences, cancellation of old work, handling of inner work, execution modes, and the boundaries of side effects, thereby introducing time-based flow semantics.




## Sources
- [website](https://chatgpt.com/c/69ce292d-e5f4-8390-a92d-7f2fff3aceef)
