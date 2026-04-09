---
title: Maps are Folds in Functional Programming. Here’s how:
tags:
  - "Programming/Functional Programming"
createdAt: Wed Feb 18 2026 17:26:16 GMT+0100 (Central European Standard Time)
updatedAt: Wed Feb 18 2026 17:26:44 GMT+0100 (Central European Standard Time)
---




Detailed summary

- The author of the text, Anirudh Kaushal, discovered a deeper connection between the map and fold functions in functional programming, specifically in [[Haskell]], while working on a problem at the Yangon International Airport.
- The problem required filtering a list into a sublist based on a function that returns True or False, with a method signature of (a -> Bool) -> [a] -> [a], which is similar to the existing filter function in the Haskell standard library, Prelude.
- To build this function, the author considered using either a map or a fold, and initially thought that a map returns a list of the same length with each item transformed by a function, while a fold returns a single value after going through each element in a list.
- However, upon re-examining the method signature for foldl, which is foldl :: (b -> a -> b) -> b -> [a] -> b, the author realized that the aggregator, b, can be a list, allowing the fold function to build a list instead of a single value.
- The author demonstrated how to express the filter function in terms of fold, and also showed that a map can be defined using a fold by applying any function to each item before adding it to the list.
- The key takeaway from this discovery is that folds are flexible and can be used to implement various functions, including maps, and that the metaphors used to understand concepts can sometimes limit our understanding of their full potential.
- The author concluded that this experience taught them to be wary of the limitations of their own understanding and to appreciate the flexibility of folds in functional programming.




## Sources
- [website](https://medium.com/@anirudheka/maps-are-folds-in-functional-programming-heres-how-979b90eb657a)
