import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
	test: {
		include: ['src/**/*.test.ts']
	},
	resolve: {
		alias: {
			'@taxonomy': resolve(__dirname, 'src/taxonomy.ts')
		}
	}
})
