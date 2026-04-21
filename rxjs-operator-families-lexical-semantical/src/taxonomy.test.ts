import { describe, it, expect } from 'vitest'
import { taxonomy } from './taxonomy'

describe('taxonomy structure', () => {
  it('has 14 families', () => {
    expect(taxonomy).toHaveLength(14)
  })

  it('all families have unique letters', () => {
    const letters = taxonomy.map(f => f.letter)
    expect(new Set(letters).size).toBe(letters.length)
  })

  it('all families have at least one subFamily', () => {
    for (const family of taxonomy) {
      expect(family.subFamilies.length).toBeGreaterThan(0)
    }
  })

  it('all subFamilies have at least one operator', () => {
    for (const family of taxonomy) {
      for (const sub of family.subFamilies) {
        expect(sub.operators.length).toBeGreaterThan(0)
      }
    }
  })

  it('all operator slugs are unique across the taxonomy', () => {
    const slugs = taxonomy.flatMap(f =>
      f.subFamilies.flatMap(s => s.operators.map(o => o.slug))
    )
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('all operator slugs are valid JavaScript identifiers', () => {
    const slugs = taxonomy.flatMap(f =>
      f.subFamilies.flatMap(s => s.operators.map(o => o.slug))
    )
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/)
    }
  })

  it('all operators have non-empty taglines', () => {
    for (const family of taxonomy) {
      for (const sub of family.subFamilies) {
        for (const op of sub.operators) {
          expect(op.tagline.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('operator name matches slug for all operators', () => {
    for (const family of taxonomy) {
      for (const sub of family.subFamilies) {
        for (const op of sub.operators) {
          expect(op.slug).toBe(op.name)
        }
      }
    }
  })

  it('all family labels are unique', () => {
    const labels = taxonomy.map(f => f.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('all subFamily labels are unique within their family', () => {
    for (const family of taxonomy) {
      const labels = family.subFamilies.map(s => s.label)
      expect(new Set(labels).size).toBe(labels.length)
    }
  })
})
