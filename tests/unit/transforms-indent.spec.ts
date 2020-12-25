import indent from '../../src/transforms/indent';
import getParser from '../../src/parser/index';
import getStringifier from '../../src/stringifier/index';

test('push', () => {
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

test('pull', () => {
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

test('force pull', () => {
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
  const indented = indent(0)(parsed[0]);
  const out = getStringifier()(indented);
  expect(out).toBe(expected.slice(1));
});

test('no source clonning', () => {
  const parsed = getParser()(`
  /**
   * Description may go 
   * over few lines followed by @tags
   * @param {string} name name parameter
   *
   * @param {any} value value of any type
   */`);
  const block = indent(0)(parsed[0]);
  expect(block.tags[0].source[0] === block.source[3]).toBe(true);
});
