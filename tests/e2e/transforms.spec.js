const { parse, stringify } = require('../../lib/');
const { indent } = require('../../lib/transforms');

test('indent - push/align', () => {
  const source = `
  /**
   * Description may go
   * over multiple lines followed by @tags
   * 
* @my-tag {my.type} my-name description line 1
      description line 2
      * description line 3
   */`;

  const expected = `
    /**
     * Description may go
     * over multiple lines followed by @tags
     *
     * @my-tag {my.type} my-name description line 1
                                 description line 2
     *                           description line 3
     */`;

  const parsed = parse(source);
  const out = stringify(indent(4)(parsed[0]), { format: 'align' });
  expect(out).toBe(expected.slice(1));
});
