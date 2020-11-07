import { nameTokenizer } from '../../src/spec-parser';
import { seedTokens, seedSpec } from '../../src/util';

const tokenize = nameTokenizer();

test('single word', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 1,
            source: '...',
            tokens: seedTokens({ description: 'value value description 0' }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      name: 'value',
      source: [
        {
          number: 1,
          source: '...',
          tokens: seedTokens({
            name: 'value',
            postName: ' ',
            description: 'value description 0',
          }),
        },
      ],
    })
  );
});

test('dash-delimitered', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 1,
            source: '...',
            tokens: seedTokens({ description: 'value-value description 0' }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      name: 'value-value',
      source: [
        {
          number: 1,
          source: '...',
          tokens: seedTokens({
            name: 'value-value',
            postName: ' ',
            description: 'description 0',
          }),
        },
      ],
    })
  );
});

test('quoted', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 1,
            source: '...',
            tokens: seedTokens({ description: '"value value" description 0' }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      name: 'value value',
      source: [
        {
          number: 1,
          source: '...',
          tokens: seedTokens({
            name: '"value value"',
            postName: ' ',
            description: 'description 0',
          }),
        },
      ],
    })
  );
});

test('inconsistent quotes', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 1,
            source: '...',
            tokens: seedTokens({ description: '"value value description 0' }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      name: '"value',
      source: [
        {
          number: 1,
          source: '...',
          tokens: seedTokens({
            name: '"value',
            postName: ' ',
            description: 'value description 0',
          }),
        },
      ],
    })
  );
});
