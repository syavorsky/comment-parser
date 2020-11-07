import { tagTokenizer } from '../../src/spec-parser';
import { seedTokens, seedSpec } from '../../src/util';

const tokenize = tagTokenizer();

test('ok', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 1,
            source: '...',
            tokens: seedTokens({
              description: '@param {string} value value description 0',
            }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      tag: 'param',
      source: [
        {
          number: 1,
          source: '...',
          tokens: seedTokens({
            tag: '@param',
            postTag: ' ',
            description: '{string} value value description 0',
          }),
        },
      ],
    })
  );
});

test('require @', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 42,
            source: '...',
            tokens: seedTokens({
              description: 'param {string} value value description 0',
            }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      problems: [
        {
          code: 'spec:tag:prefix',
          message: 'tag should start with "@" symbol',
          critical: true,
          line: 42,
        },
      ],
      source: [
        {
          number: 42,
          source: '...',
          tokens: seedTokens({
            description: 'param {string} value value description 0',
          }),
        },
      ],
    })
  );
});
