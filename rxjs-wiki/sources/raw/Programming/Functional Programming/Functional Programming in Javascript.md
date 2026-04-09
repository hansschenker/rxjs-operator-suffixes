---
title: Functional Programming in Javascript
tags:
  - "Programming/Functional Programming"
createdAt: Sat Jan 24 2026 09:51:24 GMT+0100 (Central European Standard Time)
updatedAt: Sat Jan 24 2026 09:51:45 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to the Course
- This interactive learning course is designed to teach Microsoft's [[ReactiveX | Reactive Extensions]] (Rx) Library for [[JavaScript | Javascript]], with a focus on functional programming to manipulate collections, and is titled "Functional Programming in Javascript" because the key to learning Rx is training yourself to use functional programming.
- The course promises that by learning five simple functions - map, filter, concatAll, reduce, and zip - developers can create shorter, more self-descriptive, and more durable code, and also simplify asynchronous programming, avoid race conditions, propagate and handle asynchronous errors, and sequence events and AJAX requests.
- The five functions are considered the most powerful, flexible, and useful functions to learn, and are used to abstract common collection operations into reusable, composable building blocks, with some being native to JavaScript and others included in the RxJS library.
- The course is a series of interactive exercises that can be completed in the browser, with the option to edit code and press "Run" to see if it works, and if it does, a new exercise will appear, while errors will be displayed if the code does not work.

## Course Structure and Format
- The course uses the Array as Javascript's only collection type, and adds the five functions to the [[Array (data type) | Array type]] to make it more powerful and useful, with the goal of reimplementing these functions as a learning exercise, even though Array already has the map, filter, and reduce functions.
- The course follows a pattern of solving problems using loops and statements, and then reimplementing the solutions using one of the five functions, with the goal of learning how to combine the functions to solve complex problems with very little code, as demonstrated in the first exercise, which involves printing all the names in an array.
- The course is available on GitHub, and users are encouraged to contribute to the course by forking and sending pull requests to add exercises, clarify problem descriptions, or fix bugs, with the state of the exercises being saved in local storage, and the option to transfer answers to another machine using the provided buttons.

## The forEach Function and Projection
- The section from the document 'Functional Programming in Javascript' discusses the use of the forEach function to traverse an array and perform operations on each item, such as printing names or projecting an array of videos into an array of id and title pairs.
- The forEach function is used to specify what operation should be performed on each item in the array, while hiding the details of how the array is traversed, as seen in the example where an array of names is printed to the console using forEach.
- The concept of projection is introduced, which involves applying a function to a value and creating a new value, and in the context of arrays, it means applying a projection function to each item in the array and collecting the results in a new array.
- An example of projection is given where an array of video objects is projected into an array of id and title pairs using the forEach function, and the resulting array is sorted by video id.
- The section also discusses how all array projections share two common operations: traversing the source array and adding each item's projected value to a new array, and how these operations can be abstracted away using a map function.

## The map Function and Array Transformation
- The map function is introduced as a way to make projections easier by applying a projection function to each item in the source array and returning the projected array, and an example is given of how to implement the map function.
- The implementation of the map function is demonstrated through an exercise where the map function is used to add 1 to each item in an array, and the result is compared to the expected output to verify its correctness.
- The importance of not changing the original array when using the map function is emphasized, as seen in the example where the input array remains unchanged after the map operation.
- The `map` function in [[JavaScript]] is used to create a new array with the results of applying a projection function to every value in the old array, allowing users to specify what projection they want to apply to an array while hiding the operation details.
- The `map` function is implemented using the `forEach` function, which iterates over each item in the array and applies the projection function to it, with the results being pushed into a new array called `results`.
- The `map` function can be used to project an array of objects into an array of objects with specific properties, such as projecting an array of videos into an array of `{id, title}` pairs, as demonstrated in the example with the `newReleases` array.
- In the example, the `map` function is used to create a new array of `{id, title}` pairs from the `newReleases` array, which is then sorted by video id using the `sortBy` function.
- The `map` function is a common operation in functional programming, similar to filtering an array, which involves applying a test to each item in the array and collecting the items that pass into a new array.
- The implementation of the `map` function includes error handling, such as checking if the result of the `map` function is as expected, and throwing an error if it is not, as seen in the example with the `JSON.stringify` function.
- The `map` function is a powerful tool in [[JavaScript]], allowing developers to transform and manipulate arrays in a concise and expressive way, and is an important part of the functional programming paradigm.

