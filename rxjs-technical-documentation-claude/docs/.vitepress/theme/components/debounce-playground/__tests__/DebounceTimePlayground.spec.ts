import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DebounceTimePlayground from '../../DebounceTimePlayground.vue'

describe('DebounceTimePlayground', (): void => {
	test('renders preset selector with the default preset name', (): void => {
		const wrapper = mount(DebounceTimePlayground)
		const selector = wrapper.find('[data-testid="preset-selector"]')
		expect(selector.exists()).toBe(true)
		expect((selector.element as HTMLSelectElement).value).toBe('0')
	})

	test('renders play, reset, debounce slider controls', (): void => {
		const wrapper = mount(DebounceTimePlayground)
		expect(wrapper.find('[data-testid="play-button"]').exists()).toBe(true)
		expect(wrapper.find('[data-testid="reset-button"]').exists()).toBe(true)
		expect(wrapper.find('[data-testid="debounce-ms-slider"]').exists()).toBe(true)
	})

	test('debounceMs slider default is 300', (): void => {
		const wrapper = mount(DebounceTimePlayground)
		const slider = wrapper.find('[data-testid="debounce-ms-slider"]')
		expect((slider.element as HTMLInputElement).value).toBe('300')
	})

	test('renders source marbles matching the default preset count', (): void => {
		const wrapper = mount(DebounceTimePlayground)
		const marbles = wrapper.findAll('[data-testid="source-marble"]')
		// Default preset "Typing burst" has 5 marbles
		expect(marbles).toHaveLength(5)
	})

	test('source marble labels match preset ordering', (): void => {
		const wrapper = mount(DebounceTimePlayground)
		const labels = wrapper.findAll('[data-testid="source-marble-label"]').map(
			(w): string => w.text()
		)
		expect(labels).toEqual(['a', 'b', 'c', 'd', 'e'])
	})
})
