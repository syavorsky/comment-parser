import { expect } from 'chai'
import { seedTokens } from '../src/source-parser'
import { Spec, seedSpec, tagTokenizer, nameTokenizer, typeTokenizer, descriptionTokenizer } from '../src/spec-parser'

describe('spec tokenizers', () => {
  describe('tagTokenizer', () => {
    const tokenize = tagTokenizer()

    it('ok', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: '@param {string} value value description 0' })
        }]
      }))).to.eql(seedSpec({
        tag: 'param', 
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ tag: '@param', postTag: ' ', description: '{string} value value description 0' })
        }]
      }))
    })

    it('require @', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 42,
          source: '...',
          tokens: seedTokens({ description: 'param {string} value value description 0' })
        }]
      }))).to.eql(seedSpec({
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

    it('ok', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: '{string} value value description 0' })
        }]
      }))).to.eql(seedSpec({
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

    it('ok', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: 'value value description 0' })
        }]
      }))).to.eql(seedSpec({
        name: 'value',
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ name: 'value', postName: ' ', description: 'value description 0' })
        }]
      }))
    })

    it('quoted', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: '"value value" description 0' })
        }]
      }))).to.eql(seedSpec({
        name: 'value value',
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ name: '"value value"', postName: ' ', description: 'description 0' })
        }]
      }))
    })

    it('inconsistent quotes', () => {
      expect(tokenize(seedSpec({
        source: [{
          number: 1,
          source: '...',
          tokens: seedTokens({ description: '"value value description 0' })
        }]
      }))).to.eql(seedSpec({
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
