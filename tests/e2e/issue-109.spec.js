const { parse, inspect } = require('../../lib');

test('line breaks in {type}', () => {
  const parsed = parse(`
  /**
   * Typedef with multi-line property type.
   *
   * @typedef {object} MyType
   * @property {function(
   *   number
   * )} numberEater Method which takes a number.
   */`);

  // console.log(inspect(parsed[0]));

  expect(parsed[0].problems).toEqual([]);
  expect(parsed[0].tags[1].problems).toEqual([]);
  expect(parsed[0].tags[1].type).toEqual('function(\n  number)');
});
