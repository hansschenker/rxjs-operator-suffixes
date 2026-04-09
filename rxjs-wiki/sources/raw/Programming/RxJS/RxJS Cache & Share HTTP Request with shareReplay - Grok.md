---
title: RxJS: Cache & Share HTTP Request with shareReplay - Grok
tags:
  - "Programming/RxJS"
createdAt: Thu Jan 29 2026 14:52:43 GMT+0100 (Central European Standard Time)
updatedAt: Thu Jan 29 2026 14:52:58 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to shareReplay and HTTP Request Caching
- The goal of using the [[shareReplay]] operator in RxJS is to cache and share an [[HTTP]] request, so that the request is only executed once and the cached value is shared with all subsequent subscribers, eliminating the need for additional network requests.
- To achieve this, the recommended implementation is to place the shared observable in a service, typically as a private cached property, using the `shareReplay` operator with a buffer size of 1 and refCount set to true, which is the default behavior in RxJS 7 and later versions.
- The `shareReplay` operator converts a cold HTTP observable into a hot observable with replay behavior, ensuring that only the first subscriber triggers the HTTP request, and the emitted value is stored and replayed immediately to every new subscriber.
- The lifetime of the cache can be controlled using the `refCount` parameter, where `refCount: true` cleans up the inner subscription when the last subscriber unsubscribes, and `refCount: false` keeps the cache alive even with 0 subscribers.

## Configuration Options and Use Cases
- Alternative compact syntaxes are available, such as `[shareReplay](949eed49-126e-4655-9a43-e5eb84f91360)(1)` for a cache that lives until the last subscriber unsubscribes, and `shareReplay({ bufferSize: 1, refCount: false })` for a permanent cache.
- The `shareReplay` operator can be used in various configurations, including caching forever, caching only while someone is listening, caching the last N values, and expiring the cache after a certain time, with the most common pattern being `shareReplay(1)`.
- In a component or service, the cached value can be subscribed to using the `getUsers()` method, which returns the shared observable, and only one network request will be seen in the browser dev tools even if multiple components call `getUsers()` simultaneously.
- Different configurations can be chosen based on specific requirements, such as caching forever for master data or config, caching only while someone is listening for real-time data, or caching the last N values for a specific use case.

## Advanced Caching Patterns and TTL Behavior
- For more advanced patterns, such as TTL-based expiration or cache per parameter, custom logic can be implemented using timers, switchMap, or other operators, and the [[shareReplay]] operator can be used with a windowTime parameter to approximate TTL-based expiration behavior.
- The `shareReplay` operator in RxJS is used to cache and share [[HTTP]] requests, and one way to implement this is by using `shareReplay` with `windowTime`, which is the simplest built-in approach.
- In the provided [[TypeScript]] code, the `DataService` class uses the `HttpClient` to make a GET request to a specified API endpoint, and the response is cached using `shareReplay` with a `bufferSize` of 1 and a `windowTime` of 1 hour, which means that values older than 1 hour are discarded.
- The `refCount` property is set to `false`, which means that the cache persists even when there are no subscribers, allowing the cached value to be replayed to new subscribers without triggering a new HTTP request.
- The first subscriber to the `data$` observable triggers the HTTP request, and the response is cached and replayed to all subsequent subscribers, with new subscribers receiving the cached value immediately if they arrive within the specified `windowTime`.
- If more than 1 hour has passed since the last emission, the cached value is considered expired, and the source observable is re-subscribed, triggering a new HTTP request to fetch fresh data.

