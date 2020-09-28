import { expect } from 'chai'
import getParser, { Block, Parser } from '../src/source-parser'

describe('source parser', () => {
  let _parse: Parser

  const nulls = (n: number): null[] => Array(n).fill(null)
  const parse = (source: string): Array<Block | null> => source.split('\n').map(_parse)
  const noTokens = {
    start: '',
    delim: '',
    postDelim: '',
    tag: '',
    postTag: '',
    type: '',
    postType: '',
    name: '',
    postName: '',
    descr: '',
    end: ''
  }

  beforeEach(() => { _parse = getParser() })

  it('one-line description', () => {
    const parsed = parse(`
    /**
     * description
     */
    `)

    const expected = [
      {
        line: 1,
        source: '',
        tokens: { ...noTokens, start: '    ', delim: '/**', postDelim: '' }
      },
      {
        line: 2,
        source: 'description',
        tokens: { ...noTokens, start: '     ', delim: '*', postDelim: ' ' }
      },
      {
        line: 3,
        source: '',
        tokens: { ...noTokens, start: '     ', end: '*/' }
      }
    ]

    expect(parsed).to.eql([...nulls(3), expected, null])
  })

  it('multi-line description', () => {
    const parsed = parse(`
    /**
     * description 0
     *
     * description 1
     *
     */
    `)

    const expected = [
      {
        line: 1,
        source: '',
        tokens: { ...noTokens, start: '    ', delim: '/**' }
      },
      {
        line: 2,
        source: 'description 0',
        tokens: { ...noTokens, start: '     ', delim: '*', postDelim: ' ' }
      },
      {
        line: 3,
        source: '',
        tokens: { ...noTokens, start: '     ', delim: '*' }
      },
      {
        line: 4,
        source: 'description 1',
        tokens: { ...noTokens, start: '     ', delim: '*', postDelim: ' ' }
      },
      {
        line: 5,
        source: '',
        tokens: { ...noTokens, start: '     ', delim: '*' }
      },
      {
        line: 6,
        source: '',
        tokens: { ...noTokens, start: '     ', end: '*/' }
      }
    ]

    expect(parsed).to.eql([...nulls(6), expected, null])
  })

  it('no delimiter', () => {
    const parsed = parse(`
    /**
     * description 0
     description 1
     */
    `)

    const expected = [
      {
        line: 1,
        source: '',
        tokens: { ...noTokens, start: '    ', delim: '/**' }
      },
      {
        line: 2,
        source: 'description 0',
        tokens: { ...noTokens, start: '     ', delim: '*', postDelim: ' ' }
      },
      {
        line: 3,
        source: 'description 1',
        tokens: { ...noTokens, start: '     ' }
      },
      {
        line: 4,
        source: '',
        tokens: { ...noTokens, start: '     ', end: '*/' }
      }
    ]

    expect(parsed).to.eql([...nulls(4), expected, null])
  })
})
