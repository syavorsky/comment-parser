import getParser from '../src/block-parser'

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
    source: '    * value description 1',
    tokens: { start: '    ', delimiter: '*', postDelimiter: ' ', text: 'value description 1', end: '' }
  }, {
    line: 11,
    source: '    */',
    tokens: { start: '    ', delimiter: '', postDelimiter: '', text: '', end: '*/' }
  }]

  test('default options', () => {
    const parser = getParser()
    const items = parser(block)

    expect(items).toBe([{
      text: 'description 0 description 1',
      source: block.slice(0, 5)
    }, {
      text: '@param {string} value value description 0 ``` @sample code ``` value description 1',
      source: block.slice(5)
    }])
  })

  test('join: "compact"', () => {
    const parser = getParser({ join: 'compact' })
    const items = parser(block)

    expect(items).toBe([{
      text: 'description 0 description 1',
      source: block.slice(0, 5)
    }, {
      text: '@param {string} value value description 0 ``` @sample code ``` value description 1',
      source: block.slice(5)
    }])
  })

  test('join: "multiline"', () => {
    const parser = getParser({ join: 'multiline' })
    const items = parser(block)

    expect(items).toBe([{
      text: 'description 0\n\ndescription 1\n',
      source: block.slice(0, 5)
    }, {
      text: '@param {string} value value description 0\n    ```\n    @sample code\n    ```\nvalue description 1',
      source: block.slice(5)
    }])
  })
})
