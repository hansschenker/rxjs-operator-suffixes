import { defineConfig } from 'vitepress'
import { resolve } from 'path'

export default defineConfig({
	title: 'RxJS Operator Families',
	description: 'Navigate RxJS operators by semantic family',
	ignoreDeadLinks: true,
	vite: {
		resolve: {
			alias: {
				'@taxonomy': resolve(__dirname, '../../src/taxonomy.ts')
			}
		}
	},
	themeConfig: {
		nav: [
			{ text: 'Navigator', link: '/' }
		],
		sidebar: []
	}
})
