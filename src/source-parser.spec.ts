import getParser, { Parser } from './source-parser'
import { Line } from './types'
import { seedTokens } from './util'

describe('source parser', () => {
  let _parse: Parser

  const nulls = (n: number): null[] => Array(n).fill(null)
  const parse = (source: string): Array<Line[] | null> => source.split('\n').map(_parse)

  beforeEach(() => { _parse = getParser() })

  test('multi-line block', () => {
    const parsed = parse(`
    /**
     * description 0
     *
     * description 1
     *
     * @param {string} value value description 0
    \`\`\`
    @sample code
    \`\`\`
    * description 1
    */`)

    const block: Line[] = [{
      number: 1,
      source: '    /**',
      tokens: seedTokens({ start: '    ', delimiter: '/**', postDelimiter: '', description: '', end: '' })
    }, {
      number: 2,
      source: '     * description 0',
      tokens: seedTokens({ start: '     ', delimiter: '*', postDelimiter: ' ', description: 'description 0', end: '' })
    }, {
      number: 3,
      source: '     *',
      tokens: seedTokens({ start: '     ', delimiter: '*', postDelimiter: '', description: '', end: '' })
    }, {
      number: 4,
      source: '     * description 1',
      tokens: seedTokens({ start: '     ', delimiter: '*', postDelimiter: ' ', description: 'description 1', end: '' })
    }, {
      number: 5,
      source: '     *',
      tokens: seedTokens({ start: '     ', delimiter: '*', postDelimiter: '', description: '', end: '' })
    }, {
      number: 6,
      source: '     * @param {string} value value description 0',
      tokens: seedTokens({ start: '     ', delimiter: '*', postDelimiter: ' ', description: '@param {string} value value description 0', end: '' })
    }, {
      number: 7,
      source: '    ```',
      tokens: seedTokens({ start: '    ', delimiter: '', postDelimiter: '', description: '```', end: '' })
    }, {
      number: 8,
      source: '    @sample code',
      tokens: seedTokens({ start: '    ', delimiter: '', postDelimiter: '', description: '@sample code', end: '' })
    }, {
      number: 9,
      source: '    ```',
      tokens: seedTokens({ start: '    ', delimiter: '', postDelimiter: '', description: '```', end: '' })
    }, {
      number: 10,
      source: '    * description 1',
      tokens: seedTokens({ start: '    ', delimiter: '*', postDelimiter: ' ', description: 'description 1', end: '' })
    }, {
      number: 11,
      source: '    */',
      tokens: seedTokens({ start: '    ', delimiter: '', postDelimiter: '', description: '', end: '*/' })
    }]

    expect(parsed).toEqual([...nulls(11), block])
  })

  test('one-line block', () => {
    const parsed = parse(`
    /** description */
    `)

    const block = [
      {
        number: 1,
        source: '    /** description */',
        tokens: seedTokens({ start: '    ', delimiter: '/**', postDelimiter: ' ', description: 'description ', end: '*/' })
      }
    ]

    expect(parsed).toEqual([null, block, null])
  })

  test('multiple blocks', () => {
    const parsed = parse(`
    /** description 0 */

    /** description 1 */
    `)

    const block0: Line[] = [{
      number: 1,
      source: '    /** description 0 */',
      tokens: seedTokens({ start: '    ', delimiter: '/**', postDelimiter: ' ', description: 'description 0 ', end: '*/' })
    }]

    const block1: Line[] = [{
      number: 3,
      source: '    /** description 1 */',
      tokens: seedTokens({ start: '    ', delimiter: '/**', postDelimiter: ' ', description: 'description 1 ', end: '*/' })
    }]

    expect(parsed).toEqual([null, block0, null, block1, null])
  })
})
