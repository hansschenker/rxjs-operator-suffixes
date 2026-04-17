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
})
