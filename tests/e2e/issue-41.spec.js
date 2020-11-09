const { default: getParser } = require('../../lib/parser');

test('quoted name', () => {
  const parsed = getParser()(`
  /**
   * @section "Brand Colors" - Here you can find all the brand colors...
   */`);

  expect(parsed).toEqual([
    {
      description: '',
      tags: [
        {
          tag: 'section',
          name: 'Brand Colors',
          type: '',
          optional: false,
          description: '- Here you can find all the brand colors...',
          problems: [],
          source: [
            {
              number: 2,
              source:
                '   * @section "Brand Colors" - Here you can find all the brand colors...',
              tokens: {
                start: '   ',
                delimiter: '*',
                postDelimiter: ' ',
                tag: '@section',
                postTag: ' ',
                name: '"Brand Colors"',
                postName: ' ',
                type: '',
                postType: '',
                description: '- Here you can find all the brand colors...',
                end: '',
              },
            },
            {
              number: 3,
              source: '   */',
              tokens: {
                start: '   ',
                delimiter: '',
                postDelimiter: '',
                tag: '',
                postTag: '',
                name: '',
                postName: '',
                type: '',
                postType: '',
                description: '',
                end: '*/',
              },
            },
          ],
        },
      ],
      source: [
        {
          number: 1,
          source: '  /**',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 2,
          source:
            '   * @section "Brand Colors" - Here you can find all the brand colors...',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '@section',
            postTag: ' ',
            name: '"Brand Colors"',
            postName: ' ',
            type: '',
            postType: '',
            description: '- Here you can find all the brand colors...',
            end: '',
          },
        },
        {
          number: 3,
          source: '   */',
          tokens: {
            start: '   ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

test('optional name', () => {
  const parsed = getParser()(`
  /**
   * @section [Brand Colors] - Here you can find all the brand colors...
   */`);

  expect(parsed).toEqual([
    {
      description: '',
      tags: [
        {
          tag: 'section',
          name: 'Brand Colors',
          type: '',
          optional: true,
          description: '- Here you can find all the brand colors...',
          problems: [],
          source: [
            {
              number: 2,
              source:
                '   * @section [Brand Colors] - Here you can find all the brand colors...',
              tokens: {
                start: '   ',
                delimiter: '*',
                postDelimiter: ' ',
                tag: '@section',
                postTag: ' ',
                name: '[Brand Colors]',
                postName: ' ',
                type: '',
                postType: '',
                description: '- Here you can find all the brand colors...',
                end: '',
              },
            },
            {
              number: 3,
              source: '   */',
              tokens: {
                start: '   ',
                delimiter: '',
                postDelimiter: '',
                tag: '',
                postTag: '',
                name: '',
                postName: '',
                type: '',
                postType: '',
                description: '',
                end: '*/',
              },
            },
          ],
        },
      ],
      source: [
        {
          number: 1,
          source: '  /**',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 2,
          source:
            '   * @section [Brand Colors] - Here you can find all the brand colors...',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '@section',
            postTag: ' ',
            name: '[Brand Colors]',
            postName: ' ',
            type: '',
            postType: '',
            description: '- Here you can find all the brand colors...',
            end: '',
          },
        },
        {
          number: 3,
          source: '   */',
          tokens: {
            start: '   ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

test('inconsistent quotes', () => {
  const parsed = getParser()(`
  /**
   * @section "Brand Colors - Here you can find all the brand colors...
   */`);

  expect(parsed).toEqual([
    {
      description: '',
      tags: [
        {
          tag: 'section',
          name: '"Brand',
          type: '',
          optional: false,
          description: 'Colors - Here you can find all the brand colors...',
          problems: [],
          source: [
            {
              number: 2,
              source:
                '   * @section "Brand Colors - Here you can find all the brand colors...',
              tokens: {
                start: '   ',
                delimiter: '*',
                postDelimiter: ' ',
                tag: '@section',
                postTag: ' ',
                name: '"Brand',
                postName: ' ',
                type: '',
                postType: '',
                description:
                  'Colors - Here you can find all the brand colors...',
                end: '',
              },
            },
            {
              number: 3,
              source: '   */',
              tokens: {
                start: '   ',
                delimiter: '',
                postDelimiter: '',
                tag: '',
                postTag: '',
                name: '',
                postName: '',
                type: '',
                postType: '',
                description: '',
                end: '*/',
              },
            },
          ],
        },
      ],
      source: [
        {
          number: 1,
          source: '  /**',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 2,
          source:
            '   * @section "Brand Colors - Here you can find all the brand colors...',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '@section',
            postTag: ' ',
            name: '"Brand',
            postName: ' ',
            type: '',
            postType: '',
            description: 'Colors - Here you can find all the brand colors...',
            end: '',
          },
        },
        {
          number: 3,
          source: '   */',
          tokens: {
            start: '   ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});
