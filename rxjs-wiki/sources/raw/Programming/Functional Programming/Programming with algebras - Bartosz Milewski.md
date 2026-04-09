---
title: Programming with algebras - Bartosz Milewski
tags:
  - "Programming/Functional Programming"
createdAt: Tue Mar 24 2026 05:21:57 GMT+0100 (Central European Standard Time)
updatedAt: Tue Mar 24 2026 05:22:08 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction [(00:00:28)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=28s)
- The introduction to the topic of programming with algebras begins with a mention of algebra lessons, which may evoke memories of high school algebra, but the focus is on a different, more abstract kind of algebra [(00:00:28)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=28s).
- This abstract algebra is distinct from the more practical aspects of algebra, such as solving equations with many variables and doing coordinate transformations, which are typically covered in high school algebra or beyond [(00:01:13)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=73s).
- The abstract algebra to be discussed is a more theoretical and abstract concept, which is preferred by some due to the challenges posed by the more practical applications of algebra [(00:00:59)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=59s).

## Algebraic Data Types [(00:01:30)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=90s)
- Algebraic data types are useful in programming, particularly in functional programming, where all data types can be classified using algebraic data types, allowing for abstraction and generalization of data types [(00:01:30)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=90s).
- In functional programming, algebraic data types provide a general classification of data types, enabling developers to work with any data type, such as serializing any data type, which is not possible in imperative languages like [[C++]] or Java [(00:02:01)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=121s).
- Recursive data types, like lists and trees, are used in every language, but functional languages approach these data types in a more abstract and general way, unlike imperative languages which use a low-level engineering approach with pointers and operators [(00:02:50)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=170s).
- The approach to algebraic data types in functional languages allows for a more general and abstract way of doing computations on these data types, which will be the focus of further discussion [(00:03:28)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=208s).
- Imperative languages, such as C++ or Java, do not have a general classification of data types, making it difficult to abstract over data types and perform operations like serialization on any data type [(00:02:15)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=135s).

## What is an Algebra [(00:03:46)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=226s)
- An algebra consists of two major parts: the ability to form expressions and the ability to evaluate these expressions, with expressions being formed using operators, numbers, and symbols, such as in the example "x squared plus 2xy plus y squared" [(00:04:25)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=265s).
- The formation of expressions and their evaluation appear in various mathematical examples, including classical algebra, high school algebra, vector operations, and inner and outer products, all of which fit into a schema where expressions and evaluation are key components [(00:05:57)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=357s).
- To construct expressions, a grammar is needed, and this grammar can be represented using a data type, such as in [[Haskell]], where a recursive data type "expression" can be defined with constructors for constants, addition, and multiplication [(00:07:12)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=432s).
- The data type "expression" is recursive, allowing for infinitely many possible expressions to be created, which is a necessary property of an algebra, as it enables the creation of new expressions [(00:08:18)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=498s).
- There is a connection between grammar and data types, with algebraic data types being constructed using similar building blocks as those used in forming expressions, and these algebraic data types can be used to represent expressions in a programming language [(00:09:14)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=554s).
- The essence of an expression can be explored by defining a grammar for building expressions and by examining the relationship between expressions, algebraic expressions, and data types, which is a key aspect of understanding what an algebra is [(00:06:21)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=381s).

## Product Types [(00:09:34)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=574s)
- Algebraic data types are constructed using basic building blocks and ways of combining these blocks, with product types being a type that contains both types used to form it, such as a product of an integer and a string, which will contain both an integer and a string [(00:09:40)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=580s).
- A product type is like a pair of two types, where giving an integer and a string results in a pair, and it can be extended to tuples with more components, which can become complex and require naming for clarity, making structures and records examples of product types [(00:10:25)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=625s).
- Product types are used everywhere in programming, and they can be combined to form more complex types, such as structures and records, which are used to organize data in a meaningful way [(00:11:01)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=661s).
- Sum types, on the other hand, are tagged unions that contain either one type or another, with a tag indicating which type is contained, such as the "Either" type in [[Haskell]], which takes two types and has constructors "Left" and "Right" to indicate the contained type [(00:11:49)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=709s).
- These types can be combined using combinators, which take types and combine them into higher-order types, resembling algebraic operations like multiplication and addition, and can be used to create complex data structures [(00:13:17)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=797s).
- Parametric types, also known as generic types, can be used to parameterize types, allowing for the creation of types that can work with any type, such as templates in [[C++]] or Java, and can be used to inject specific types into data structures [(00:13:42)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=822s).
- The unit type, a singleton type with only one value, is similar to "void" in C++ and can be represented as a const type that ignores one of its type parameters [(00:14:43)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=883s).

