import { Markers, Tokens } from '../../lib/primitives';
import getStringifier from '../../src/stringifier';

const source = [
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
    source: '   * Description may go',
    tokens: {
      start: '   ',
      delimiter: '*',
      postDelimiter: ' ',
      tag: '',
      postTag: '',
      name: '',
      postName: '',
      type: '',
      postType: '',
      description: 'Description may go',
      end: '',
    },
  },
  {
    number: 3,
    source: '   * over multiple lines followed by @tags',
    tokens: {
      start: '   ',
      delimiter: '*',
      postDelimiter: ' ',
      tag: '',
      postTag: '',
      name: '',
      postName: '',
      type: '',
      postType: '',
      description: 'over multiple lines followed by @tags',
      end: '',
    },
  },
  {
    number: 4,
    source: '   *',
    tokens: {
      start: '   ',
      delimiter: '*',
      postDelimiter: ' ',
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
    number: 5,
    source: '* @my-tag {my.type} my-name description line 1',
    tokens: {
      start: '',
      delimiter: '*',
      postDelimiter: ' ',
      tag: '@my-tag',
      postTag: ' ',
      name: 'my-name',
      postName: ' ',
      type: '{my.type}',
      postType: ' ',
      description: 'description line 1',
      end: '',
    },
  },
  {
    number: 6,
    source: '      description line 2',
    tokens: {
      start: '      ',
      delimiter: '',
      postDelimiter: '',
      tag: '',
      postTag: '',
      name: '',
      postName: '',
      type: '',
      postType: '',
      description: 'description line 2',
      end: '',
    },
  },
  {
    number: 7,
    source: '    * description line 3',
    tokens: {
      start: '    ',
      delimiter: '*',
      postDelimiter: ' ',
      tag: '',
      postTag: '',
      name: '',
      postName: '',
      type: '',
      postType: '',
      description: 'description line 3',
      end: '',
    },
  },
  {
    number: 8,
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
];

const block = {
  description: '',
  tags: [],
  source,
  problems: [],
};

test('default', () => {
  const s = getStringifier()(block);
  const expected = `
  /**
   * Description may go
   * over multiple lines followed by @tags
   * 
* @my-tag {my.type} my-name description line 1
      description line 2
    * description line 3
   */`;
  expect(s).toBe(expected.slice(1));
});

test('none', () => {
  const s = getStringifier({ format: 'none' })(block);
  const expected = `
  /**
   * Description may go
   * over multiple lines followed by @tags
   * 
* @my-tag {my.type} my-name description line 1
      description line 2
    * description line 3
   */`;
  expect(s).toBe(expected.slice(1));
});

test('custom', () => {
  function format(t: Tokens): string[] {
    return [
      t.start +
        t.delimiter +
        t.postDelimiter +
        t.tag +
        t.postTag +
        t.type +
        t.postType +
        t.name +
        t.postName +
        (t.description === '' ? '' : '...') +
        t.end,
    ];
  }

  const s = getStringifier({ format })(block);
  const expected = `
  /**
   * ...
   * ...
   * 
* @my-tag {my.type} my-name ...
      ...
    * ...
   */`;
  expect(s).toBe(expected.slice(1));
});

test('align', () => {
  const s = getStringifier({ format: 'align' })(block);
  const expected = `
  /**
   * Description may go
   * over multiple lines followed by @tags
   *
   * @my-tag {my.type} my-name description line 1
                               description line 2
   *                           description line 3
   */`;
  expect(s).toBe(expected.slice(1));
});

test('align - one-liner', () => {
  const oneliner = {
    ...block,
    source: [
      {
        number: 0,
        source: '  /** @tag {type} name description */',
        tokens: {
          start: '  ',
          delimiter: '/**',
          postDelimiter: ' ',
          tag: '@tag',
          postTag: ' ',
          name: 'name',
          postName: ' ',
          type: '{type}',
          postType: ' ',
          description: 'description ',
          end: '*/',
        },
      },
    ],
  };
  const s = getStringifier({ format: 'align' })(oneliner);
  expect(s).toBe('  /** @tag {type} name description */');
});

test('align - same line open', () => {
  const source = {
    ...block,
    source: [
      {
        number: 0,
        source: '  /** @tag {type} name description',
        tokens: {
          start: '  ',
          delimiter: '/**',
          postDelimiter: ' ',
          tag: '@tag',
          postTag: ' ',
          name: 'name',
          postName: ' ',
          type: '{type}',
          postType: ' ',
          description: 'description',
          end: '',
        },
      },
      {
        number: 1,
        source: '   ',
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
  };
  const s = getStringifier({ format: 'align' })(source);
  expect(s).toBe('  /** @tag {type} name description\n   */');
});

test('align - same line close', () => {
  const source = {
    ...block,
    source: [
      {
        number: 0,
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
        number: 0,
        source: '  * @tag {type} name description */',
        tokens: {
          start: '  ',
          delimiter: '*',
          postDelimiter: ' ',
          tag: '@tag',
          postTag: ' ',
          name: 'name',
          postName: ' ',
          type: '{type}',
          postType: ' ',
          description: 'description ',
          end: '*/',
        },
      },
    ],
  };
  const s = getStringifier({ format: 'align' })(source);
  expect(s).toBe('  /**\n   * @tag {type} name description */');
});
