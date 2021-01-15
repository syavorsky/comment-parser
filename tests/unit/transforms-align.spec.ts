import align from '../../src/transforms/align';
import getParser from '../../src/parser/index';
import getStringifier from '../../src/stringifier/index';

test('multiline', () => {
  const source = `
  /**
   * Description may go
   * over multiple lines followed by @tags
   *
* @some-tag {some-type} some-name description line 1
* @another-tag {another-type} another-name description line 1
      description line 2
      * description line 3
   */`;

  const expected = `
  /**
   * Description may go
   * over multiple lines followed by @tags
   *
   * @some-tag    {some-type}    some-name    description line 1
   * @another-tag {another-type} another-name description line 1
                                              description line 2
   *                                          description line 3
   */`;

  const parsed = getParser()(source);
  const out = getStringifier()(align()(parsed[0]));

  expect(out).toBe(expected.slice(1));
});

test('one-liner', () => {
  const source = `  /** @tag {type} name description */`;
  const parsed = getParser()(source);
  const out = getStringifier()(align()(parsed[0]));

  expect(out).toBe(source);
});

test('same line open', () => {
  const source = `
  /** @tag {type} name description
   */`.slice(1);
  const parsed = getParser()(source);
  const out = getStringifier()(align()(parsed[0]));

  expect(out).toBe(source);
});

test('same line close', () => {
  const source = `
  /** 
   * @tag {type} name description */`.slice(1);
  const parsed = getParser()(source);
  const out = getStringifier()(align()(parsed[0]));

  expect(out).toBe(source);
});

test('spec source referencing', () => {
  const parsed = getParser()(`/** @tag {type} name Description */`);
  const block = align()(parsed[0]);
  expect(block.tags[0].source[0] === block.source[0]).toBe(true);
});

test('block source clonning', () => {
  const parsed = getParser()(`/** @tag {type} name Description */`);
  const block = align()(parsed[0]);
  parsed[0].source[0].tokens.description = 'test';
  expect(block.source[0].tokens.description).toBe('Description ');
});