## Building Blocks [(00:15:09)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=909s)
- Algebraic data types are composed of building blocks, and the initial expression type is constructed using these elements, which include three components combined using the "or" operator, indicating a variant or sum type [(00:15:09)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=909s).
- The type has three possibilities: a constant that injects an integer into the data structure, ignoring the input type; a multiplication of two types; and an addition node that takes two children of the same type, which is an example of a product type [(00:15:17)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=917s).
- The product type is a combination of a type with itself, similar to a square, where both children of the addition node are of the same type, and this is where induction enters [(00:16:10)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=970s).
- The expression is recursive, but recursion can be defined algebraically and separated from the definition of the data type, allowing for the data type to be defined independently [(00:16:37)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=997s).
- Algebraic data types can be defined using basic building blocks, including sum types, which have multiple possibilities, and product types, which combine types, and recursion can be added to these definitions [(00:16:45)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1005s).

## NonRecursive and Recursive [(00:17:02)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1022s)
- The concept being discussed has two components: a non-recursive component and a recursive component, which can be separated, a useful distinction to make [(00:17:02)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1022s).
- The non-recursive part involves replacing the recursive call to an expression with an arbitrary type parameter, resulting in a non-recursive entity [(00:17:17)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1037s).
- This non-recursive entity, which depends on the type parameter, is referred to as the functor, emphasizing its relationship with the type parameter [(00:17:30)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1050s).

## Functor [(00:17:39)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1059s)
- A functor is a mapping of types, where a type 'a' is given and a type constructor 'f' for functor is defined, which is more primitive because it's not recursive, but instead polymorphic and generic in 'a' [(00:17:39)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1059s).
- The functor 'f' takes a parameter type 'a' that can be any type, and it can result in either a constant integer that does not depend on 'a' or a product of 'a' with itself, such as 'a' or 'Maybe a', creating a generic data type without recursion [(00:18:07)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1087s).
- The concept of a functor has two components: a mapping of types, where a new type is constructed from type 'a', and a mapping of functions, which allows taking any function that operates on 'a' and applying it to the contents of the functor [(00:19:05)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1145s).
- The operation of acting with a function on the contents of a functor is called 'fmap' in [[Haskell]], which takes a function from 'a' to 'b' and applies it to the 'a's inside the functor, allowing the function to operate on the contents of the functor [(00:20:14)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1214s).
- The functor is defined as a thing that has these two components, and it is called a type constructor because it constructs a new type from type 'a', resulting in a data structure that resembles a one-level tree with 'a' as its contents [(00:19:16)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1156s).

## String [(00:20:33)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1233s)
- The function f of b is produced with the type a substituted with type b, and this function can turn a's into b's, such as integers into strings, resulting in an expression where a is a string [(00:20:33)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1233s).
- There are three cases to consider for the data value: const, add, or mul, and if it's a const integer, no action is taken because it doesn't depend on type a [(00:21:09)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1269s).
- If the data value is an add or a mul, it contains values of type a that can be acted upon with the function f, allowing f to take a type a and turn it into type b [(00:21:26)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1286s).
- The function f can operate under the add and act on x and y, resulting in an add of two b's from two a's, which is the desired outcome of operating under the hood [(00:21:37)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1297s).
- The process involves recursion, which is considered after defining the three cases for the data value [(00:22:06)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1326s).

## Recursion [(00:22:10)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1330s)
- Recursion can be defined by applying a functor to itself, allowing for the creation of one-level trees, which are structures that can be considered as trees, although not in the classical sense [(00:22:10)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1330s).
- The functor takes a type parameter, denoted as 'a', which can be any type, including 'x' or 'f of a', enabling the substitution of 'f of a' as the type parameter to create a two-level tree with children that are one-level expressions [(00:22:47)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1367s).
- This process can be continued by substituting 'a' with 'f of a' to create three-level trees, resulting in some leaves and nodes with children, which can be further substituted with the type to create deeper trees [(00:23:07)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1387s).
- By repeating this substitution process infinitely many times, it is possible to create trees of arbitrary depth, with nodes and leaves forming a recursive structure [(00:23:32)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1412s).

