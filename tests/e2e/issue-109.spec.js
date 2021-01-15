const { parse, tokenizers } = require('../../lib');

test('default', () => {
  const parsed = parse(`
  /**
   * Typedef with multi-line property type.
   *
   * @typedef {object} MyType
   * @property {function(
   *   number,
   *   {x:string}
   * )} numberEater Method which takes a number.
   */`);

  // console.log(inspect(parsed[0]));

  expect(parsed[0].problems).toEqual([]);
  expect(parsed[0].tags[1].problems).toEqual([]);
  expect(parsed[0].tags[1].type).toEqual('function(number,{x:string})');
});

test('preserve', () => {
  const parsed = parse(
    `
  /**
   * Typedef with multi-line property type.
   *
   * @typedef {object} MyType
   * @property {function(
   *   number,
   *   {x:string}
   * )} numberEater Method which takes a number.
   */`,
    { spacing: 'preserve' }
  );

  // console.log(inspect(parsed[0]));

  expect(parsed[0].problems).toEqual([]);
  expect(parsed[0].tags[1].problems).toEqual([]);
  expect(parsed[0].tags[1].type).toEqual(
    'function(\n  number,\n  {x:string}\n)'
  );
});

test('compact', () => {
  const parsed = parse(
    `
  /**
   * Typedef with multi-line property type.
   *
   * @typedef {object} MyType
   * @property {function(
   *   number,
   *   {x:string}
   * )} numberEater Method which takes a number.
   */`,
    { spacing: 'compact' }
  );

  // console.log(inspect(parsed[0]));

  expect(parsed[0].problems).toEqual([]);
  expect(parsed[0].tags[1].problems).toEqual([]);
  expect(parsed[0].tags[1].type).toEqual('function(number,{x:string})');
});