## Implementation with the DataService Class
- The `windowTime` does not reset on each new emission, which means that the timer starts from the moment the first value is emitted, and once the window expires, no further values are replayed until the source re-emits, which may not be suitable for all use cases.
- For more precise control over expiration logic, such as restarting the timer every time a fresh value is fetched, alternative approaches like Option 2, which uses `defer` and `switchMap`, can be used to achieve a sliding TTL.
- The provided [[TypeScript]] code demonstrates how to cache and share [[HTTP]] requests using the [[shareReplay]] operator from RxJS, with the goal of maintaining data freshness while minimizing redundant fetches from the underlying data source.
- The `DataService` class utilizes a private `cachedData$` observable, which is initialized with a deferred observable that checks if the cache is still valid based on a predefined time-to-live (TTL) of 1 hour, and returns either the cached data or fetches fresh data from the API.
- The code also presents alternative approaches, including using the `timer` function to drive cache expiration, which automatically refreshes the data every hour even without subscribers, and a manual invalidation approach using a `CacheService` class with explicit TTL and optional manual invalidation.

## Fixed vs. Sliding TTL Mechanisms
- The `CacheService` class provides a simple in-memory cache helper with methods for getting, invalidating, and clearing cache entries, and can be used in services to cache data with a specified TTL, such as caching a list of users with a 1-hour TTL.
- The recommendation is to start with the first option using [[shareReplay]] and move to the other options when features like sliding expiration, manual invalidation, or background auto-refresh are needed.
- Sliding Time-To-Live (TTL) mechanics involve resetting the expiration timer each time the cached data is accessed, creating a "sliding window" of validity that extends the cache's lifespan as long as the data remains actively used, and this approach is useful for maintaining data freshness while minimizing redundant fetches.
- The core mechanics of sliding TTL involve initial cache creation, access and renewal, and expiration and refresh, where the cache stores the data along with a timestamp and updates the expiration timestamp on each access, ensuring the cache remains valid for another full TTL period from the moment of access.
- The concept of a sliding TTL (Time To Live) cache is discussed, which balances freshness with efficiency by refreshing data only when necessary, and this process repeats indefinitely, with key characteristics including proactive freshness, where data is refreshed only after prolonged inactivity, but frequent access keeps it perpetually fresh without unnecessary refetches.

## Edge Cases and Pseudocode Examples
- The sliding TTL cache is compared to a fixed TTL cache, with the main differences being the expiration trigger, renewal behavior, use case fit, and overhead, where the sliding TTL cache has a slightly higher overhead due to timestamp updates, but is more suitable for high-read, low-change data, such as user sessions.
- Edge cases are considered, including concurrent access, where race conditions may arise, and no access, where the data expires naturally after the full TTL, prompting a refresh on the next request, and implementation nuances are discussed, particularly in asynchronous environments like RxJS, where operators such as defer, tap, and [[shareReplay]] are used to manage shared observables without side effects.
- A pseudocode example is provided to illustrate the sliding cache mechanism, where each getData() call either refreshes or extends the validity of the cache, ensuring the cache "slides" with usage, and this mechanism is particularly valuable in reactive programming paradigms, such as RxJS, where observables can encapsulate the logic to avoid redundant network calls while honoring access patterns.
- The RxJS implementation of a sliding TTL cache is discussed, where the built-in shareReplay() configuration does not provide true sliding behavior, and instead, the expiration timestamp must be managed explicitly and refreshed on each access, with two clean, production-grade patterns commonly used in [[Angular (web framework) | Angular]]/RxJS applications, including the use of explicit timestamp, defer, and tap operators to keep the observable hot and shared while updating the expiration timestamp every time a subscriber receives the cached value.
- The provided [[TypeScript]] code demonstrates three patterns for caching and sharing [[HTTP]] requests using RxJS, specifically the `shareReplay` operator, to achieve a sliding time-to-live (TTL) behavior.