## The filter Function and Data Selection
- The exercise requires using the `forEach()` method to loop through the `newReleases` array and collect only those videos with a rating of 5.0, adding them to the `videos` array.
- The `forEach()` method is used to traverse the array, and objects that pass the test (i.e., have a rating of 5.0) are added to a new array, which is then returned.
- The `filter()` function is introduced as a way to abstract away the common operations of traversing an array and adding objects that pass a test to a new array, making filtering easier.
- The `filter()` function accepts a predicate, which is a function that accepts an item in the array and returns a boolean indicating whether the item should be retained in the new array.
- The `filter()` function is implemented on the `Array` type, and it creates a new array that includes only those items in the old array that pass the predicate function, without changing the original array.
- The implementation of `filter()` uses the `forEach()` method to traverse the array and add items that pass the predicate to a new array, which is then returned.
- The `filter()` function, like `map()`, allows users to express what data they want without requiring them to specify how to collect the data, making it a useful tool for functional programming in [[JavaScript]].

## Chaining map and filter for Data Queries
- The section of the document titled 'Functional Programming in Javascript' discusses how to query data by chaining method calls, specifically using the filter and map functions to collect the ids of videos with a rating of 5.0 from a list of new releases.
- The example provided uses an array of objects representing new movie releases, each with properties such as id, title, boxart, uri, rating, and bookmark, and demonstrates how to chain the filter and map functions to achieve the desired result, with the filter function used to select videos with a rating of 5.0 and the map function used to extract the ids of these videos.
- The code example shows how to use the filter function to create a new array containing only the videos with a rating of 5.0, and then uses the map function to create a new array containing only the ids of these videos, resulting in an array of ids that can be used for further processing or querying.
- The section also mentions that chaining together map and filter gives a lot of expressive power, allowing developers to express what data they want while leaving the underlying libraries flexibility in terms of how the queries are executed.
- Additionally, the section touches on the topic of querying trees, which can be challenging because they need to be flattened into arrays in order to apply filter and map operations, and introduces the concept of a concatAll function that can be combined with map and filter to query trees.

## The concatAll Function for Flattening Arrays
- The text discusses the concept of flattening a two-dimensional array, specifically the `movieLists` array, into a one-dimensional array of video ids using nested `forEach` loops and the `concatAll()` function.
- The `movieLists` array is a collection of movie lists, each containing a list of videos with their respective ids, titles, and ratings, and the goal is to extract the ids of all videos with a rating of 5.0.
- The `concatAll()` function is introduced as a method of the `Array` type, which iterates over each sub-array in the array and collects the results in a new, flat array, and is implemented using the `forEach` method and the `push.apply` method.
- The `concatAll()` function is demonstrated to be useful in flattening arrays of arrays, such as `[[1,2,3],[4,5,6],[7,8,9]]`, into a single array `[1,2,3,4,5,6,7,8,9]`.
- The text also mentions the use of `map()` and `filter()` functions to collect video ids with a specific rating, and how the `concatAll()` function can be combined with these functions to query a tree-like data structure.
- The implementation of the `concatAll()` function is provided, which uses a `forEach` loop to iterate over each sub-array and the `push.apply` method to add the elements of the sub-array to the result array.
- The `concatAll()` function is shown to be a simple yet powerful tool for flattening arrays of arrays, and its potential for use in combination with other functions like `map()` and `filter()` is highlighted.

## Exercises with map and concatAll
- The provided text is a section from a larger document titled 'Functional Programming in Javascript', which includes exercises to practice functional programming concepts, specifically using the `map()` and `concatAll()` functions.
- Exercise 11 requires the use of `map()` and `concatAll()` to project and flatten the `movieLists` into an array of video ids, with a hint to use two nested calls to `map()` and one call to `concatAll()`.
- The `movieLists` is an array of objects, each containing a `name` and a `videos` array, where each video object has properties such as `id`, `title`, `boxart`, `uri`, `rating`, and `bookmark`.
- The solution to Exercise 11 involves using `map()` to extract the video ids from each `movieList` and then using `concatAll()` to flatten the resulting array of arrays into a single array of video ids.
- Exercise 12 requires retrieving the `id`, `title`, and a 150x200 box art url for every video, with the added complexity of having a collection of boxart objects with different sizes and urls, and the restriction of not using indexers.
- The solution to Exercise 12 involves using `map()`, `concatAll()`, and `filter()` to select the desired properties for each video and filter the boxart objects to get the url with the desired dimensions.
- The exercises are designed to practice functional programming concepts and to prepare for more complex problems, with the restriction of not using indexers serving a purpose that will be explained later in the document.

## The concatMap Function for Nested Data
- The provided code snippet is part of a larger document titled 'Functional Programming in Javascript', which demonstrates the use of functional programming concepts such as map, filter, and concatAll to query trees.
- The code starts with a variable named movieLists, which is an array of objects containing information about movie lists, including the list name and an array of video objects, each with properties like id, title, boxarts, url, rating, and bookmark.
- The code then uses the map function to transform the movieLists array, and within this transformation, it uses another map function to transform the videos array, followed by a filter function to select boxarts with a width of 150 and a height of 200, and finally another map function to create a new object with the video id, title, and boxart url.
- The concatAll function is used to flatten the resulting array of arrays into a single array, and this process is repeated to handle the nested arrays.
- The code also mentions the implementation of a helper function called concatMap, which is designed to simplify the common pattern of chaining map and concatAll functions together, especially when dealing with trees that are several levels deep.
- The use of concatMap is intended to reduce repetition in the code and make it more concise and readable, as the combination of map and concatAll is a frequently occurring pattern in functional programming.
- The section from the document 'Functional Programming in Javascript' discusses the creation of a concatMap function, which combines a map operation with a concatAll function to flatten a two-dimensional array into a single, flat list.

