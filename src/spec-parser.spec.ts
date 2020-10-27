import { tagTokenizer, nameTokenizer, typeTokenizer, descriptionTokenizer } from './spec-parser'
import { seedTokens, seedSpec } from './util'

describe('spec tokenizers', () => {
  describe('tagTokenizer', () => {
    const tokenize = tagTokenizer()

    test('ok', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: '@param {string} value value description 0' })
        }]
      }))).toEqual(seedSpec({
        tag: 'param', 
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ tag: '@param', postTag: ' ', description: '{string} value value description 0' })
        }]
      }))
    })

    test('require @', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 42,
          source: '...',
          tokens: seedTokens({ description: 'param {string} value value description 0' })
        }]
      }))).toEqual(seedSpec({
        problems: [{
          code: 'tag:prefix',
          message: 'tag should start with "@" symbol',
          critical: true,
          line: 42
        }],
        source: [{
          number: 42,
          source: '...',
          tokens: seedTokens({ description: 'param {string} value value description 0' })
        }]
      }))
    })
  })

  describe('typeTokenizer', () => {
    const tokenize = typeTokenizer()

    test('ok', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: '{string} value value description 0' })
        }]
      }))).toEqual(seedSpec({
        type: 'string',
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ type: '{string}', postType: ' ', description: 'value value description 0' })
        }]
      }))
    })
  })

  describe('nameTokenizer', () => {
    const tokenize = nameTokenizer()

    test('ok', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: 'value value description 0' })
        }]
      }))).toEqual(seedSpec({
        name: 'value',
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ name: 'value', postName: ' ', description: 'value description 0' })
        }]
      }))
    })

    test('quoted', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: '"value value" description 0' })
        }]
      }))).toEqual(seedSpec({
        name: 'value value',
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ name: '"value value"', postName: ' ', description: 'description 0' })
        }]
      }))
    })

    test('inconsistent quotes', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: '"value value description 0' })
        }]
      }))).toEqual(seedSpec({
        name: '"value',
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ name: '"value', postName: ' ', description: 'value description 0' })
        }]
      }))
    })
  })
})
