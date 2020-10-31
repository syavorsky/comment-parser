import getParser from '../src';
import { seedBlock, seedTokens } from '../src/util';

const parse = getParser();

test('should parse doc block with description', () => {
  expect(
    parse(`
    /**
     * Description
     */
    `)
  ).toEqual([
    {
      description: 'Description',
      problems: [],
      tags: [],
      source: [
        {
          number: 1,
          source: '    /**',
          tokens: seedTokens({ start: '    ', delimiter: '/**' }),
        },
        {
          number: 2,
          source: '     * Description',
          tokens: seedTokens({
            start: '     ',
            delimiter: '*',
            postDelimiter: ' ',
            description: 'Description',
          }),
        },
        {
          number: 3,
          source: '     */',
          tokens: seedTokens({ start: '     ', end: '*/' }),
        },
      ],
    },
  ]);
});