## Implementing and Using concatMap
- The concatMap function is implemented as an extension of the Array prototype, allowing it to be used on any array, and it takes a projection function that returns an array as its argument.
- The implementation of concatMap involves first using the map function to apply the projection function to each item in the array, and then using the concatAll function to flatten the resulting two-dimensional array.
- An example is provided to demonstrate the use of concatMap, where an array of indices is used to retrieve corresponding sub-arrays from a separate array, resulting in a flat list of all the words for each number in every language.
- The example uses the spanishFrenchEnglishWords array, which contains sub-arrays of words for each number in Spanish, French, and English, and the concatMap function is used to collect all the words for each number in a single list.
- The section also mentions an exercise, Exercise 14, which involves using the concatMap function to retrieve the id, title, and 150x200 box art URL for every video, demonstrating a practical application of the concatMap function.
- The concatMap function is designed to simplify the process of flattening a two-dimensional array, making it easier to work with complex data structures in [[JavaScript | Javascript]].
- The provided code snippet is part of a larger document titled 'Functional Programming in Javascript', and it aims to simplify the code by replacing the map().concatAll() calls with concatMap(), which is a common pattern in functional programming.

## The reduce Function for Array Reduction
- The code defines a function that takes a string as input, evaluates it, and then sorts the resulting videos by their id, after which it compares the result with an expected output and displays an error message if they do not match.
- The expected output is a JSON string representing an array of video objects, each containing an id, title, and boxart, sorted by their id in ascending order.
- The code also defines another function that returns a list of movie lists, where each movie list contains a name and a list of videos, and each video has an id, title, boxarts, url, rating, and bookmark.
- This function uses the concatMap operation to flatten the nested arrays of videos and boxarts, and then applies a filter to select only the boxarts with a width of 150 and a height of 200, finally mapping the result to an object with the video's id, title, and boxart url.
- The text also discusses the concept of reducing arrays, where an operation needs to be performed on more than one item in the array at the same time, such as finding the largest integer in an array, which cannot be achieved using a filter operation alone.
- The example of finding the largest integer in an array illustrates the need to compare items in the array to each other, which can be done by selecting an item as the assumed largest number and then comparing it to every other item in the array.
- The process of reducing many values to a single value is known as reduction, where each step applies a closure to the last value and the current value, and uses the result as the last value the next time, ultimately leaving only one value.
- In the example provided, the `forEach` method is used to find the largest box art by updating a variable with the currently known maximum size and keeping track of the largest box art found so far.
- The `forEach` method is used to traverse an array of box arts, and at each step, it calculates the current size of the box art by multiplying its width and height, and updates the maximum size and largest box art if the current size is larger.
- The reduction process in the example is performed manually by specifying the method of traversal using `forEach`, but it would be more convenient to have a helper function that can perform reductions on arrays by specifying the operation to be performed on the last and current value.
- To achieve this, a `reduce()` function can be added to the [[Array (data type) | Array type]], similar to the `map()` function, which would allow for more flexible and efficient reduction operations.

## Advanced reduce Applications
- The `reduce()` function would enable the specification of the operation to be performed on the last and current value, making it easier to perform reductions on arrays without having to manually specify the traversal method.
- The example code provided demonstrates how to find the largest box art using `forEach`, but the implementation of the `reduce()` function is left as an exercise, allowing for further exploration and practice of the reduction concept.
- The provided text discusses the implementation of the `reduce` function in [[JavaScript]], which is different from the `reduce` function in ES5, as it returns a value instead of an array.
- The `reduce` function takes a combiner function and an initial value as arguments, and it applies the combiner function to each element in the array, accumulating a value that is returned as the result.
- The `Array.prototype.reduce` function is implemented to take a combiner function and an initial value, and it iterates over the array, applying the combiner function to each element and accumulating a value.
- The `reduce` function can be used to retrieve the largest rating in an array of ratings by using a combiner function that compares the accumulated value with the current value and returns the larger one.
- The `reduce` function can also be combined with other functions, such as `map`, to build more complex queries, such as retrieving the URL of the largest box art by reducing an array of box art objects to a single value.
- Exercise 17 demonstrates how to use the `reduce` function to retrieve the largest rating in an array of ratings, while Exercise 18 shows how to combine `reduce` with `map` to retrieve the URL of the largest box art.
- Exercise 19 discusses reducing with an initial value, which allows the reduced value to be a different type than the items stored in the array, providing more flexibility in the use of the `reduce` function.
- The `reduce` function is a powerful tool for processing arrays and can be used in a variety of situations, including data analysis and transformation, and its implementation and usage are crucial in functional programming in [[JavaScript]].

