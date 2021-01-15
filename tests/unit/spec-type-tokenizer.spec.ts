import { typeTokenizer } from '../../src/parser/spec-parser';
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

test('object notation', () => {
  expect(
    tokenize(
      seedSpec({
        source: [
          {
            number: 1,
            source: '...',
            tokens: seedTokens({
              description: '{{a: 1}} param description',
            }),
          },
        ],
      })
    )
  ).toEqual(
    seedSpec({
      type: '{a: 1}',
      source: [
        {
          number: 1,
          source: '...',
          tokens: seedTokens({
            type: '{{a: 1}}',
            postType: ' ',
            description: 'param description',
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

test('line breaks', () => {
  const spec = seedSpec({
    source: [
      {
        number: 1,
        source: '...',
        tokens: seedTokens({
          description: '{function(',
        }),
      },
      {
        number: 2,
        source: '...',
        tokens: seedTokens({
          description: '  number',
        }),
      },
      {
        number: 3,
        source: '...',
        tokens: seedTokens({
          description: ')} function type',
        }),
      },
      {
        number: 4,
        source: '...',
        tokens: seedTokens(),
      },
      {
        number: 5,
        source: '...',
        tokens: seedTokens({
          end: '*/',
        }),
      },
    ],
  });

  const tokenized = tokenize(spec);
  const expected = seedSpec({
    type: 'function(\n  number\n)',
    source: [
      {
        number: 1,
        source: '...',
        tokens: seedTokens({
          type: '{function(',
        }),
      },
      {
        number: 2,
        source: '...',
        tokens: seedTokens({
          type: '  number',
        }),
      },
      {
        number: 3,
        source: '...',
        tokens: seedTokens({
          type: ')}',
          postType: ' ',
          description: 'function type',
        }),
      },
      {
        number: 4,
        source: '...',
        tokens: seedTokens(),
      },
      {
        number: 5,
        source: '...',
        tokens: seedTokens({
          end: '*/',
        }),
      },
    ],
  });

  expect(tokenized).toEqual(expected);
});
