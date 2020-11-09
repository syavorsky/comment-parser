import { Markers, Tokens } from '../../lib/types';
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
    number: 3,
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
    number: 4,
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
    number: 5,
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
  tags: [
    {
      tag: 'my-tag',
      name: 'my-name',
      type: 'my.type',
      optional: false,
      description: 'description line 1 description line 2 description line 3',
      problems: [],
      source: source.slice(1),
    },
  ],
  source,
  problems: [],
};

test('default', () => {
  const s = getStringifier()(block);
  const expected = `
  /**
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
* @my-tag {my.type} my-name description line 1
      description line 2
    * description line 3
   */`;
  expect(s).toBe(expected.slice(1));
});

test('align', () => {
  const s = getStringifier({ format: 'align' })(block);
  const expected = `
/**
 * @my-tag {my.type} my-name description line 1
                             description line 2
 *                           description line 3
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
* @my-tag {my.type} my-name ...
      ...
    * ...
   */`;
  expect(s).toBe(expected.slice(1));
});
