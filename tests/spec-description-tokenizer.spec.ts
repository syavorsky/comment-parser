import { descriptionTokenizer } from '../src/spec-parser'
import { seedTokens, seedSpec } from '../src/util'

const sourceSingle = [{
  number: 1,
  source: '...',
  tokens: seedTokens({ description: '  one  two  ' })
}]

const sourceMultiple = [{
  number: 1,
  source: '...',
  tokens: seedTokens({ description: 'one  two  ' })
}, {
  number: 2,
  source: '...',
  tokens: seedTokens({ description: '' })
}, {
  number: 3,
  source: '...',
  tokens: seedTokens({ description: '  three  four' })
}, {
  number: 4,
  source: '...',
  tokens: seedTokens({ description: '' })
}]

test('compact single line', () => {
  const tokenize = descriptionTokenizer('compact')
  const input = seedSpec({source: sourceSingle})
  const output = seedSpec({source: sourceSingle, description: 'one  two'})
  expect(tokenize(input)).toEqual(output)
})

test('compact multiple lines', () => {
  const tokenize = descriptionTokenizer('compact')
  const input = seedSpec({source: sourceMultiple})
  const output = seedSpec({source: sourceMultiple, description: 'one  two three  four'})
  expect(tokenize(input)).toEqual(output)
})

test('multiline', () => {
  const tokenize = descriptionTokenizer('multiline')
  const input = seedSpec({source: sourceMultiple})
  const output = seedSpec({
    source: sourceMultiple,
    description: 'one  two  \n\n  three  four\n'
  })

  expect(tokenize(input)).toEqual(output)
})