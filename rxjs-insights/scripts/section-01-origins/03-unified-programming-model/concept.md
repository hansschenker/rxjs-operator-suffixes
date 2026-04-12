# One Model for Every Data Source

**Section:** Origins
**Insight:** Unified Programming Model
**Lesson type:** Concept
**Estimated duration:** 2 min

---

One of the most practical things LINQ gave the world wasn't a specific operator — it was an insight about abstraction. Before LINQ, working with different kinds of data meant learning different APIs for each one. You used one mental model for SQL queries, another for XML parsing, another for in-memory collections. The concepts didn't transfer. Every new data source was a new learning investment.

LINQ collapsed all of that. By defining a single query vocabulary — filter, transform, flatten, aggregate — and making it work against any type that satisfied a simple interface, it freed the developer from thinking about the source at all. You learned the query model once, and it applied everywhere.

RxJS inherits this insight completely, and extends it into the async world. Whether your data source is a mouse click captured with `fromEvent`, a WebSocket message stream from `webSocket()`, an HTTP response from `ajax()`, or a periodic timer from `interval()` — each one returns an Observable. And because they all return the same type, the same operators work on all of them. You don't have a click-handling API and a timer API and an HTTP API that you have to translate between. You have Observable, and you have operators.

This might seem like a small thing, but it has profound consequences for how you design systems. Your business logic — the filtering, the transformation, the combination — lives in the operator chain, completely decoupled from the source. If you need to swap a REST polling mechanism for a WebSocket connection, you change the source Observable and nothing else. Your operators are untouched. That's not just convenient — it's architecturally sound. It means your logic can be tested against a simple `of()` Observable, while your production code connects to a live API. The unified model is the reason that works.