## The zip Function for Combining Arrays
- The section from the document 'Functional Programming in Javascript' discusses using the reduce() function to transform an array of videos into a single map where the key is the video id and the value is the video's title, with the initial value being an empty map.
- The reduce() function is used with an array of video objects, each containing an id and a title, and it returns a new map with the video id as the key and the video title as the value, using the Object.assign() method to assign the properties from one object to another.
- The code example provided demonstrates how to use the reduce() function to achieve this transformation, with the expected output being a map with the video id as the key and the video title as the value, such as {"65432445": "[[The Chamber (1996 film) | The Chamber]]", "675465": "[[Fracture (2007 film) | Fracture]]", "70111470": "[[Die Hard]]", "654356453": "[[Bad Boys (1995 film) | Bad Boys]]"}.
- The section also introduces a new exercise, Exercise 20, which involves using the reduce() function to retrieve the id, title, and smallest box art url for every video, and it provides an example of the expected output, which is an array of objects containing the id, title, and smallest box art url for each video.
- The reduce() function is used in combination with other functions, such as filter() and sortBy(), to build more complex queries and achieve the desired output, and the code examples provided demonstrate how to use these functions together to solve the exercises.
- The section also mentions the use of the eval() function to evaluate a string as a function, and the preVerifierHook() function, which is used to verify the input, and it provides examples of how to use these functions in the context of the exercises.
- The provided code snippet is part of a larger document titled 'Functional Programming in Javascript', which aims to demonstrate the use of functional programming concepts in [[JavaScript]], including the use of map, reduce, and concatMap functions to manipulate and transform data.
- The code defines a variable movieLists, which is an array of objects containing information about movie lists, including the list name and an array of video objects, each with properties such as id, title, boxarts, url, rating, and bookmark.
- The goal is to create a new array with a specific set of items, where each item contains the id, title, and boxart of a video, and the boxart is the one with the smallest area among all the available boxarts for that video.
- The code achieves this by using a combination of concatMap, reduce, and map functions, where it first concatenates the videos from all the movie lists, then reduces the boxarts for each video to find the one with the smallest area, and finally maps the resulting boxart to an object with the required properties.
- The code also includes a section on zipping arrays, which involves combining two arrays by progressively taking an item from each and combining the pair, similar to how a zipper works, and provides an exercise to combine videos and bookmarks by index using a for loop.
- The use of functional programming concepts, such as map, reduce, and concatMap, allows for a concise and expressive way to manipulate and transform data, making the code more readable and maintainable.

## Implementing and Testing zip
- The example provided demonstrates how to use these concepts to solve a real-world problem, such as extracting specific data from a complex data structure, and highlights the importance of understanding how to work with arrays and objects in [[JavaScript]].
- The section from the document 'Functional Programming in Javascript' discusses the implementation of a zip function, which is used to combine two arrays by applying a combiner function to corresponding elements from each array.
- The zip function is first implemented imperatively using a for loop to iterate over the arrays and combine the elements, and then it is added as a static method to the [[Array (data type) | Array type]], allowing it to be used in a more functional programming style.
- In Exercise 22, the zip function is implemented and tested by zipping two arrays, [1,2,3] and [4,5,6], using a combiner function that adds corresponding elements together, resulting in the array [5,7,9].
- The Array.zip function takes three parameters: the left and right arrays to be zipped, and a combiner function that is applied to corresponding elements from each array, and it returns a new array containing the combined elements.
- In Exercise 23, the zip function is used to combine an array of videos and an array of bookmarks, where each video is paired with a bookmark based on their index in the respective arrays, resulting in an array of objects containing the videoId and bookmarkId.
- The videos array contains objects with properties such as id, title, boxart, uri, and rating, while the bookmarks array contains objects with properties id and time, and the resulting array of videoId and bookmarkId pairs is sorted by videoId and compared to an expected result.

