const { parse, inspect } = require('../../lib/index.cjs');

const tokens = {
  start: '',
  delimiter: '',
  postDelimiter: '',
  tag: '',
  postTag: '',
  type: '',
  postType: '',
  name: '',
  postName: '',
  description: '',
  end: '',
};

test('carriage returns', () => {
  const parsed = parse(`
    /**
     * description\r
     * @param0 {param-type}\r
     * @param1 {param-type} paramName param description\r
     */`);

  const source = [
    {
      number: 1,
      source: '    /**',
      tokens: {
        ...tokens,
        start: '    ',
        delimiter: '/**',
      },
    },
    {
      number: 2,
      source: '     * description\r',
      tokens: {
        ...tokens,
        start: '     ',
        delimiter: '*',
        postDelimiter: ' ',
        description: 'description\r',
      },
    },
    {
      number: 3,
      source: '     * @param0 {param-type}\r',
      tokens: {
        ...tokens,
        start: '     ',
        delimiter: '*',
        postDelimiter: ' ',
        tag: '@param0',
        postTag: ' ',
        type: '{param-type}',
        postType: '\r',
      },
    },
    {
      number: 4,
      source: '     * @param1 {param-type} paramName param description\r',
      tokens: {
        ...tokens,
        start: '     ',
        delimiter: '*',
        postDelimiter: ' ',
        tag: '@param1',
        postTag: ' ',
        type: '{param-type}',
        postType: ' ',
        name: 'paramName',
        postName: ' ',
        description: 'param description\r',
      },
    },
    {
      number: 5,
      source: '     */',
      tokens: {
        ...tokens,
        start: '     ',
        end: '*/',
      },
    },
  ];

  expect(parsed[0]).toMatchObject({
    description: 'description',
    problems: [],
    source,
    tags: [
      {
        tag: 'param0',
        type: 'param-type',
        name: '',
        optional: false,
        description: '',
        source: [source[2]],
      },
      {
        tag: 'param1',
        type: 'param-type',
        name: 'paramName',
        optional: false,
        description: 'param description',
        source: [source[3], source[4]],
      },
    ],
  });
});
