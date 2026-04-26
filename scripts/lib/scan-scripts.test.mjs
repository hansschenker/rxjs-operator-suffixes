import { describe, test, expect, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { stripCodeFences, extractDefinitions, walkRepo } from './scan-scripts.mjs'

describe('stripCodeFences', () => {
	test('removes content inside code fences', () => {
		const content = 'before\n```\ncode here\n```\nafter'
		expect(stripCodeFences(content)).not.toContain('code here')
	})

	test('preserves line count so line numbers remain accurate', () => {
		const content = 'line1\n```\nline3\nline4\n```\nline6'
		const result = stripCodeFences(content)
		expect(result.split('\n').length).toBe(content.split('\n').length)
	})

	test('leaves content outside fences intact', () => {
		const content = 'before\n```\ncode\n```\nafter'
		const result = stripCodeFences(content)
		expect(result).toContain('before')
		expect(result).toContain('after')
	})
})

describe('extractDefinitions', () => {
	let tmpDir

	afterEach(() => {
		if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
	})

	function writeTemp(filename, content) {
		tmpDir = join(tmpdir(), 'scan-test-' + Date.now())
		mkdirSync(tmpDir, { recursive: true })
		const file = join(tmpDir, filename)
		writeFileSync(file, content)
		return file
	}

	test('extracts a definitional sentence containing a known term', () => {
		const file = writeTemp('lesson.md',
			'A cold observable is an observable that creates a new producer per subscriber.\n'
		)
		const results = extractDefinitions(file, new Map([['cold observable', 'definition']]))
		expect(results.some(r => r.term === 'cold observable')).toBe(true)
	})

	test('does not extract from inside code fences', () => {
		const file = writeTemp('lesson.md',
			'```\na cold observable is something inside a fence\n```\n'
		)
		const results = extractDefinitions(file, new Map([['cold observable', 'definition']]))
		expect(results).toHaveLength(0)
	})

	test('includes file path and line number in result', () => {
		const file = writeTemp('lesson.md',
			'intro\nA cold observable is an observable.\n'
		)
		const results = extractDefinitions(file, new Map([['cold observable', 'definition']]))
		expect(results[0].file).toBe(file)
		expect(results[0].line).toBe(2)
	})

	test('does not flag non-definitional use of a term', () => {
		const file = writeTemp('lesson.md',
			'Use switchMap when subscribing to a cold observable in sequence.\n'
		)
		const results = extractDefinitions(file, new Map([['cold observable', 'definition']]))
		expect(results).toHaveLength(0)
	})

	test('does not match term appearing as a substring of a longer word', () => {
		const file = writeTemp('lesson.md',
			'Multicasting is a pattern for sharing a single execution.\n'
		)
		const results = extractDefinitions(file, new Map([['cast', 'definition']]))
		expect(results).toHaveLength(0)
	})
})

describe('walkRepo', () => {
	let tmpDir

	afterEach(() => {
		if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
	})

	test('counts .md files and returns definitions and candidates', () => {
		tmpDir = join(tmpdir(), 'walk-test-' + Date.now())
		mkdirSync(join(tmpDir, 'sub'), { recursive: true })
		writeFileSync(join(tmpDir, 'a.md'), 'A cold observable is a fresh producer per subscribe.\n')
		writeFileSync(join(tmpDir, 'sub', 'b.md'), 'Flattening refers to subscribing to inner observables.\n')
		writeFileSync(join(tmpDir, 'c.ts'), 'not a markdown file')

		const glossary = new Map([['cold observable', 'definition']])
		const { definitions, candidates, fileCount } = walkRepo(tmpDir, glossary)
		expect(fileCount).toBe(2)
		expect(definitions.some(d => d.term === 'cold observable')).toBe(true)
		// 'flattening' is not in the glossary — captured in candidates
		expect(candidates.some(c => c.term === 'flattening')).toBe(true)
	})
})
