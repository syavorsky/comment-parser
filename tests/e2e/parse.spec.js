const { default: getParser } = require('../../lib');

test('description only', () => {
  const parsed = getParser()(`
  /**
   * Description
   */`);
  expect(parsed).toEqual([
    {
      description: 'Description',
      tags: [],
      source: [
        {
          number: 1,
          source: '  /**',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 2,
          source: '   * Description',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description',
            end: '',
          },
        },
        {
          number: 3,
          source: '   */',
          tokens: {
            start: '   ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

test('description one-liner', () => {
  const parsed = getParser()(`
  /** Description */
  var a`);
  expect(parsed).toEqual([
    {
      description: 'Description',
      tags: [],
      source: [
        {
          number: 1,
          source: '  /** Description */',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: ' ',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description ',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

test('block closed on same line', () => {
  const parsed = getParser()(`
  /**
   * Description */`);
  expect(parsed).toEqual([
    {
      description: 'Description',
      tags: [],
      source: [
        {
          number: 1,
          source: '  /**',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 2,
          source: '   * Description */',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description ',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

test('no mid stars', () => {
  const parsed = getParser()(`
  /**
     Description
  */`);
  expect(parsed).toEqual([
    {
      description: 'Description',
      tags: [],
      source: [
        {
          number: 1,
          source: '  /**',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 2,
          source: '     Description',
          tokens: {
            start: '     ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description',
            end: '',
          },
        },
        {
          number: 3,
          source: '  */',
          tokens: {
            start: '  ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

test('skip surrounding empty lines while preserving line numbers', () => {
  const parsed = getParser()(`
  /**
   *
   *
   * Description first line
   *
   * Description second line
   *
   */
  var a`);
  expect(parsed).toEqual([
    {
      description: 'Description first line Description second line',
      tags: [],
      source: [
        {
          number: 1,
          source: '  /**',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 2,
          source: '   *',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 3,
          source: '   *',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 4,
          source: '   * Description first line',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description first line',
            end: '',
          },
        },
        {
          number: 5,
          source: '   *',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 6,
          source: '   * Description second line',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description second line',
            end: '',
          },
        },
        {
          number: 7,
          source: '   *',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 8,
          source: '   */',
          tokens: {
            start: '   ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

test('description on the first line', () => {
  const parsed = getParser()(`
  /** Description first line
   *
   * Description second line
   */
  var a`);
  expect(parsed).toEqual([
    {
      description: 'Description first line Description second line',
      tags: [],
      source: [
        {
          number: 1,
          source: '  /** Description first line',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: ' ',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description first line',
            end: '',
          },
        },
        {
          number: 2,
          source: '   *',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 3,
          source: '   * Description second line',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description second line',
            end: '',
          },
        },
        {
          number: 4,
          source: '   */',
          tokens: {
            start: '   ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

test('skip empty blocks', () => {
  const parsed = getParser()(`
  /**
   *
   */
  var a`);
  expect(parsed).toHaveLength(0);
});

test('multiple blocks', () => {
  const parsed = getParser()(`
  /**
   * Description first line
   */
  var a

  /**
   * Description second line
   */
  var b`);

  expect(parsed).toHaveLength(2);

  expect(parsed).toEqual([
    {
      description: 'Description first line',
      tags: [],
      source: [
        {
          number: 1,
          source: '  /**',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 2,
          source: '   * Description first line',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description first line',
            end: '',
          },
        },
        {
          number: 3,
          source: '   */',
          tokens: {
            start: '   ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
    {
      description: 'Description second line',
      tags: [],
      source: [
        {
          number: 6,
          source: '  /**',
          tokens: {
            start: '  ',
            delimiter: '/**',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '',
          },
        },
        {
          number: 7,
          source: '   * Description second line',
          tokens: {
            start: '   ',
            delimiter: '*',
            postDelimiter: ' ',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: 'Description second line',
            end: '',
          },
        },
        {
          number: 8,
          source: '   */',
          tokens: {
            start: '   ',
            delimiter: '',
            postDelimiter: '',
            tag: '',
            postTag: '',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

test('skip `/* */` blocks', () => {
  const parsed = getParser()(`
  /*
   *
   */
  var a`);
  expect(parsed).toHaveLength(0);
});

test('skip `/*** */` blocks', () => {
  const parsed = getParser()(`
  /***
   *
   */
  var a`);
  expect(parsed).toHaveLength(0);
});

test('tag one-liner', () => {
  const parsed = getParser()(`/** @param */`);
  expect(parsed).toEqual([
    {
      description: '',
      tags: [
        {
          tag: 'param',
          name: '',
          type: '',
          optional: false,
          description: '',
          problems: [],
          source: [
            {
              number: 0,
              source: '/** @param */',
              tokens: {
                start: '',
                delimiter: '/**',
                postDelimiter: ' ',
                tag: '@param',
                postTag: ' ',
                name: '',
                postName: '',
                type: '',
                postType: '',
                description: '',
                end: '*/',
              },
            },
          ],
        },
      ],
      source: [
        {
          number: 0,
          source: '/** @param */',
          tokens: {
            start: '',
            delimiter: '/**',
            postDelimiter: ' ',
            tag: '@param',
            postTag: ' ',
            name: '',
            postName: '',
            type: '',
            postType: '',
            description: '',
            end: '*/',
          },
        },
      ],
      problems: [],
    },
  ]);
});

// test.skip('should parse `@tag`', () => {
//   expect(parse(`
//     /**
//      *
//      * @my-tag
//      */
//     var a
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@my-tag',
//       description: '',
//       tags: [{
//         line: 3,
//         tag: 'my-tag',
//         source: '@my-tag',
//         type: '',
//         name: '',
//         optional: false,
//         description: ''
//       }]
//     }])
// })

// test.skip('should parse `@tag {my.type}`', () => {
//   expect(parse(`
//     /**
//      * @my-tag {my.type}
//      */
//     var a
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@my-tag {my.type}',
//       description: '',
//       tags: [{
//         line: 2,
//         tag: 'my-tag',
//         type: 'my.type',
//         name: '',
//         source: '@my-tag {my.type}',
//         optional: false,
//         description: ''
//       }]
//     }])
// })

// test.skip('should parse tag with name only `@tag name`', () => {
//   expect(parse(`
//     /**
//      * @my-tag name
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@my-tag name',
//       tags: [{
//         line: 2,
//         tag: 'my-tag',
//         type: '',
//         name: 'name',
//         source: '@my-tag name',
//         optional: false,
//         description: ''
//       }]
//     }])
// })

// test.skip('should parse tag with type and name `@tag {my.type} name`', () => {
//   expect(parse(`
//     /**
//      * @my-tag {my.type} name
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@my-tag {my.type} name',
//       description: '',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: 'my.type',
//         name: 'name',
//         source: '@my-tag {my.type} name',
//         description: '',
//         optional: false
//       }]
//     }])
// })

// test.skip('should parse tag with type, name and description `@tag {my.type} name description`', () => {
//   expect(parse(`
//     /**
//      * @my-tag {my.type} name description
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@my-tag {my.type} name description',
//       description: '',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: 'my.type',
//         name: 'name',
//         source: '@my-tag {my.type} name description',
//         description: 'description',
//         optional: false
//       }]
//     }])
// })

// test.skip('should parse tag with type, name and description `@tag {my.type} name description with `/**` characters`', () => {
//   expect(parse(`
//     /**
//      * @my-tag {my.type} name description \`/**\`
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@my-tag {my.type} name description `/**`',
//       description: '',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: 'my.type',
//         name: 'name',
//         source: '@my-tag {my.type} name description `/**`',
//         description: 'description `/**`',
//         optional: false
//       }]
//     }])
// })

// test.skip('should parse tag with type, name and description separated by tab `@tag {my.type} name  description`', () => {
//   expect(parse(`
//     /**
//      * @my-tag\t{my.type}\tname\tdescription
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@my-tag\t{my.type}\tname\tdescription',
//       description: '',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: 'my.type',
//         name: 'name',
//         source: '@my-tag\t{my.type}\tname\tdescription',
//         description: 'description',
//         optional: false
//       }]
//     }])
// })

// test.skip('should parse tag with whitespace description and `opts.trim = false`', () => {
//   expect(parse(`
//     /**
//      * @my-tag {my.type} name\t
//      */
//   `, { trim: false }))
//     .to.toEqual([{
//       line: 1,
//       source: '\n@my-tag {my.type} name\t\n',
//       description: '',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: 'my.type',
//         name: 'name',
//         source: '@my-tag {my.type} name\t\n',
//         // Default parser trims regardless of `trim` setting
//         description: '',
//         optional: false
//       }]
//     }])
// })

// test.skip('should parse tag with multiline description', () => {
//   expect(parse(`
//     /**
//      * @my-tag {my.type} name description line 1
//      * description line 2
//      * description line 3
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@my-tag {my.type} name description line 1\ndescription line 2\ndescription line 3',
//       description: '',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: 'my.type',
//         name: 'name',
//         source: '@my-tag {my.type} name description line 1\ndescription line 2\ndescription line 3',
//         description: 'description line 1\ndescription line 2\ndescription line 3',
//         optional: false
//       }]
//     }])
// })

// test.skip('should gracefully fail on syntax errors `@tag [name`', () => {
//   expect(parse(`
//     /**
//      * @my-tag [name
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@my-tag [name',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: '',
//         name: '',
//         description: '',
//         source: '@my-tag [name',
//         optional: false,
//         errors: ['parse_name: Invalid `name`, unpaired brackets']
//       }]
//     }])
// })

// test.skip('should gracefully fail on syntax errors `@tag [name=]`', () => {
//   expect(parse(`
//     /**
//      * @my-tag [name=]
//      */
//   `)).to.toEqual([{
//     line: 1,
//     description: '',
//     source: '@my-tag [name=]',
//     tags: [{
//       tag: 'my-tag',
//       line: 2,
//       type: '',
//       name: 'name',
//       source: '@my-tag [name=]',
//       default: '',
//       description: '',
//       optional: true,
//       errors: ['parse_name: Empty `name`, bad syntax']
//     }]
//   }])
// })

// test.skip('should gracefully fail on syntax errors `@tag [=value]`', () => {
//   expect(parse(`
//     /**
//      * @my-tag [=value]
//      */
//   `)).to.toEqual([{
//     line: 1,
//     description: '',
//     source: '@my-tag [=value]',
//     tags: [{
//       tag: 'my-tag',
//       line: 2,
//       type: '',
//       name: '',
//       source: '@my-tag [=value]',
//       description: '',
//       optional: false,
//       errors: ['parse_name: Invalid `name`, bad syntax']
//     }]
//   }])
// })

// test.skip('should gracefully fail on syntax errors `@tag [=]`', () => {
//   expect(parse(`
//     /**
//      * @my-tag [=]
//      */
//   `)).to.toEqual([{
//     line: 1,
//     description: '',
//     source: '@my-tag [=]',
//     tags: [{
//       tag: 'my-tag',
//       line: 2,
//       type: '',
//       name: '',
//       source: '@my-tag [=]',
//       description: '',
//       optional: false,
//       errors: ['parse_name: Invalid `name`, bad syntax']
//     }]
//   }])
// })

// test.skip('should gracefully fail on syntax errors `@tag [==]`', () => {
//   expect(parse(`
//     /**
//      * @my-tag [==]
//      */
//   `)).to.toEqual([{
//     line: 1,
//     description: '',
//     source: '@my-tag [==]',
//     tags: [{
//       tag: 'my-tag',
//       line: 2,
//       type: '',
//       name: '',
//       source: '@my-tag [==]',
//       description: '',
//       optional: false,
//       errors: ['parse_name: Invalid `name`, bad syntax']
//     }]
//   }])
// })

// test.skip('should parse tag with type and optional name `@tag {my.type} [name]`', () => {
//   expect(parse(`
//     /**
//      * @my-tag {my.type} [name]
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@my-tag {my.type} [name]',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: 'my.type',
//         name: 'name',
//         description: '',
//         source: '@my-tag {my.type} [name]',
//         optional: true
//       }]
//     }])
// })

// test.skip('should tolerate loose tag names', () => {
//   expect(parse(`
//     /**
//        Description text
//        @.tag0 tagname Tag 0 description
//        @-tag1 tagname Tag 1 description
//        @+tag2 tagname Tag 2 description
//     */
//   `))
//     .toEqual([{
//       description: 'Description text',
//       source: 'Description text\n@.tag0 tagname Tag 0 description\n@-tag1 tagname Tag 1 description\n@+tag2 tagname Tag 2 description',
//       line: 1,
//       tags: [{
//         tag: '.tag0',
//         name: 'tagname',
//         optional: false,
//         description: 'Tag 0 description',
//         type: '',
//         line: 3,
//         source: '@.tag0 tagname Tag 0 description'
//       }, {
//         tag: '-tag1',
//         name: 'tagname',
//         optional: false,
//         description: 'Tag 1 description',
//         type: '',
//         line: 4,
//         source: '@-tag1 tagname Tag 1 description'
//       }, {
//         tag: '+tag2',
//         name: 'tagname',
//         optional: false,
//         description: 'Tag 2 description',
//         type: '',
//         line: 5,
//         source: '@+tag2 tagname Tag 2 description'
//       }]
//     }])
// })

// test.skip('should parse tag with optional name containing whitespace `@tag [spaced name]`', () => {
//   expect(parse(`
//     /**
//      * @my-tag [spaced name]
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@my-tag [spaced name]',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: '',
//         name: 'spaced name',
//         description: '',
//         source: '@my-tag [spaced name]',
//         optional: true
//       }]
//     }])
// })

// test.skip('should parse tag with optional name, default value unquoted `@tag [name=value]`', () => {
//   expect(parse(`
//     /**
//      * @my-tag [name=value]
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@my-tag [name=value]',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: '',
//         name: 'name',
//         default: 'value',
//         source: '@my-tag [name=value]',
//         description: '',
//         optional: true
//       }]
//     }])
// })

// test.skip('should parse tag with optional name containing whitespace, default value unquoted containing whitespace, spaced `@tag [ spaced name = spaced value ]`', () => {
//   expect(parse(`
//     /**
//      * @my-tag [ spaced name = spaced value ]
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@my-tag [ spaced name = spaced value ]',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: '',
//         name: 'spaced name',
//         default: 'spaced value',
//         source: '@my-tag [ spaced name = spaced value ]',
//         description: '',
//         optional: true
//       }]
//     }])
// })

// test.skip('should parse tag with optional name, default value quoted `@tag [name="value"]`', () => {
//   expect(parse(`
//     /**
//      * @tag [name="value"]
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@tag [name="value"]',
//       description: '',
//       tags: [{
//         tag: 'tag',
//         line: 2,
//         type: '',
//         name: 'name',
//         source: '@tag [name="value"]',
//         default: '"value"',
//         description: '',
//         optional: true
//       }]
//     }])
// })

// test.skip('should parse tag with optional name, default value quoted containing `=` `@tag [name="="]`', () => {
//   expect(parse(`
//     /**
//      * @tag {t} [name="="]
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@tag {t} [name="="]',
//       description: '',
//       tags: [{
//         tag: 'tag',
//         line: 2,
//         type: 't',
//         name: 'name',
//         source: '@tag {t} [name="="]',
//         default: '"="',
//         optional: true,
//         description: ''
//       }]
//     }])
// })

// test.skip('should keep value as is if quotes are mismatched `@tag [name="value\']`', () => {
//   expect(parse(`
//     /**
//      * @tag [name="value'] desc
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@tag [name="value\'] desc',
//       tags: [{
//         tag: 'tag',
//         line: 2,
//         type: '',
//         name: 'name',
//         source: '@tag [name="value\'] desc',
//         default: '"value\'',
//         description: 'desc',
//         optional: true
//       }]
//     }])
// })

// test.skip('should parse rest names `@tag ...name desc`', () => {
//   expect(parse(`
//     /**
//      * @tag {t} ...name desc
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@tag {t} ...name desc',
//       tags: [{
//         tag: 'tag',
//         line: 2,
//         type: 't',
//         name: '...name',
//         optional: false,
//         source: '@tag {t} ...name desc',
//         description: 'desc'
//       }]
//     }])
// })

// test.skip('should parse optional rest names `@tag [...name] desc`', () => {
//   expect(parse(`
//     /**
//      * @tag {t} [...name] desc
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@tag {t} [...name] desc',
//       tags: [{
//         tag: 'tag',
//         line: 2,
//         type: 't',
//         name: '...name',
//         optional: true,
//         source: '@tag {t} [...name] desc',
//         description: 'desc'
//       }]
//     }])
// })

// test.skip('should parse multiple tags', () => {
//   expect(parse(`
//     /**
//      * Description
//      * @my-tag1
//      * @my-tag2
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: 'Description',
//       source: 'Description\n@my-tag1\n@my-tag2',
//       tags: [{
//         tag: 'my-tag1',
//         line: 3,
//         type: '',
//         name: '',
//         optional: false,
//         source: '@my-tag1',
//         description: ''
//       }, {
//         tag: 'my-tag2',
//         line: 4,
//         type: '',
//         name: '',
//         optional: false,
//         source: '@my-tag2',
//         description: ''
//       }]
//     }])
// })

// test.skip('should parse nested tags', () => {
//   // eslint-disable-next-line no-extend-native
//   Object.prototype.ensureFilteringPrototype = true
//   expect(parse(`
//     /**
//      * Description
//      * @my-tag name
//      * @my-tag name.sub-name
//      * @my-tag name.sub-name.sub-sub-name
//      */
//   `, { dotted_names: true }))
//     .to.toEqual([{
//       line: 1,
//       description: 'Description',
//       source: 'Description\n@my-tag name\n@my-tag name.sub-name\n@my-tag name.sub-name.sub-sub-name',
//       tags: [{
//         tag: 'my-tag',
//         line: 3,
//         type: '',
//         name: 'name',
//         source: '@my-tag name',
//         optional: false,
//         description: '',
//         tags: [{
//           tag: 'my-tag',
//           line: 4,
//           type: '',
//           name: 'sub-name',
//           optional: false,
//           source: '@my-tag name.sub-name',
//           description: '',
//           tags: [{
//             tag: 'my-tag',
//             line: 5,
//             type: '',
//             name: 'sub-sub-name',
//             optional: false,
//             source: '@my-tag name.sub-name.sub-sub-name',
//             description: ''
//           }]
//         }]
//       }]
//     }])
//   // Restore
//   delete Object.prototype.ensureFilteringPrototype
// })

// test.skip('should parse nested tags with missing parent', () => {
//   expect(parse(`
//     /**
//      * Description
//      * @my-tag name.sub-name
//      * @my-tag name.sub-name.sub-sub-name
//      */
//   `, { dotted_names: true }))
//     .to.toEqual([{
//       line: 1,
//       description: 'Description',
//       source: 'Description\n@my-tag name.sub-name\n@my-tag name.sub-name.sub-sub-name',
//       tags: [{
//         tag: 'my-tag',
//         line: 3,
//         type: '',
//         name: 'name',
//         description: '',
//         tags: [{
//           tag: 'my-tag',
//           line: 3,
//           type: '',
//           name: 'sub-name',
//           optional: false,
//           source: '@my-tag name.sub-name',
//           description: '',
//           tags: [{
//             tag: 'my-tag',
//             line: 4,
//             type: '',
//             name: 'sub-sub-name',
//             optional: false,
//             source: '@my-tag name.sub-name.sub-sub-name',
//             description: ''
//           }]
//         }]
//       }]
//     }])
// })

// test.skip('should parse nested tags with missing parent but with matching tag name', () => {
//   expect(parse(`
//     /**
//      * Description
//      * @my-tag
//      * @my-tag name.sub-name
//      * @my-tag name.sub-name.sub-sub-name
//      */
//   `, { dotted_names: true }))
//     .to.toEqual([{
//       line: 1,
//       description: 'Description',
//       source: 'Description\n@my-tag\n@my-tag name.sub-name\n@my-tag name.sub-name.sub-sub-name',
//       tags: [{
//         tag: 'my-tag',
//         line: 3,
//         type: '',
//         name: '',
//         source: '@my-tag',
//         optional: false,
//         description: ''
//       }, {
//         tag: 'my-tag',
//         line: 4,
//         type: '',
//         name: 'name',
//         description: '',
//         tags: [{
//           tag: 'my-tag',
//           line: 4,
//           type: '',
//           name: 'sub-name',
//           optional: false,
//           source: '@my-tag name.sub-name',
//           description: '',
//           tags: [{
//             tag: 'my-tag',
//             line: 5,
//             type: '',
//             name: 'sub-sub-name',
//             optional: false,
//             source: '@my-tag name.sub-name.sub-sub-name',
//             description: ''
//           }]
//         }]
//       }]
//     }])
// })

// test.skip('should parse complex types `@tag {{a: type}} name`', () => {
//   expect(parse(`
//     /**
//      * @my-tag {{a: number}} name
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@my-tag {{a: number}} name',
//       description: '',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: '{a: number}',
//         name: 'name',
//         source: '@my-tag {{a: number}} name',
//         optional: false,
//         description: ''
//       }]
//     }])
// })

// test.skip('should gracefully fail on syntax errors `@tag {{a: type} name`', () => {
//   expect(parse(`
//     /**
//      * @my-tag {{a: number} name
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@my-tag {{a: number} name',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: '',
//         name: '',
//         description: '',
//         source: '@my-tag {{a: number} name',
//         optional: false,
//         errors: ['parse_type: Invalid `{type}`, unpaired curlies']
//       }]
//     }])
// })

// test.skip('should parse $ in description`', () => {
//   expect(parse(`
//     /**
//      * @my-tag {String} name description with $ char
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@my-tag {String} name description with $ char',
//       description: '',
//       tags: [{
//         tag: 'my-tag',
//         line: 2,
//         type: 'String',
//         name: 'name',
//         source: '@my-tag {String} name description with $ char',
//         optional: false,
//         description: 'description with $ char'
//       }]
//     }])
// })

// test.skip('should parse doc block with bound forced to the left', () => {
//   expect(parse(`
//     /**
//  * Description text
//  * @tag tagname Tag description
//  */
//   `))
//     .to.toEqual([{
//       description: 'Description text',
//       source: 'Description text\n@tag tagname Tag description',
//       line: 1,
//       tags: [{
//         tag: 'tag',
//         name: 'tagname',
//         optional: false,
//         description: 'Tag description',
//         type: '',
//         line: 3,
//         source: '@tag tagname Tag description'
//       }]
//     }])
// })

// test.skip('should parse doc block with bound forced to the right', () => {
//   expect(parse(`
//     /**
//          * Description text
//          * @tag tagname Tag description
//          */
//   `))
//     .to.toEqual([{
//       description: 'Description text',
//       source: 'Description text\n@tag tagname Tag description',
//       line: 1,
//       tags: [{
//         tag: 'tag',
//         name: 'tagname',
//         optional: false,
//         description: 'Tag description',
//         type: '',
//         line: 3,
//         source: '@tag tagname Tag description'
//       }]
//     }])
// })

// test.skip('should parse doc block with soft bound', () => {
//   expect(parse(`
//     /**
//  Description text
//          another line
//  @tag tagname Tag description
//  */
//   `))
//     .to.toEqual([{
//       description: 'Description text\nanother line',
//       source: 'Description text\nanother line\n@tag tagname Tag description',
//       line: 1,
//       tags: [{
//         tag: 'tag',
//         name: 'tagname',
//         optional: false,
//         description: 'Tag description',
//         type: '',
//         line: 4,
//         source: '@tag tagname Tag description'
//       }]
//     }])
// })

// test.skip('should parse doc block with soft bound respecting `opts.trim = false`', () => {
//   expect(parse(`
//     /**
//  Description text
//          another line
//  @tag tagname Tag description
//  */
//   `, {
//     trim: false
//   }))
//     .to.toEqual([{
//       description: '\nDescription text\n  another line',
//       source: '\nDescription text\n  another line\n@tag tagname Tag description\n',
//       line: 1,
//       tags: [{
//         tag: 'tag',
//         name: 'tagname',
//         optional: false,
//         description: 'Tag description\n',
//         type: '',
//         line: 4,
//         source: '@tag tagname Tag description\n'
//       }]
//     }])
// })

// test.skip('should parse multiline without star as same line respecting `opts.join = true`', () => {
//   expect(parse(`
//     /**
//      * @tag name
//      * description
//        same line
//      */
//   `, { join: true }))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@tag name\ndescription\nsame line',
//       tags: [{
//         tag: 'tag',
//         line: 2,
//         type: '',
//         name: 'name',
//         description: 'description same line',
//         source: '@tag name\ndescription same line',
//         optional: false
//       }]
//     }])
// })

// test.skip('should parse multiline without star as same line respecting `opts.join = "\\t"`', () => {
//   expect(parse(`
//     /**
//      * @tag name
//      * description
//        same line
//      */
//   `, { join: '\t' }))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '@tag name\ndescription\nsame line',
//       tags: [{
//         tag: 'tag',
//         line: 2,
//         type: '',
//         name: 'name',
//         description: 'description\tsame line',
//         source: '@tag name\ndescription\tsame line',
//         optional: false
//       }]
//     }])
// })

// test.skip('should parse multiline without star as same line with intent respecting `opts.join = 1` and `opts.trim = false`', () => {
//   expect(parse(`
//     /**
//      * @tag name
//      * description
//          intent same line
//      */
//   `, {
//     join: 1,
//     trim: false
//   }))
//     .to.toEqual([{
//       line: 1,
//       description: '',
//       source: '\n@tag name\ndescription\n  intent same line\n',
//       tags: [{
//         tag: 'tag',
//         line: 2,
//         type: '',
//         name: 'name',
//         description: 'description  intent same line\n',
//         source: '@tag name\ndescription  intent same line\n',
//         optional: false
//       }]
//     }])
// })

// test.skip('should parse doc block with star and initial whitespace respecting `opts.trim = false`', () => {
//   expect(parse(`
//     /**
//      * Description text
//      *  @tag tagname Tag description
//      */
//   `, { trim: false }))
//     .to.toEqual([{
//       description: '\nDescription text',
//       source: '\nDescription text\n @tag tagname Tag description\n',
//       line: 1,
//       tags: [{
//         tag: 'tag',
//         name: 'tagname',
//         optional: false,
//         description: 'Tag description\n',
//         type: '',
//         line: 3,
//         source: ' @tag tagname Tag description\n'
//       }]
//     }])
// })

// test.skip('should parse same line closing section (issue #22)', () => {
//   expect(parse(`
//     /**
//      * Start here
//      * Here is more stuff */
//     var a
//   `))
//     .to.toEqual([{
//       description: 'Start here\nHere is more stuff',
//       line: 1,
//       source: 'Start here\nHere is more stuff',
//       tags: []
//     }])
// })

// test.skip('should tolerate inconsistent formatting (issue #29)', () => {
//   expect(parse(`
//     /**
//        * @param {Object} options 配置
//        * @return {Any} obj 组件返回的对象
//        * @example name
//        * var widget = XX.showWidget('searchlist', {
//        *    onComplete: function() {
//        *          todoSomething();
//        *     }
//        * });
//    */
//   `, {
//     join: 1,
//     trim: false
//   })).to.toEqual([{
//     description: '',
//     line: 1,
//     source: "\n@param {Object} options 配置\n@return {Any} obj 组件返回的对象\n@example name\nvar widget = XX.showWidget('searchlist', {\n   onComplete: function() {\n         todoSomething();\n    }\n});\n",
//     tags: [{
//       description: '配置',
//       line: 2,
//       name: 'options',
//       optional: false,
//       source: '@param {Object} options 配置',
//       tag: 'param',
//       type: 'Object'
//     }, {
//       description: '组件返回的对象',
//       line: 3,
//       name: 'obj',
//       optional: false,
//       source: '@return {Any} obj 组件返回的对象',
//       tag: 'return',
//       type: 'Any'
//     }, {
//       description: "var widget = XX.showWidget('searchlist', {\n   onComplete: function() {\n         todoSomething();\n    }\n});\n",
//       line: 4,
//       name: 'name',
//       optional: false,
//       source: "@example name\nvar widget = XX.showWidget('searchlist', {\n   onComplete: function() {\n         todoSomething();\n    }\n});\n",
//       tag: 'example',
//       type: ''
//     }]
//   }])
// })

// test.skip('should keep optional names spaces (issue #41)`', () => {
//   expect(parse(`
//     /**
//      * @section [Brand Colors] Here you can find all the brand colors
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@section [Brand Colors] Here you can find all the brand colors',
//       description: '',
//       tags: [{
//         tag: 'section',
//         line: 2,
//         type: '',
//         name: 'Brand Colors',
//         source: '@section [Brand Colors] Here you can find all the brand colors',
//         optional: true,
//         description: 'Here you can find all the brand colors'
//       }]
//     }])
// })

// test.skip('should keep quotes in description (issue #41)`', () => {
//   expect(parse(`
//     /**
//      * @section "Brand Colors" Here you can find all the brand colors
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@section "Brand Colors" Here you can find all the brand colors',
//       description: '',
//       tags: [{
//         tag: 'section',
//         line: 2,
//         type: '',
//         name: 'Brand Colors',
//         source: '@section "Brand Colors" Here you can find all the brand colors',
//         optional: false,
//         description: 'Here you can find all the brand colors'
//       }]
//     }])
// })

// test.skip('should use only quoted name (issue #41)`', () => {
//   expect(parse(`
//     /**
//      * @section "Brand Colors" Here you can find "all" the brand colors
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@section "Brand Colors" Here you can find "all" the brand colors',
//       description: '',
//       tags: [{
//         tag: 'section',
//         line: 2,
//         type: '',
//         name: 'Brand Colors',
//         source: '@section "Brand Colors" Here you can find "all" the brand colors',
//         optional: false,
//         description: 'Here you can find "all" the brand colors'
//       }]
//     }])
// })

// test.skip('should ignore inconsistent quoted groups (issue #41)`', () => {
//   expect(parse(`
//     /**
//      * @section "Brand Colors Here you can find all the brand colors
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@section "Brand Colors Here you can find all the brand colors',
//       description: '',
//       tags: [{
//         tag: 'section',
//         line: 2,
//         type: '',
//         name: '"Brand',
//         source: '@section "Brand Colors Here you can find all the brand colors',
//         optional: false,
//         description: 'Colors Here you can find all the brand colors'
//       }]
//     }])
// })

// test.skip('should include non-space immediately after asterisk`', () => {
//   expect(parse(`
//     /**
//      * @example
//      *\`\`\`typescript
//      * \`\`\`
//      */
//     function A () {}
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@example\n```typescript\n```',
//       description: '',
//       tags: [{
//         tag: 'example',
//         name: '\n```typescript',
//         optional: false,
//         description: '```',
//         type: '',
//         line: 2,
//         source: '@example\n```typescript\n```'
//       }]
//     }])
// })

// test.skip('should handle fenced description (issue #61)`', () => {
//   expect(parse(`
//     /**
//      * @example "" \`\`\`ts
//     @transient()
//     class Foo { }
//     \`\`\`
//      * @tag name description
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@example "" ```ts\n@transient()\nclass Foo { }\n```\n@tag name description',
//       description: '',
//       tags: [{
//         tag: 'example',
//         name: '',
//         optional: false,
//         description: '```ts\n@transient()\nclass Foo { }\n```',
//         type: '',
//         line: 2,
//         source: '@example "" ```ts\n@transient()\nclass Foo { }\n```'
//       }, {
//         tag: 'tag',
//         name: 'name',
//         optional: false,
//         description: 'description',
//         type: '',
//         line: 6,
//         source: '@tag name description'
//       }]
//     }])
// })

// test.skip('should handle one line fenced description (issue #61)`', () => {
//   expect(parse(`
//     /**
//      * @example "" \`\`\`fenced text\`\`\`
//      * @tag name description
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@example "" ```fenced text```\n@tag name description',
//       description: '',
//       tags: [{
//         tag: 'example',
//         name: '',
//         optional: false,
//         description: '```fenced text```',
//         type: '',
//         line: 2,
//         source: '@example "" ```fenced text```'
//       }, {
//         tag: 'tag',
//         name: 'name',
//         optional: false,
//         description: 'description',
//         type: '',
//         line: 3,
//         source: '@tag name description'
//       }]
//     }])
// })

// test.skip('should handle description with multiple fences (issue #61)`', () => {
//   expect(parse(`
//     /**
//      * @example "" \`\`\`fenced text\`\`\` not fenced text \`\`\`ts
//     @transient()
//     class Foo { }
//     \`\`\`
//      * @tag name description
//      */
//   `))
//     .to.toEqual([{
//       line: 1,
//       source: '@example "" ```fenced text``` not fenced text ```ts\n@transient()\nclass Foo { }\n```\n@tag name description',
//       description: '',
//       tags: [{
//         tag: 'example',
//         name: '',
//         optional: false,
//         description: '```fenced text``` not fenced text ```ts\n@transient()\nclass Foo { }\n```',
//         type: '',
//         line: 2,
//         source: '@example "" ```fenced text``` not fenced text ```ts\n@transient()\nclass Foo { }\n```'
//       }, {
//         tag: 'tag',
//         name: 'name',
//         optional: false,
//         description: 'description',
//         type: '',
//         line: 6,
//         source: '@tag name description'
//       }]
//     }])
// })

// test.skip('should allow custom fence detection logic (issue #61)`', () => {
//   expect(parse(`
//     /**
//      * @example "" ###ts
//     @transient()
//     class Foo { }
//     ###
//      * @tag name description
//      */
//   `, {
//     fence: line => line.indexOf('###') !== -1
//   }))
//     .to.toEqual([{
//       line: 1,
//       source: '@example "" ###ts\n@transient()\nclass Foo { }\n###\n@tag name description',
//       description: '',
//       tags: [{
//         tag: 'example',
//         name: '',
//         optional: false,
//         description: '###ts\n@transient()\nclass Foo { }\n###',
//         type: '',
//         line: 2,
//         source: '@example "" ###ts\n@transient()\nclass Foo { }\n###'
//       }, {
//         tag: 'tag',
//         name: 'name',
//         optional: false,
//         description: 'description',
//         type: '',
//         line: 6,
//         source: '@tag name description'
//       }]
//     }])
// })
// })

// describe.only('getBlock', () => {
// const { getBlockFn } = require('../index')
// const parse = (s, line = 0) => s.spltest.skip('\n').map(getBlockFn(line))
// const nulls = n => Array(n).fill(null)

// test.skip('one-line description', () => {
//   const parsed = parse(`
//   /**
//    * description
//    */
//   `)

//   const expected = [
//     {
//       line: 1,
//       source: '',
//       tokens: { start: '    ', delim: '/**', postdelim: '' }
//     },
//     {
//       line: 2,
//       source: 'description',
//       tokens: { start: '     ', delim: '*', postdelim: ' ' }
//     },
//     {
//       line: 3,
//       source: '',
//       tokens: { start: '     ', end: '*/' }
//     }
//   ]

//   expect(parsed).to.toEqual([...nulls(3), expected, null])
// })

// test.skip('multi-line description', () => {
//   const parsed = parse(`
//   /**
//    * description 0
//    *
//    * description 1
//    *
//    */
//   `)

//   const expected = [
//     {
//       line: 1,
//       source: '',
//       tokens: { start: '    ', delim: '/**', postdelim: '' }
//     },
//     {
//       line: 2,
//       source: 'description 0',
//       tokens: { start: '     ', delim: '*', postdelim: ' ' }
//     },
//     {
//       line: 3,
//       source: '',
//       tokens: { start: '     ', delim: '*', postdelim: '' }
//     },
//     {
//       line: 4,
//       source: 'description 1',
//       tokens: { start: '     ', delim: '*', postdelim: ' ' }
//     },
//     {
//       line: 5,
//       source: '',
//       tokens: { start: '     ', delim: '*', postdelim: '' }
//     },
//     {
//       line: 6,
//       source: '',
//       tokens: { start: '     ', end: '*/' }
//     }
//   ]

//   expect(parsed).to.toEqual([...nulls(6), expected, null])
// })

// test.skip('no delimiter', () => {
//   const parsed = parse(`
//   /**
//    * description 0
//    description 1
//    */
//   `)

//   const expected = [
//     {
//       line: 1,
//       source: '',
//       tokens: { start: '    ', delim: '/**', postdelim: '' }
//     },
//     {
//       line: 2,
//       source: 'description 0',
//       tokens: { start: '     ', delim: '*', postdelim: ' ' }
//     },
//     {
//       line: 3,
//       source: 'description 1',
//       tokens: { start: '     ' }
//     },
//     {
//       line: 4,
//       source: '',
//       tokens: { start: '     ', end: '*/' }
//     }
//   ]

//   expect(parsed).to.toEqual([...nulls(4), expected, null])
// })
