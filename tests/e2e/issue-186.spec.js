const { parse } = require('../../lib/index.cjs');

test('non-optional property with default value', () => {
  const parsed = parse(`
    /**
     * Some annoying set of bitmasks or something.
     *
     * @property {number} BITMASK_VALUE_A=16 - blah blah
     * @property {number} BITMASK_VALUE_B=32 - the other thing
     */`);

  expect(parsed[0].tags).toMatchObject([
    {
      tag: 'property',
      type: 'number',
      name: 'BITMASK_VALUE_A',
      optional: false,
      default: '16',
      description: '- blah blah',
    },
    {
      tag: 'property',
      type: 'number',
      name: 'BITMASK_VALUE_B',
      optional: false,
      default: '32',
      description: '- the other thing',
    },
  ]);
});