## Data Structure Conversion and Tree Queries
- The implementation of the zip function uses a for loop to iterate over the arrays, and the Math.min function is used to ensure that the loop only iterates up to the length of the shorter array, so that the function can handle arrays of different lengths.
- The provided code snippet is part of a larger document titled 'Functional Programming in Javascript', and it appears to be solving a problem related to combining videos and bookmarks.
- The code defines a function that takes a string as input, evaluates it, and then sorts the resulting pairs of video and bookmark IDs based on the video ID.
- The function also includes a test case that checks if the sorted pairs match an expected output, and if not, it displays an error message with the expected and actual outputs.
- Another function is defined to combine videos and bookmarks into pairs, where each pair contains a video ID and a bookmark ID, and this is achieved using the Array.zip method.
- The videos and bookmarks are defined as arrays of objects, with each video object containing properties such as id, title, boxart, uri, and rating, and each bookmark object containing properties such as id and time.
- The code also mentions an exercise, Exercise 24, which involves retrieving each video's id, title, middle interesting moment time, and smallest box art url, and this exercise is a variation of a previously solved problem.
- The exercise requires navigating through a tree-like structure, where both the boxarts and interestingMoments arrays are located at the same depth, to extract the required information.
- The provided code is a section from a larger document titled 'Functional Programming in Javascript', which aims to retrieve the time of the middle interesting moment and the smallest box art URL simultaneously using the `zip()` function.

## Introduction to Observables and Reactive Programming
- The code defines a function that takes a string as input, evaluates it, and then sorts the resulting videos by their IDs, after which it compares the result with an expected output and displays an error message if they do not match.
- The function uses a `movieLists` array, which contains objects representing movie lists, each with a `name` and a `videos` array, where each video object has properties such as `id`, `title`, `boxarts`, `url`, `rating`, and `interestingMoments`.
- The code utilizes the `concatMap` function to flatten the array of movie lists and videos, and then uses `Array.zip` to combine the smallest box art and the middle interesting moment for each video, returning an object with `id`, `title`, `time`, and `url` properties.
- The `reduce` function is used to find the smallest box art for each video by comparing the area of each box art, and the `filter` function is used to find the middle interesting moment by selecting the moment with the type "Middle".
- The code is designed to demonstrate the use of powerful queries using functional programming operators, such as `concatMap`, `zip`, `reduce`, and `filter`, to process complex data structures and extract relevant information.
- The section from the document 'Functional Programming in Javascript' discusses converting data from arrays to tree-like structures, which is a common requirement when dealing with different data organization systems, such as relational databases and JSON expressions.
- The problem presents two arrays, one containing lists and the other containing videos, where each video has a listId field indicating its parent list, and the goal is to build an array of list objects with a name and a videos array, where the videos array contains the video's id and title.
- The desired output structure is an array of list objects, each with a name and a videos array, where the videos array contains objects with id and title properties, and the properties must be added in a specific order to match the expected output.
- The solution uses the map and filter functions to join the two arrays by the listId key, where the map function is used to transform the lists array into the desired output structure, and the filter function is used to select the videos that belong to each list.
- The code uses the JSON.stringify function to convert the resulting array into a JSON string, which is then compared to the expected output to verify its correctness.
- The exercise demonstrates how to use the query functions, such as map and filter, to convert between different data representations, including arrays and tree-like structures, and how to handle more complex data structures with multiple arrays and nested relationships.

## Observables and Event Handling
- The next exercise, Exercise 26, builds on this concept by introducing a more complex example with four separate arrays, each containing lists, videos, boxarts, and bookmarks, and the goal is to create a deeper tree structure with multiple levels of nesting.
- The desired structure is a list of objects, where each object represents a category of videos, such as "New Releases" and "Thrillers", and contains a "name" property and a "videos" property.
- The "videos" property is a list of video objects, each of which has an "id", "title", "time", and "boxart" property, and these properties must be added in the same order as specified.
- The video objects are nested inside the category objects, allowing for a hierarchical structure where each category contains a list of related videos, as shown in the example with "New Releases" containing videos like "[[The Chamber (1996 film) | The Chamber]]" and "[[Fracture (2007 film) | Fracture]]", and "Thrillers" containing videos like "[[Die Hard]]" and "[[Bad Boys (1995 film) | Bad Boys]]".
- It is essential to maintain the specified order of properties when creating both the category objects and the video objects to ensure consistency and accuracy in the resulting structure.
- The example provided demonstrates the desired structure, with two category objects, "New Releases" and "Thrillers", each containing a list of video objects with the required properties, and serves as a model for building the desired structure.
- The provided code section is part of a larger document titled 'Functional Programming in Javascript', which demonstrates how to combine videos and bookmarks using functional programming principles.
- The code defines several arrays, including lists, videos, boxarts, and bookmarks, which are then used to create a new data structure that combines the relevant information from each array.
- The code uses various functional programming functions, such as map, filter, and reduce, to transform the data and create the desired output, which is a JSON string representing the combined video and bookmark data.
- The code is compared to a hypothetical loop-based implementation, which would be less self-describing and more difficult to read, highlighting the benefits of using functional programming principles for data querying and transformation.
- The example is followed by an exercise, Exercise 27: Stock Ticker, which involves working with a collection of NASDAQ stock prices over time, providing an opportunity to apply the functional programming concepts learned in the example to a new problem.
- The use of functional programming functions, such as concatMap and Array.zip, allows for a concise and expressive implementation that is easy to read and understand, making it a more desirable approach than using loops for data querying and transformation.
- The code includes error handling, such as the showLessonErrorMessage function, which is used to display an error message if the actual output does not match the expected output, helping to ensure that the code is working correctly.
- The problem presented involves filtering a collection of stock prices, specifically the pricesNASDAQ collection, to retrieve all MSFT share prices from the last ten days and printing each price record, including the timestamp, using the print() function.
- The pricesNASDAQ collection is an array-like object that stores stock price records, including the stock name, price, and timestamp, with sample data provided to illustrate its structure.
- A function is defined to filter the pricesNASDAQ collection for MSFT trades recorded after a specified date, ten days ago, and print each price record to the output console using the printRecord() function.
- The solution to the problem of how the array could contain stock price records from the future is that pricesNASDAQ is not a traditional array, but rather a new type that can react to changes and update over time, which is later revealed to be an Observable.

