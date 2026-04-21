import DefaultTheme from 'vitepress/theme'
import ThreePanelNavigator from '../components/ThreePanelNavigator.vue'
import OperatorBreadcrumb from '../components/OperatorBreadcrumb.vue'
import type { App } from 'vue'

export default {
	extends: DefaultTheme,
	enhanceApp({ app }: { app: App }) {
		app.component('ThreePanelNavigator', ThreePanelNavigator)
		app.component('OperatorBreadcrumb', OperatorBreadcrumb)
	}
}