## Implementation Patterns and Reusable Cache Helpers
- The first pattern, "Explicit timestamp", utilizes the `defer` function to run decision logic at subscription time, ensuring that the cache is valid and updating the `lastEmissionTime` to slide the TTL forward, and it uses [[shareReplay]] to share the cached value among concurrent subscribers.
- The second pattern, "Timer-Driven Background Refresh", employs the `timer` function to periodically refresh the cache every TTL interval while there are subscribers, using `shareReplay` with `refCount` set to `true` to clean up when no subscribers are present, although this approach does not provide a pure sliding TTL behavior.
- The third pattern, "Reusable Cache Helper", introduces a `SlidingCacheService` that provides a reusable cache helper for multiple endpoints, allowing for easy invalidation of cache entries and sliding TTL behavior, making it suitable for applications with several cacheable observables.
- Each pattern has its characteristics, such as true sliding TTL, background refresh, manual invalidation, complexity, and best use cases, which are compared in a summary table to help choose the most suitable approach based on specific requirements.
- The choice of pattern depends on the specific needs of the application, such as the need for precise per-request control, always-fresh data while in use, or multiple cached endpoints, and the `SlidingCacheService` can be used to extend the caching functionality with additional features like in-flight request deduplication, per-parameter caching, or persistence.

## Fixed TTL Implementation Details
- The RxJS library provides a straightforward approach to implementing fixed Time-To-Live (TTL) caching using the [[shareReplay]] operator with its windowTime configuration parameter, which creates a fixed expiration window starting from the emission of the first value.
- In the recommended implementation, the shareReplay operator is used with a bufferSize of 1, which caches only the most recent value, and a windowTime parameter set to the desired TTL, such as 1 hour, which discards values older than the specified time.
- The refCount parameter is set to false, allowing the cache to persist even after the last subscriber unsubscribes, which is useful for master or reference data that needs to be retained even when there are no active subscribers.
- The windowTime timer begins when the first value is emitted by the source, and all subscriptions occurring before the windowTime elapses receive the cached value instantly via replay, after which the internal replay buffer is cleared, and the next subscription re-subscribes to the source observable, triggering a fresh [[HTTP]] request.
- The shareReplay operator with fixed TTL behavior is demonstrated in the DataService class, which provides a getData method that returns the shared observable with fixed TTL behavior and an optional invalidateCache method that can be used to force a refresh by invalidating the current cache.
- It is important to note that the expiration is not reset on subsequent accesses, and if the TTL expires and no new subscriber arrives, nothing happens, and only a new subscription triggers the refresh, which is a key difference between fixed and sliding TTL caching mechanisms.
- The use of refCount: true would tear down the source subscription when the subscriber count reaches zero, but the replay buffer would remain until the windowTime expires, whereas refCount: false allows the cache to survive periods of zero subscribers.
- The provided [[TypeScript]] code example demonstrates how to implement fixed TTL caching using the [[shareReplay]] operator and provides a clear understanding of the key mechanics involved in this caching strategy.

## Alternative Approaches and Recommendations
- The `shareReplay` operator in RxJS is used to cache and share [[HTTP]] requests, ensuring that only one HTTP request occurs even when multiple subscribers arrive near-simultaneously after expiration, thanks to its multicast behavior.
- An alternative approach to using `shareReplay` with a fixed TTL is to use an explicit fixed TTL with manual timestamp check, which provides greater control and is useful in scenarios requiring manual invalidation, logging, or combining with other logic.
- The `defer` operator is used to decide at subscription time whether to fetch fresh data or return a shared cached version, based on a manual timestamp check, and this approach allows for more control over cache invalidation and logging.
- The `DataService` class is an example of how to implement this alternative approach, using `defer`, [[shareReplay]], `switchMap`, and `tap` operators to manage the caching and sharing of HTTP requests, with a `ttlMs` variable setting the time to live for the cached data.
- The `forceRefresh` method is used to manually invalidate the cache and force a refresh of the data, by setting the `lastEmissionTimestamp` to 0, which will trigger a new HTTP request on the next subscription.
- The recommendation is to use the first pattern, `shareReplay` with `windowTime`, when simplicity and native RxJS behavior suffice, and to adopt the explicit timestamp variant when manual cache invalidation, logging, or combination with other operators is needed.
- Both approaches ensure that a single [[HTTP]] request is made per validity window, preventing redundant network activity during the TTL period, and the choice between them depends on the specific requirements of the application.




## Sources
- [website](https://grok.com/c/b25f3abd-88a7-4820-95ee-5baff6d0d1ae?rid=de00103a-095d-435b-97b5-e3da863279ae)
