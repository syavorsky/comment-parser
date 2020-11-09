const { default: getParser } = require('../../lib/parser');
const { default: getStrigifier } = require('../../lib/stringifier');

test('no formatting', () => {
  const source = `
  /**
* @my-tag {my.type} my-name description line 1
      description line 2
    * description line 3
   */`.slice(1);
  const parsed = getParser()(source);
  const out = getStrigifier()(parsed[0]);
  expect(out).toBe(source);
});

test('align', () => {
  const source = `
  /**
* @my-tag {my.type} my-name description line 1
      description line 2
    * description line 3
   */`.slice(1);

  const parsed = getParser()(source);
  const out = getStrigifier({ format: 'align' })(parsed[0]);
  expect(out).toBe(
    `
/**
 * @my-tag {my.type} my-name description line 1
                             description line 2
 *                           description line 3
 */`.slice(1)
  );
});
