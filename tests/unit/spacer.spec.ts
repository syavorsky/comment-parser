import getSpacer from '../../src/parser/spacer';
import { Line } from '../../src/primitives';
import { seedTokens } from '../../src/util';

const source: Line[] = [
  {
    number: 1,
    source: '  /**',
    tokens: seedTokens({
      start: '  ',
      delimiter: '/**',
    }),
  },
  {
    number: 2,
    source: '   *   ',
    tokens: seedTokens({
      start: '   ',
      delimiter: '*',
      postDelimiter: '   ',
    }),
  },
  {
    number: 3,
    source: '   *   Description first line\twith\ttabs   ',
    tokens: seedTokens({
      start: '   ',
      delimiter: '*',
      postDelimiter: '   ',
      description: 'Description first line\twith\ttabs   ',
    }),
  },
  {
    number: 4,
    source: '   *     second line   ',
    tokens: seedTokens({
      start: '   ',
      delimiter: '*',
      postDelimiter: '     ',
      description: 'second line   ',
    }),
  },
  {
    number: 5,
    source: '   *   ',
    tokens: seedTokens({
      start: '   ',
      delimiter: '*',
      postDelimiter: '   ',
    }),
  },
  {
    number: 6,
    source: '   *       third line   ',
    tokens: seedTokens({
      start: '   ',
      delimiter: '*',
      postDelimiter: '       ',
      description: 'third line   ',
    }),
  },
  {
    number: 7,
    source: '   */',
    tokens: seedTokens({
      start: '   ',
      end: '*/',
    }),
  },
];

test('compact', () => {
  const joined = getSpacer('compact')(source);
  expect(joined).toBe(
    'Description first line\twith\ttabs second line third line'
  );
});

test('preserve', () => {
  const joined = getSpacer('preserve')(source);
  expect(joined).toBe(
    '  \n  Description first line\twith\ttabs   \n    second line   \n  \n      third line   '
  );
});

test('preserve - empty', () => {
  const joined = getSpacer('preserve')([]);
  expect(joined).toBe('');
});

test('preserve - no delimiter', () => {
  const joined = getSpacer('preserve')([
    {
      number: 1,
      source: '...',
      tokens: seedTokens({
        start: '   ',
        delimiter: '',
        postDelimiter: '',
        description: 'line with no delimiter',
      }),
    },
  ]);
  expect(joined).toBe('   line with no delimiter');
});

test('custom', () => {
  const spacerFn = (source: Line[]) =>
    source
      .map(({ tokens: { description } }) =>
        description.replace(/\s+/g, ' ').trim().toUpperCase()
      )
      .filter((s) => s !== '')
      .join(' ');

  const joined = getSpacer(spacerFn)(source);
  expect(joined).toBe(
    'DESCRIPTION FIRST LINE WITH TABS SECOND LINE THIRD LINE'
  );
});
