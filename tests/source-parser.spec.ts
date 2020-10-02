import { expect } from 'chai'
import getParser, { Parser, Line } from '../src/source-parser'

describe('source parser', () => {
  let _parse: Parser

  const nulls = (n: number): null[] => Array(n).fill(null)
  const parse = (source: string): Array<Line[] | null> => source.split('\n').map(_parse)

  beforeEach(() => { _parse = getParser() })

  it('multi-line block', () => {
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

    const block = [{
      line: 1,
      source: '    /**',
      tokens: { start: '    ', delimiter: '/**', postDelimiter: '', text: '', end: '' }
    }, {
      line: 2,
      source: '     * description 0',
      tokens: { start: '     ', delimiter: '*', postDelimiter: ' ', text: 'description 0', end: '' }
    }, {
      line: 3,
      source: '     *',
      tokens: { start: '     ', delimiter: '*', postDelimiter: '', text: '', end: '' }
    }, {
      line: 4,
      source: '     * description 1',
      tokens: { start: '     ', delimiter: '*', postDelimiter: ' ', text: 'description 1', end: '' }
    }, {
      line: 5,
      source: '     *',
      tokens: { start: '     ', delimiter: '*', postDelimiter: '', text: '', end: '' }
    }, {
      line: 6,
      source: '     * @param {string} value value description 0',
      tokens: { start: '     ', delimiter: '*', postDelimiter: ' ', text: '@param {string} value value description 0', end: '' }
    }, {
      line: 7,
      source: '    ```',
      tokens: { start: '    ', delimiter: '', postDelimiter: '', text: '```', end: '' }
    }, {
      line: 8,
      source: '    @sample code',
      tokens: { start: '    ', delimiter: '', postDelimiter: '', text: '@sample code', end: '' }
    }, {
      line: 9,
      source: '    ```',
      tokens: { start: '    ', delimiter: '', postDelimiter: '', text: '```', end: '' }
    }, {
      line: 10,
      source: '    * description 1',
      tokens: { start: '    ', delimiter: '*', postDelimiter: ' ', text: 'description 1', end: '' }
    }, {
      line: 11,
      source: '    */',
      tokens: { start: '    ', delimiter: '', postDelimiter: '', text: '', end: '*/' }
    }]

    expect(parsed).to.eql([...nulls(11), block])
  })

  it('one-line block', () => {
    const parsed = parse(`
    /** description */
    `)

    const block = [
      {
        line: 1,
        source: '    /** description */',
        tokens: { start: '    ', delimiter: '/**', postDelimiter: ' ', text: 'description ', end: '*/' }
      }
    ]

    expect(parsed).to.eql([null, block, null])
  })

  it('multiple blocks', () => {
    const parsed = parse(`
    /** description 0 */

    /** description 1 */
    `)

    const block0 = [
      {
        line: 1,
        source: '    /** description 0 */',
        tokens: { start: '    ', delimiter: '/**', postDelimiter: ' ', text: 'description 0 ', end: '*/' }
      }
    ]

    const block1 = [
      {
        line: 3,
        source: '    /** description 1 */',
        tokens: { start: '    ', delimiter: '/**', postDelimiter: ' ', text: 'description 1 ', end: '*/' }
      }
    ]

    expect(parsed).to.eql([null, block0, null, block1, null])
  })
})
