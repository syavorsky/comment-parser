const { parse, inspect } = require('../../lib');

const source = `
  /**
   * Typedef with multi-line property type.
   *
   * @typedef {object} MyType
   * @property {function(
   *   number,
   *   {x:string}
   * )} numberEater Method
   *    which takes a number.
   */`;

test('default', () => {
  const parsed = parse(source);
  // console.log(inspect(parsed[0]));
  expect(parsed[0].problems).toEqual([]);
  expect(parsed[0].tags[1].problems).toEqual([]);
  expect(parsed[0].tags[1].type).toEqual('function(number,{x:string})');
});

test('preserve', () => {
  const parsed = parse(source, { spacing: 'preserve' });
  // console.log(inspect(parsed[0]));
  expect(parsed[0].problems).toEqual([]);
  expect(parsed[0].tags[1].problems).toEqual([]);
  expect(parsed[0].tags[1].type).toEqual(
    'function(\n  number,\n  {x:string}\n)'
  );
  expect(parsed[0].tags[1].description).toEqual(
    'numberEater Method\n   which takes a number.'
  );
});

test('compact', () => {
  const parsed = parse(source, { spacing: 'compact' });
  // console.log(inspect(parsed[0]));
  expect(parsed[0].problems).toEqual([]);
  expect(parsed[0].tags[1].problems).toEqual([]);
  expect(parsed[0].tags[1].type).toEqual('function(number,{x:string})');
  expect(parsed[0].tags[1].description).toEqual(
    'numberEater Method which takes a number.'
  );
});
