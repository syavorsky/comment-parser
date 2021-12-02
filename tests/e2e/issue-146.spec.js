const {
  parse,
  inspect,
  stringify,
  transforms: { align },
} = require('../../lib/index.cjs');

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
  lineEnd: '',
};

test('dedent', () => {
  const parsed = parse(
    `
    /**
     * @fires {CustomEvent<{ component: HTMLElement }>} copied
     *        Fires when the current url is successfully copied the user's system clipboard.
     *
     *        \`\`\`js
     *        detail: {
     *          url: string
     *        }
     *        \`\`\`
     *
     */
    `,
    { spacing: 'dedent' }
  );

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
      source: '     * @fires {CustomEvent<{ component: HTMLElement }>} copied',
      tokens: {
        ...tokens,
        start: '     ',
        delimiter: '*',
        postDelimiter: ' ',
        description: '',
        postTag: ' ',
        postType: ' ',
        name: 'copied',
        tag: '@fires',
        type: '{CustomEvent<{ component: HTMLElement }>}',
        lineEnd: '',
      },
    },
    {
      number: 3,
      source:
        "     *        Fires when the current url is successfully copied the user's system clipboard.",
      tokens: {
        delimiter: '*',
        description:
          "Fires when the current url is successfully copied the user's system clipboard.",
        end: '',
        lineEnd: '',
        name: '',
        postDelimiter: '        ',
        postName: '',
        postTag: '',
        postType: '',
        start: '     ',
        tag: '',
        type: '',
      },
    },
    {
      number: 4,
      source: '     *',
      tokens: {
        delimiter: '*',
        description: '',
        end: '',
        lineEnd: '',
        name: '',
        postDelimiter: '',
        postName: '',
        postTag: '',
        postType: '',
        start: '     ',
        tag: '',
        type: '',
      },
    },

    {
      number: 5,
      source: '     *        ```js',
      tokens: {
        delimiter: '*',
        description: '```js',
        end: '',
        lineEnd: '',
        name: '',
        postDelimiter: '        ',
        postName: '',
        postTag: '',
        postType: '',
        start: '     ',
        tag: '',
        type: '',
      },
    },
    {
      number: 6,
      source: '     *        detail: {',
      tokens: {
        delimiter: '*',
        description: 'detail: {',
        end: '',
        lineEnd: '',
        name: '',
        postDelimiter: '        ',
        postName: '',
        postTag: '',
        postType: '',
        start: '     ',
        tag: '',
        type: '',
      },
    },
    {
      number: 7,
      source: '     *          url: string',
      tokens: {
        delimiter: '*',
        description: 'url: string',
        end: '',
        lineEnd: '',
        name: '',
        postDelimiter: '          ',
        postName: '',
        postTag: '',
        postType: '',
        start: '     ',
        tag: '',
        type: '',
      },
    },
    {
      number: 8,
      source: '     *        }',
      tokens: {
        delimiter: '*',
        description: '}',
        end: '',
        lineEnd: '',
        name: '',
        postDelimiter: '        ',
        postName: '',
        postTag: '',
        postType: '',
        start: '     ',
        tag: '',
        type: '',
      },
    },
    {
      number: 9,
      source: '     *        ```',
      tokens: {
        delimiter: '*',
        description: '```',
        end: '',
        lineEnd: '',
        name: '',
        postDelimiter: '        ',
        postName: '',
        postTag: '',
        postType: '',
        start: '     ',
        tag: '',
        type: '',
      },
    },
    {
      number: 10,
      source: '     *',
      tokens: {
        delimiter: '*',
        description: '',
        end: '',
        lineEnd: '',
        name: '',
        postDelimiter: '',
        postName: '',
        postTag: '',
        postType: '',
        start: '     ',
        tag: '',
        type: '',
      },
    },
    {
      number: 11,
      source: '     */',
      tokens: {
        delimiter: '',
        description: '',
        end: '*/',
        lineEnd: '',
        name: '',
        postDelimiter: '',
        postName: '',
        postTag: '',
        postType: '',
        start: '     ',
        tag: '',
        type: '',
      },
    },
  ];

  expect(parsed[0]).toMatchObject({
    description: '',
    problems: [],
    source,
    tags: [
      {
        name: 'copied',
        tag: 'fires',
        type: 'CustomEvent<{ component: HTMLElement }>',
        optional: false,
        description: `Fires when the current url is successfully copied the user's system clipboard.

\`\`\`js
detail: {
  url: string
}
\`\`\``,
      },
    ],
  });
});
