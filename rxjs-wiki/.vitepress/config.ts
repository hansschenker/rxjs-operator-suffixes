import { defineConfig } from 'vitepress';

export default defineConfig({
	title: 'RxJS Wiki',
	description: 'A persistent, compounding knowledge base about RxJS — core concepts, patterns, architectures, testing, and debugging.',
	srcExclude: ['sources/**', 'rxjs-wiki.txt'],

	themeConfig: {
		nav: [
			{ text: 'Overview', link: '/overview' },
			{ text: 'Core', link: '/core/Observable' },
			{ text: 'Patterns', link: '/patterns/index' },
			{ text: 'Architectures', link: '/architectures/index' },
			{ text: 'Testing', link: '/testing/index' },
			{ text: 'Debugging', link: '/debugging/index' },
		],

		sidebar: [
			{
				text: 'Getting Started',
				items: [
					{ text: 'Index', link: '/index' },
					{ text: 'Overview', link: '/overview' },
				],
			},
			{
				text: 'Core',
				collapsed: false,
				items: [
					{ text: 'Observable', link: '/core/Observable' },
					{ text: 'Observer', link: '/core/Observer' },
					{ text: 'Subscription', link: '/core/Subscription' },
					{ text: 'Subject', link: '/core/Subject' },
					{ text: 'Subjects — Complete Guide', link: '/core/subjects-guide' },
					{ text: 'BehaviorSubject', link: '/core/BehaviorSubject' },
					{ text: 'ReplaySubject', link: '/core/ReplaySubject' },
					{ text: 'AsyncSubject', link: '/core/AsyncSubject' },
					{ text: 'Scheduler', link: '/core/Scheduler' },
					{ text: 'Operators Overview', link: '/core/operators' },
					{ text: 'Hot and Cold Observables', link: '/core/hot-cold' },
					{ text: 'Custom Operators & pipe()', link: '/core/custom-operators' },
					{ text: 'Operator Policies (8-Policy)', link: '/core/operator-policies' },
					{ text: 'Observable Internals', link: '/core/observable-internals' },
					{ text: 'combineLatest — Formal Rules', link: '/core/combine-latest' },
					{ text: 'shareReplay — Caching', link: '/core/share-replay' },
					{ text: 'Execution Phases', link: '/core/execution-phases' },
					{ text: 'Combination Operators', link: '/core/combination-operators' },
					{ text: 'FRP Concepts — Behaviors & Events', link: '/core/frp-concepts' },
					{ text: 'RxJS as a Dataflow Model', link: '/core/dataflow-model' },
					{ text: 'Stream Machine Calculus', link: '/core/stream-machines' },
					{ text: 'Higher-Order Operators', link: '/core/higher-order-operators' },
				],
			},
			{
				text: 'History',
				collapsed: true,
				items: [
					{ text: 'Timeline', link: '/history/timeline' },
					{ text: 'Erik Meijer', link: '/history/erik-meijer' },
					{ text: 'RxJS 5 → 6', link: '/history/rxjs5-to-6' },
					{ text: 'RxJS 6 → 7', link: '/history/rxjs6-to-7' },
				],
			},
			{
				text: 'Patterns',
				collapsed: false,
				items: [
					{ text: 'Patterns Index', link: '/patterns/index' },
					{ text: 'MVU Pattern', link: '/patterns/mvu' },
					{ text: 'Effects Pattern', link: '/patterns/effects' },
					{ text: 'State Management', link: '/patterns/state-management' },
					{ text: 'Error Handling', link: '/patterns/error-handling' },
					{ text: 'State Machine', link: '/patterns/state-machine' },
					{ text: 'Animations', link: '/patterns/animations' },
					{ text: 'Domain Operators', link: '/patterns/domain-operators' },
				],
			},
			{
				text: 'Architectures',
				collapsed: false,
				items: [
					{ text: 'Architectures Index', link: '/architectures/index' },
					{ text: 'MVU Architecture', link: '/architectures/mvu' },
					{ text: 'redux-observable', link: '/architectures/redux-observable' },
					{ text: 'Event-Driven', link: '/architectures/event-driven' },
					{ text: 'XState vs RxJS', link: '/architectures/xstate-vs-rxjs' },
				],
			},
			{
				text: 'Testing',
				collapsed: false,
				items: [
					{ text: 'Testing Index', link: '/testing/index' },
					{ text: 'Marble Testing', link: '/testing/marble-testing' },
					{ text: 'TestScheduler', link: '/testing/TestScheduler' },
				],
			},
			{
				text: 'Debugging',
				collapsed: false,
				items: [
					{ text: 'Debugging Index', link: '/debugging/index' },
					{ text: 'tap Operator', link: '/debugging/tap' },
					{ text: 'Common Mistakes', link: '/debugging/common-mistakes' },
				],
			},
		],

		search: {
			provider: 'local',
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/hansschenker/rxjs-wiki' },
		],

		editLink: {
			pattern: 'https://github.com/hansschenker/rxjs-wiki/edit/main/:path',
			text: 'Edit this page on GitHub',
		},

		footer: {
			message: 'RxJS Wiki — maintained with Claude Code',
		},
	},

	markdown: {
		lineNumbers: true,
	},
});
