---
title: Rxjs Dataflow programming
tags:
  - "Programming/RxJS"
createdAt: Mon Sep 29 2025 06:56:39 GMT+0200 (Central European Summer Time)
updatedAt: Wed Dec 10 2025 13:04:18 GMT+0100 (Central European Standard Time)
---


Detailed summary


## Introduction to Dataflow Programming
- Dataflow programming is a programming paradigm that models a program as a directed graph of the data flowing between operations, implementing dataflow principles and architecture, and shares some features of functional languages, which were developed to bring functional concepts to languages suitable for numeric processing.
- The concept of dataflow programming was pioneered by [[Jack Dennis]] and his graduate students at MIT in the 1960s, and some authors use the term datastream instead of dataflow to avoid confusion with dataflow computing or dataflow architecture, based on an indeterministic machine paradigm.
- Traditionally, programs are modelled as a series of operations happening in a specific order, but dataflow programming emphasizes the movement of data and models programs as a series of connections, where explicit inputs and outputs connect operations that function like black boxes, and an operation runs as soon as all of its inputs become valid.
- Dataflow languages are inherently parallel and can work well in large, decentralized systems, and one of the key concepts in dataflow programming is the idea of state, which is essentially a snapshot of various conditions in the system, but dataflow programs do not require a considerable amount of state information, as the state is explicitly defined and shared across multiple processors.

## Representation and Implementation
- Dataflow programs are represented in different ways, including visually illustrated as a line or pipe, and can be implemented as a hash table, with uniquely identified inputs as the keys, used to look up pointers to the instructions, and the runtime environment is responsible for maintaining the state of the program.
- Some recent dataflow libraries, such as Differential and Timely Dataflow, have used incremental computing for more efficient data processing, and the history of dataflow programming includes the development of pioneer dataflow languages, such as BLOck DIagram (BLODI), published in 1961 by [[John Larry Kelly Jr. | John Larry Kelly]], Jr., Carol Lochbaum, and [[Victor A. Vyssotsky]], for specifying sampled data systems.

## Benefits and Applications
- The dataflow programming paradigm has several benefits, including the ability to work well in parallel processing machines, and the removal of the task of maintaining state from the programmer, which is given to the language's runtime, and this can be particularly useful in building data-intensive, non-OLTP applications, where explicit parallelism is one of the main reasons for the poor performance of some programming languages.
- The concept of dataflow programming involves compiling a specification of functional units and their interconnections into a single loop that updates the entire system for one clock tick, as seen in the BLODI specification.

## History and Development of Dataflow Languages
- In 1966, [[Bert Sutherland]] created one of the first graphical dataflow programming frameworks, as described in his Ph.D. thesis, The On-line Graphical Specification of Computer Procedures, to make parallel programming easier.
- Various dataflow languages have been developed, including POGOL, [[SISAL]], and SAC, which are designed to compile large-scale applications into efficient code and eliminate the creation of intermediate files.
- SISAL, a popular dataflow language developed at [[Lawrence Livermore National Laboratory]], has several offshoots, including SAC, Single Assignment C, which aims to remain close to the popular [[C (programming language) | C programming language]].
- Other dataflow languages and frameworks include [[Prograph]], which constructs programs as graphs onscreen and replaces variables with lines linking inputs to outputs, and SPGN, which is used on several platforms in the field today.

## Hardware Architectures and Distributed Systems
- Several hardware architectures have been designed to efficiently implement dataflow programming models, such as MIT's tagged token dataflow architecture, which was designed by [[Greg Papadopoulos]].
- Dataflow programming has been proposed as an abstraction for specifying the global behavior of distributed system components, and is used in various programming models, including the live distributed object model.

## Dataflow Programming Languages and Libraries
- There are numerous dataflow programming languages available, including [[Céu (programming language) | Céu]], ASCET, [[AviSynth]], [[Binary Modular Dataflow Machine | BMDFM]], CAL, [[Cuneiform (programming language) | Cuneiform]], and many others, which are used for a range of applications, such as video processing, robotics programming, and data analysis.
- In addition to languages, there are several libraries that support dataflow programming, including [[Apache Beam]], [[Apache Flink]], [[Apache Spark]], [[SystemC]], and [[TensorFlow]], which provide tools for streaming and batch processing, hardware design, and machine learning.

## Key Features of Dataflow Programming Languages
- Some of the key features of dataflow programming languages include the ability to easily identify inputs and outputs, the use of graphical notations, and the elimination of intermediate files, which can improve the efficiency and performance of parallel programming applications.




## Sources
- [wikipedia_page](https://en.wikipedia.org/wiki/Dataflow_programming)
