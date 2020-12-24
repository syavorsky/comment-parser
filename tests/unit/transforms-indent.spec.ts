import indent from '../../src/transforms/indent';
import getParser from '../../src/parser/index';
import getStringifier from '../../src/stringifier/index';

test('indent - push', () => {
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
        * description line 3
     */`;

  const parsed = getParser()(source);
  const out = getStringifier()(indent(4)(parsed[0]));
  expect(out).toBe(expected.slice(1));
});

test('indent - pull', () => {
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
      * description line 3
   */`;

  const parsed = getParser()(source);
  const out = getStringifier()(indent(2)(parsed[0]));
  expect(out).toBe(expected.slice(1));
});

test('indent - force pull', () => {
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
    * description line 3
 */`;

  const parsed = getParser()(source);
  const out = getStringifier()(indent(0)(parsed[0]));
  expect(out).toBe(expected.slice(1));
});