## take and takeUntil for Event Control
- The concept of Observables is introduced, which are a new collection type in [[JavaScript | Javascript]], similar to events, but with the ability to signal completion and send data asynchronously, as seen in Microsoft's open-source [[ReactiveX | Reactive Extensions]] library.
- Observables are explained to be a sequence of values that a data producer pushes to the consumer, and can be used to model various data sources, such as mouse events and asynchronous JSON requests, with the ability to query them using familiar query functions.
- The text also mentions the use of the Rx.Observable.interval() function to create an Observable sequence, and the seq function, which creates an Observable from an array of items with added delays, to visually describe the contents of sequences and the times between each item's arrival.
- Observables are a sequence of values delivered one after the other, and they can contain any object, including arrays, allowing for reactive programming and enabling the creation of data sets that react and update as the system changes over time.
- Unlike arrays, which provide a snapshot when queried, Observables can be used to create sequences that can go on sending data to a listener forever, such as a mouse move event, by adding a trailing comma to the end of the items passed to the seq() function.
- The seq() function is used to create Observables, and it can take an array of values as an argument, with each value being delivered one after the other, allowing for the creation of sequences with varying time intervals between each value.
- Subscribing to an event and traversing an array are fundamentally the same operation, with the only difference being that array traversal is synchronous and completes, while event traversal is asynchronous and never completes, but converting an event to an Observable object allows for the use of functions like do() to traverse the event.
- The forEach() function of an Observable object returns a Subscription object, which can be disposed of to unsubscribe from the event and prevent memory leaks, similar to calling removeEventListener(), and disposing of a Subscription object is equivalent to stopping halfway through a counting for loop.
- Converting events to Observables allows for the use of powerful functions to transform them, making it easier to handle events and avoid memory leaks, and one such function is the take() function, which can be used to listen for the next occurrence of an event and then immediately unsubscribe, making it easier to code event handling and prevent memory leaks.
- The take() function provides an easier way to code event handling, especially in instances where an event handler is expected to be called only once, such as the window.onload event, allowing developers to avoid cumbersome event handling code and prevent memory leaks.
- The `take()` function is used to create a new sequence that completes after a discrete number of items arrive, which is important because when an Observable sequence completes, it unsubscribes all of its listeners, eliminating the need to manually unsubscribe.
- The `take()` function can be used to listen for a specific number of events, such as a single button click, and then automatically unsubscribe, as demonstrated in the example where `buttonClicks.take(1).forEach()` is used to listen for one button click and then stop.
- The `takeUntil()` function is a more flexible alternative to `take()`, allowing you to complete a sequence when another event occurs, such as when a stop button is clicked, as shown in the example where `seq().takeUntil(seq())` is used to complete a sequence when a stop button is pressed.
- The `takeUntil()` function can be used to filter an Observable sequence, such as filtering NASDAQ prices for MSFT stock prices, and then completing the sequence when a stop button is clicked, as demonstrated in the example where `microsoftPrices.takeUntil(stopButtonClicks)` is used to complete the sequence when the stop button is clicked.
- The use of `take()` and `takeUntil()` functions reduces the risk of memory leaks and makes the code more readable, as they eliminate the need to manually unsubscribe from events.
- The key takeaways from this section include the ability to traverse Observables using `forEach()`, convert Events into Observables that never complete using `fromEvent()`, and apply `take()` and `takeUntil()` to an Observable to create a new sequence that completes.