## Trees of depth [(00:23:39)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1419s)
- Trees of depth are defined for various levels, including one, two, three, and so on, up to infinity, with the challenge of determining when infinity is reached [(00:23:39)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1419s).
- A tree is considered to have reached infinity if applying a function, referred to as "expert f", one more time does not result in any changes, similar to how adding one to infinity still yields infinity [(00:23:49)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1429s).
- The property of an infinitely deep tree remaining unchanged after being made a child of another one-level tree can be expressed in [[Haskell]] as a data type, specifically using the concept of a fixed point [(00:24:22)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1462s).
- This fixed point concept allows for the representation of the equation as a data type, providing a way to define and work with infinitely deep trees in a programming context [(00:24:32)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1472s).

## Fixed points [(00:24:36)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1476s)
- The concept of fixed points is introduced, where a function is applied to an argument multiple times, and a fixed point is found when the application of the function does not move the point, meaning that applying the function again does not change the result [(00:24:36)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1476s).
- The idea of fixed points is applied to functors, where an arbitrary functor can be applied multiple times to eventually reach infinity, and the fixed point data type is defined as the point where applying the functor once more does not change anything [(00:25:08)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1508s).
- The fixed point data type is expressed as a function on types, which takes a function on types as an argument, and this concept can be expressed in programming languages such as [[Haskell]], but can also be achieved in other languages like [[C++]] using template template parameters [(00:26:24)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1584s).
- The concept of fixed points is applied to a specific functor that takes a type and creates a one-level tree, and the fix is applied to this functor to find the fixed point of the function on types [(00:27:08)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1628s).
- The definition of fixed points in this context is equivalent to another definition, but the difference lies in the fact that this definition contains both the flat data structure and the infinite recursion, whereas the other definition can be split into two separate components [(00:27:47)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1667s).
- The concept of evaluation is introduced, and it is stated that since we are dealing with functional programs, we will start with the question of what evaluation is [(00:28:23)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1703s).

## Evaluation [(00:28:34)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1714s)
- Evaluation is the process of extracting a value from an expression, which can be done in multiple ways, depending on the procedure used to extract the value, and the same expression can be evaluated differently [(00:28:34)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1714s).
- There are various ways to evaluate an expression, such as using integers, where addition and multiplication are performed as usual integer operations, resulting in an integer value [(00:28:55)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1735s).
- Another way to evaluate an expression is by using strings, where integers are converted to characters, and then combined using string operations, such as concatenation for addition and generating all possible combinations of characters for multiplication [(00:29:21)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1761s).
- The expression can be defined in terms of a functor that takes an arbitrary type, allowing it to be evaluated with different types, such as integers, strings, complex numbers, vectors, or matrices, by setting the type parameter to the desired type [(00:30:36)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1836s).
- When evaluating an expression, two main steps are involved: fixing the type in the functor, also known as the carrier type, and providing a function that takes the functor and returns a value, which is the actual evaluation of the expression [(00:31:24)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1884s).
- The carrier type can be set to any type, such as int or string, and the evaluation function will be defined accordingly, allowing for flexible and convenient evaluation of expressions with different types [(00:31:42)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1902s).

## Algebra [(00:32:02)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1922s)
- An f-algebra is defined in an abstract way using a functor, a carrier type, and an evaluation function, which takes an expression of the carrier type and returns the carrier type, for instance, an expression of int evaluating to an int [(00:32:02)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1922s).
- The algebra itself is comprised of the functor, the carrier type, and the evaluation function, with the evaluation function containing the most information, and it can be defined for various carrier types such as int, string, or complex [(00:32:42)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=1962s).
- In [[Haskell]], an algebra can be defined as an abstract data type that depends on a functor f, which is a function on types, and a carrier type a, with the definition containing an evaluation function from f a to a [(00:33:21)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2001s).
- The evaluation function in the algebra definition only tells how to evaluate one-level trees, either by evaluating an expression whose children are already evaluated or by evaluating a leaf to an end, but it is possible to evaluate recursive expressions, or the whole tree [(00:33:46)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2026s).
- The evaluation function is the essence of the algebra, and it can be used to evaluate expressions of different types, such as expressions of int, string, or complex, to their respective carrier types [(00:33:55)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2035s).

## Example [(00:34:25)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2065s)
- The problem posed involves a given type A, a carrier type, and a function f from A to A, with the goal of evaluating an expression represented by fix f, which generates a data type that is no longer parameterized by any type, resulting in an infinite set of deeper and deeper trees [(00:34:25)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2065s).
- The expression to be evaluated is defined as fix f, where f is a functor that fixes and generates a data type, and in the example, this would be given by an algebra, specifically x per f of end to end, with the evaluation of one level being three [(00:34:32)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2072s).
- The full expression to be evaluated is defined as a fix of x bar f, and the question is how to evaluate this expression, given the carrier type and the function f [(00:35:21)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2121s).
- The expression fix f represents a whole tree, which is an infinite set of deeper and deeper trees, and the goal is to evaluate this expression using the given function f and carrier type [(00:34:41)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2081s).

