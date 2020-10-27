import { typeTokenizer } from '../src/spec-parser'
import { seedTokens, seedSpec } from '../src/util'

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