## Observables for Complex Event Sequences
- The `Rx.Observable` library is used to create Observables, such as the `stocks` Observable, which is created using `Rx.Observable.interval()` and `map()` functions to generate random stock prices.
- The `forEach()` function is used to print the stock prices to the output, and the `takeUntil()` function is used to complete the sequence when the stop button is clicked, as demonstrated in the example where `microsoftPrices.forEach()` is used to print the stock prices and `takeUntil()` is used to complete the sequence.
- The tasks of creating a flat list of movies with a rating of 5.0 from multiple movie lists and creating a sequence of all mouse drag events from mouseDown, mouseMove, and mouseUp events are fundamentally the same, as both are queries that can be solved using the same functions.
- The main difference between traversing an Array and traversing an Observable is the direction in which the data moves, with Arrays being pulled by the client and Observables pushing data to the client.
- Querying data is orthogonal to the direction in which data moves, meaning that query methods make the same transformations regardless of whether data is pulled or pushed.
- The query methods, such as map, filter, concatAll, reduce, zip, take, and takeUntil, transform Observables and Arrays in similar ways, with the only difference being the input and output type.
- For example, filtering an Array results in a new Array, while filtering an Observable results in a new Observable, and the same applies to other query methods like map, which transforms the input data in the same way for both Arrays and Observables.
- The use of these query methods allows for a unified programming model for transforming any collection, making it easier to convert synchronous code to asynchronous code.
- Avoiding the use of array indexers, which can only be used on collections that support random-access like Arrays, is important, as it allows for a unified programming model that can be applied to any collection, including Observables.
- The section discusses creating complex events using Observables and query functions in [[JavaScript]], specifically focusing on creating a mouse drag event for a DOM object, such as a sprite, within a sprite container.
- The mouse drag event is created by combining mouse down, mouse move, and mouse up events, where the mouse move events are retrieved until a mouse up event occurs, using the `concatMap` and `takeUntil` functions from the Observable library.
- The `spriteMouseDowns`, `spriteContainerMouseMoves`, and `spriteContainerMouseUps` variables are defined as Observables from the corresponding mouse events on the sprite and sprite container, and are used to create the `spriteMouseDrags` event.
- The `spriteMouseDrags` event is then used to move the sprite to the absolute page position of the mouse drag event, using the `forEach` function to subscribe to the event and update the sprite's position.
- The exercise then moves on to improving the mouse drag event by offsetting its coordinates based on the location of the mouse down event on the sprite, to make the drag event more closely resemble moving a real object with a finger.
- The mouse events are sequences of objects containing x, y, layerX, and layerY properties, which represent the absolute and relative positions of the mouse event, and are used by the `moveSprite` function to position the sprite.
- The goal is to adjust the coordinates in the mouse drag event based on the mousedown location on the sprite, using the layerX and layerY properties to calculate the offset and create a more realistic drag experience.
- The provided text is a section from a larger document titled 'Functional Programming in Javascript', which discusses various concepts related to functional programming, including event handling and HTTP requests.