## Fix [(00:35:37)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2137s)
- The process of evaluating a fixed point of a functor, referred to as a catamorphism, involves applying the functor to the children of a tree, which are also trees, and then evaluating these children recursively until the leaves are reached, at which point the evaluation can be completed [(00:35:37)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2137s).
- The `fix` constructor applies the functor `f` to the children, which are full-blown trees, but smaller than the whole tree, allowing for recursive evaluation [(00:35:47)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2147s).
- The `unfix` function is used to undo the `fix` constructor, essentially extracting the contents of the `fix` expression, which is then evaluated using a recursive function called `kata` [(00:36:22)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2182s).
- The `kata` function takes an algebra and a `fix` expression, and returns the evaluated value of type `a`, by recursively evaluating the children of the tree using `fmap` and the `kata` function itself [(00:37:44)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2264s).
- The evaluation process involves using `fmap` to get under the functor and evaluate the children, and then applying the algebra to the evaluated children to get the final result [(00:38:10)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2290s).
- The recursive evaluation process terminates when the leaves of the tree are reached, at which point the algebra can be applied to get the final result, and the process unwinds, returning the evaluated value of type `a` [(00:38:54)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2334s).

## Combine [(00:39:55)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2395s)
- The catamorphism is a combination of three things, which can be read from right to left, and it involves getting rid of the outer constructor, applying the functor to big expressions, evaluating children using the catamorphism, and applying the algebra to evaluate the top level where children have already been evaluated, resulting in a simple arithmetic operation [(00:39:55)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2395s).
- The algebra used has a carrier type of integer, and the eval function evaluates an arbitrary expression of type fix x per f, giving an integer, which is a complicated way of doing things, but it's very general and can be applied to any algebraic data type [(00:40:49)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2449s).
- Lists are also recursive data types that can be split into two parts, a non-recursive functor part and a fix part, where the list functor part takes two arguments, the element type and the tail type, which can be replaced with an arbitrary type, resulting in a functor [(00:41:48)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2508s).
- By applying the fix to the list functor, a regular list of arbitrary size is obtained, and since there's a split between the functor and the fixed point, an algebra can be defined on these lists, such as an algebra on lists of integers with a carrier type of integer [(00:43:07)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2587s).
- The algebra on lists of integers can be defined to evaluate the sum of a list of integers, where the algebra gives zero for the nil case and adds the element to the evaluation of the tail for the cons case, which is equivalent to a right fold of a list [(00:43:43)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2623s).
- The catamorphism can be applied to this algebra to get a way of evaluating the sum of a list of integers, which is exactly equivalent to what would normally be called folding a list, and this is split into two things because of the function that defines the value for nil and the value for cons [(00:44:37)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2677s).

## Formula [(00:45:35)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2735s)
- A very general formula for evaluating recursive data structures has been developed, which works for arbitrary recursive data structure data types defined as fixed points of functors in an algebra, allowing for the evaluation of a single level and the rest to follow [(00:45:35)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2735s).
- The catamorphism is used to evaluate recursive data structures, and it is a one-time process that can be tested, fixed, and finished, making it a reliable method for evaluation [(00:46:08)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2768s).
- Catamorphism is just one of many recursive schemes, including anamorphisms and hyaluromorphisms, which are all described in a paper by Eric Mayer and others, titled "Bananas, Lenses, and Barbed Wire" [(00:46:45)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2805s).
- In category theory, a morphism is defined as a function that can be applied to a functor, and there are no specific rules for defining a morphism other than having a functor and a type, and defining a function [(00:48:04)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2884s).
- There is a relationship between monads and algebras, as every monad defines an algebra, specifically a T-algebra or an Eilenberg-Moore algebra, which are special kinds of algebras with unique properties [(00:48:52)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2932s).
- Free monads are used for generating algebraic expressions in a free way, and they are part of the algebra without the evaluation, requiring an interpreter to define the algebra [(00:49:29)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=2969s).
- Left fold can be expressed as a catamorphism, and it is possible to express left fold as a right fold, providing a way to perform this operation [(00:50:07)](https://www.youtube.com/watch?v=-98fR9VmLbQ&t=3007s).




## Sources
- [website](https://www.youtube.com/watch?v=-98fR9VmLbQ)
