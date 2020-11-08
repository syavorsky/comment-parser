import { typeTokenizer } from '../../src/spec-parser';
import { seedTokens, seedSpec } from '../../src/util';

const tokenize = typeTokenizer();

test('ok', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 1,
            source: '...',
            tokens: seedTokens({
              description: '{string} param param description 0',
            }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      type: 'string',
      source: [
        {
          number: 1,
          source: '...',
          tokens: seedTokens({
            type: '{string}',
            postType: ' ',
            description: 'param param description 0',
          }),
        },
      ],
    })
  );
});

test('inconsistent curlies', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 1,
            source: '...',
            tokens: seedTokens({
              description: '{string param param description 0',
            }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      problems: [
        {
          code: 'spec:type:unpaired-curlies',
          line: 1,
          message: 'unpaired curlies',
          critical: true,
        },
      ],
      source: [
        {
          number: 1,
          source: '...',
          tokens: seedTokens({
            description: '{string param param description 0',
          }),
        },
      ],
    })
  );
});

test('omit', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 1,
            source: '...',
            tokens: seedTokens({
              description: 'string param param description 0',
            }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      source: [
        {
          number: 1,
          source: '...',
          tokens: seedTokens({
            description: 'string param param description 0',
          }),
        },
      ],
    })
  );
});
