const { parse, stringify } = require('../../lib/');

test('no formatting', () => {
  const source = `
  /**
* @my-tag {my.type} my-name description line 1
      description line 2
    * description line 3
   */`.slice(1);
  const parsed = parse(source);
  const out = stringify(parsed[0]);
  expect(out).toBe(source);
});

test('align', () => {
  const source = `
  /**
   * Description may go
   * over multiple lines followed by @tags
   * 
* @my-tag {my.type} my-name description line 1
      description line 2
    * description line 3
   */`.slice(1);

  const parsed = parse(source);
  const out = stringify(parsed[0], { format: 'align' });
  expect(out).toBe(
    `
  /**
   * Description may go
   * over multiple lines followed by @tags
   *
   * @my-tag {my.type} my-name description line 1
                               description line 2
   *                           description line 3
   */`.slice(1)
  );
});
