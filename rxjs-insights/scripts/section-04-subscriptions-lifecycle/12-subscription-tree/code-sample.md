# Subscriptions Form a Tree — Code Sample

**Section:** Subscriptions & Lifecycle
**Insight:** Subscription tree
**Lesson type:** Code Sample
**Estimated duration:** 3 min

---

Here's the subscription tree pattern in its most direct form — two independent intervals, one parent Subscription, one unsubscribe call.

```typescript
import { interval, Subscription } from 'rxjs';

const parent = new Subscription();

const child1 = interval(300).subscribe(n => console.log('A:', n));
const child2 = interval(500).subscribe(n => console.log('B:', n));

parent.add(child1);
parent.add(child2);

// One call tears down the entire tree
setTimeout(() => {
  parent.unsubscribe();
  console.log('Parent closed:', parent.closed); // true
  console.log('Child1 closed:', child1.closed); // true
  console.log('Child2 closed:', child2.closed); // true
}, 2000);
```

Let's walk through it. We start by creating a bare Subscription — not from subscribing to anything, just new Subscription(). This is the root of our tree. It doesn't do anything on its own until we start adding children.

Then we subscribe to two interval Observables independently. interval(300) fires roughly three times per second, labelled A. interval(500) fires twice per second, labelled B. These are two completely separate execution contexts running simultaneously. Each produces a child Subscription when subscribe() is called, and we store those in child1 and child2.

Next we add both children to the parent using parent.add(). At this point, the tree is connected. child1 and child2 are owned by parent. They're still running independently — add() doesn't affect their behavior — but now their lifecycle is tied to the parent's.

After 2000 milliseconds the setTimeout fires. We call parent.unsubscribe() once. Internally, RxJS iterates the parent's child list and calls unsubscribe() on child1 and child2 in sequence. The interval teardowns fire — both intervals are cleared. All three subscriptions now report closed as true.

The thing to notice is what we didn't do. We didn't store child1 and child2 in an array and loop over them. We didn't write a teardown function that manually unsubscribes each one. We didn't risk forgetting one. The tree is the abstraction that makes this safe.

In a real application, the parent Subscription would be created in a component's initialization code, and parent.unsubscribe() would be called in the component's destroy hook. Every stream the component creates gets added to the parent. When the component goes away, one line cleans up everything. That's the pattern in practice.
