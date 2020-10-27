import getParser from './block-parser'
import { Line } from './types'
import { seedTokens } from './util'

describe('block parser', () => {
  /**
    * description 0
    *
    * description 1
    *
    * @param {string} value value description 0
   ```
   @sample code
   ```
   * value description 1
   */

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
    source: '    * value description 1',
    tokens: seedTokens({ start: '    ', delimiter: '*', postDelimiter: ' ', description: 'value description 1', end: '' })
  }, {
    number: 11,
    source: '    */',
    tokens: seedTokens({ start: '    ', delimiter: '', postDelimiter: '', description: '', end: '*/' })
  }]

  test('groups lines', () => {
    const parser = getParser()
    const groups:Line[][] = parser(block)

    expect(groups.length).toBe(2)
    expect(groups).toEqual([
      block.slice(0, 5),
      block.slice(5)
    ])    
  })

  // test('join: "compact"', () => {
  //   const parser = getParser({ join: 'compact' })
  //   const items = parser(block)

  //   expect(items).toBe([{
  //     text: 'description 0 description 1',
  //     source: block.slice(0, 5)
  //   }, {
  //     text: '@param {string} value value description 0 ``` @sample code ``` value description 1',
  //     source: block.slice(5)
  //   }])
  // })

  // test('join: "multiline"', () => {
  //   const parser = getParser({ join: 'multiline' })
  //   const items = parser(block)

  //   expect(items).toBe([{
  //     text: 'description 0\n\ndescription 1\n',
  //     source: block.slice(0, 5)
  //   }, {
  //     text: '@param {string} value value description 0\n    ```\n    @sample code\n    ```\nvalue description 1',
  //     source: block.slice(5)
  //   }])
  // })
})