## Autocomplete Implementation with Observables
- The text begins with a function called `Sprite Sprite Container` that handles mouse events to move a sprite around on a container, utilizing the `eval` function to execute a string as [[JavaScript]] code and the `Observable.fromEvent` function to create sequences of mouse events.
- The function uses the `concatMap` and `takeUntil` methods to create a sequence of mouse drag events, which are then used to move the sprite to the absolute page position.
- The text then moves on to discuss HTTP requests, specifically using jQuery's `getJSON` API to asynchronously retrieve data, and how this can be achieved using a callback-based API.
- Exercise 34 is mentioned, which involves using jQuery's `getJSON` API to retrieve data, and Exercise 35 is discussed, which involves sequencing HTTP requests with callbacks to perform a series of operations in parallel.
- The example provided in Exercise 35 demonstrates how to download a URL prefix, retrieve a movie list array and configuration information, and make a follow-up call for an instant queue list if necessary, all while handling errors and displaying the movie list after the window loads.
- The text concludes by highlighting the challenges of sequencing HTTP requests with callbacks, including the need to introduce variables to track the status of each task and handle errors, making it a complicated process.
- The use of callback-based APIs is noted to be particularly problematic when it comes to asynchronous error handling, as it does not allow for the cancellation of a unit of work when an exception is thrown, unlike synchronous programs.
- The text discusses the limitations of asynchronous error handling in [[JavaScript | Javascript]], which lacks built-in support unlike synchronous error handling with try/catch/throw keywords, but Observables provide a more powerful way of working with asynchronous APIs.
- Observables can free developers from tracking the status of tasks run in parallel and provide the same error propagation semantics in asynchronous programs as in synchronous programs, allowing for more expressive programs to be built.
- The text explains that callback-based APIs can be converted to Observables, which can then be queried along with Events, and provides an example of converting the output from the $.getJSON() function into a sequence that completes after sending a single item.
- The Observable.create() function is introduced as a flexible way to build Observable sequences from any asynchronous API, which relies on the client being able to receive data, error information, and completion alerts, and being able to indicate disinterest in the result.
- The subscribe function passed into Observable.create() is a lazy evaluation that occurs for each Observer when it subscribes, and Observers must conform to the Observer interface to receive notifications from the Observable.
- The text highlights the importance of unsubscribing from an Observable when no longer interested in its data to clean up the execution, and notes that the return value of calling subscribe on an Observable is a Subscription, which represents a disposable resource that can be used to unsubscribe.
- The example provided demonstrates how to use the Observable.create() function to create an Observable that issues a request to getJSON when it's traversed, and explains the role of the subscribe function and the Observer interface in this process.
- The Observer in the context of Functional Programming in [[JavaScript | Javascript]] defines three methods: next(), used by Observables to deliver new data, error(), used by Observables to deliver error information, and complete(), used by Observables to indicate a data sequence has completed.
- Observers are not required to implement all the methods, and for callbacks that are not provided, Observable execution still proceeds normally, except some types of notifications will be ignored, and there are slight API differences between RxJS 4 and 5 that need to be considered.
- The getJSON function that returns an Observable sequence is used to improve the solution to Exercise 37, which involves sequencing HTTP requests with Observables, and the Observable.fromEvent() is utilized to complete the exercise.
- Exercise 37 demonstrates how to combine videos and bookmarks using the getJSON function and Observable.fromEvent(), and it shows how to use the getJSON function to retrieve data from a URL and send it to the client using the observer.next() method.
- Almost every workflow in a web application starts with an event, continues with an HTTP request, and results in a state change, and the text explains how to express the first two tasks elegantly using Observables.
- Exercise 38 focuses on throttling user input to prevent extraneous requests, and it uses the throttleTime() method to achieve this, for example, by only firing after the user has stopped interacting for a second.
- The throttleTime() method is used in conjunction with the concatMap() method to throttle input and save data, and this is demonstrated in the context of saving user input when a button is clicked.
- Exercise 39 introduces the problem of the autocomplete box, which requires throttling input and handling out-of-order requests, and it sets the stage for exploring solutions to this common problem in web development using Functional Programming in [[JavaScript | Javascript]].
- The section from the document 'Functional Programming in Javascript' discusses the implementation of an autocomplete feature using [[ReactiveX | Reactive Extensions]] (Rx) in JavaScript, where the goal is to retrieve search results based on user input in a textbox.
- The initial example demonstrates how to create an autocomplete feature that returns search results for a given input string, using the `getSearchResultSet` function to retrieve results and the `keyPresses` sequence to capture user input.
- The code uses Rx Observables to handle the keyup events, throttle the input to prevent excessive requests, and filter the results to display only the top 10 matches.
- However, the initial implementation has two issues: it fires requests for non-character keys and makes multiple successive searches for the same string.
- To address the first issue, the `distinctUntilChanged` operator is used to filter out successive repetitive values, ensuring that only distinct input is processed.
- The `isAlpha` function is used to filter out non-alphabetic characters, and the `scan` operator is used to accumulate the input string.
- The final example, Exercise 41: Autocomplete Box Part 2, aims to resolve the two bugs in the previous autocomplete implementation: multiple successive searches for the same string and attempts to retrieve results for an empty string.
- The solution involves using the `distinctUntilChanged` operator to prevent multiple searches for the same string and filtering out empty strings to prevent unnecessary requests.

## Conclusion and Further Exercises
- The `getSearchResultSets` function is used to retrieve search results based on the throttled and filtered input, and the results are displayed in the search results textbox.
- The code examples provided demonstrate how to use Rx Observables, operators, and functions, such as `map`, `filter`, `throttleTime`, `concatMap`, and `distinctUntilChanged`, to implement the autocomplete feature.
- The provided code snippet is an example of a fully functioning autocomplete scenario, where the `Name` function takes a string and a lesson as input, sorts a word list, and sets up an event listener for keyup events on an input field.
- The `searchText` function filters the word list based on the input text and returns an observable of the matched words, which is then used to update the search results in the user interface.
- The code uses the RxJS library to handle events and observables, including the `fromEvent` function to create an observable from the keyup events, and the `map`, `throttleTime`, `distinctUntilChanged`, and `concatMap` functions to process the events and filter the search results.
- The `getSearchResultSets` function is a higher-order function that takes the `getSearchResultSet`, `keyPresses`, and `textBox` as input, and returns an observable of the search results, which is then subscribed to and used to update the search results in the user interface.
- The code does not currently handle errors or failures, and the text suggests that this is an area for further exploration, with an exercise to retry after errors, and invites readers to contribute to the tutorial by sending suggestions for more exercises.
- The tutorial is a work in progress, and the author encourages readers to start using the functions they have learned in their day-to-day coding and to provide feedback and suggestions for additional exercises.
- The example code is designed to be used with the React library, as evidenced by the use of class names such as `inputName` and `searchResultsForAutoComplete`, and the text mentions the use of the `react` string as an example input.
- The code uses a variety of functional programming concepts, including higher-order functions, observables, and event handling, to create a dynamic and interactive user interface.




## Sources
- [website](https://reactivex.io/learnrx/)
