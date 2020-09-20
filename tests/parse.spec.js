/* eslint no-unused-vars:off */

'use strict'
const { expect } = require('chai')
const parse = require('./parse')

describe('Comment string parsing', function () {
  it('should parse doc block with description', function () {
    expect(parse(function () {
      /**
       * Description
       */
    }))
      .to.eql([{
        description: 'Description',
        source: 'Description',
        line: 1,
        tags: []
      }])
  })

  it('should parse doc block with no mid stars', function () {
    expect(parse(function () {
      /**
         Description
       */
    }))
      .to.eql([{
        description: 'Description',
        source: 'Description',
        line: 1,
        tags: []
      }])
  })

  it('should skip surrounding empty lines while preserving line numbers', function () {
    expect(parse(function () {
      /**
       *
       *
       * Description first line
       *
       * Description second line
       *
       */
      var a
    }))
      .eql([{
        description: 'Description first line\n\nDescription second line',
        source: 'Description first line\n\nDescription second line',
        line: 1,
        tags: []
      }])
  })

  it('should accept a description on the first line', function () {
    expect(parse(function () {
      /** Description first line
       *
       * Description second line
       */
      var a
    }))
      .eql([{
        description: 'Description first line\n\nDescription second line',
        source: 'Description first line\n\nDescription second line',
        line: 1,
        tags: []
      }])
  })

  it('should parse not starred middle lines with `opts.trim = true`', function () {
    expect(parse(function () {
      /**
         Description text
         @tag tagname Tag description
      */
    }, {
      trim: true
    }))
      .eql([{
        description: 'Description text',
        source: 'Description text\n@tag tagname Tag description',
        line: 1,
        tags: [{
          tag: 'tag',
          name: 'tagname',
          optional: false,
          description: 'Tag description',
          type: '',
          line: 3,
          source: '@tag tagname Tag description',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 21,
              partLength: 7
            },
            description: {
              posStart: 22,
              posEnd: 37,
              partLength: 15
            }
          }
        }]
      }])
  })

  it('should parse not starred middle lines with `opts.trim = false`', function () {
    expect(parse(function () {
      /**
         Description text
         @tag tagname Tag description
      */
    }, {
      trim: false
    }))
      .eql([{
        description: '\nDescription text',
        source: '\nDescription text\n@tag tagname Tag description\n',
        line: 1,
        tags: [{
          tag: 'tag',
          name: 'tagname',
          optional: false,
          description: 'Tag description\n',
          type: '',
          line: 3,
          source: '@tag tagname Tag description\n',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 21,
              partLength: 7
            },
            description: {
              posStart: 22,
              posEnd: 38,
              partLength: 16
            }
          }
        }]
      }])
  })

  it('should accept comment close on a non-empty', function () {
    expect(parse(function () {
      /**
       * Description first line
       *
       * Description second line */
      var a
    }))
      .eql([{
        description: 'Description first line\n\nDescription second line',
        source: 'Description first line\n\nDescription second line',
        line: 1,
        tags: []
      }])
  })

  it('should skip empty blocks', function () {
    expect(parse(function () {
      /**
       *
       */
      var a
    }).length)
      .to.eq(0)
  })

  it('should parse multiple doc blocks', function () {
    const p = parse(function () {
      /**
       * Description first line
       */
      var a

      /**
       * Description second line
       */
      var b
    })

    expect(p.length)
      .to.eq(2)

    expect(p[0])
      .to.eql({
        description: 'Description first line',
        source: 'Description first line',
        line: 1,
        tags: []
      })

    expect(p[1])
      .to.eql({
        description: 'Description second line',
        source: 'Description second line',
        line: 6,
        tags: []
      })
  })

  it('should parse one line block', function () {
    expect(parse(function () {
      /** Description */
      var a
    }))
      .to.eql([{
        description: 'Description',
        source: 'Description',
        line: 1,
        tags: []
      }])
  })

  it('should skip `/* */` comments', function () {
    expect(parse(function () {
      /*
       *
       */
      var a
    }).length)
      .to.eq(0)
  })

  it('should skip `/*** */` comments', function () {
    expect(parse(function () {
      /***
       *
       */
      var a
    }).length)
      .to.eq(0)
  })

  it('should preserve empty lines and indentation with `opts.trim = false`', function () {
    expect(parse(function () {
      /**
       *
       *
       *   Description first line
       *     second line
       *
       *       third line
       */
      var a
    }, {
      trim: false
    }))
      .eql([{
        description: '\n\n\n  Description first line\n    second line\n\n      third line\n',
        source: '\n\n\n  Description first line\n    second line\n\n      third line\n',
        line: 1,
        tags: []
      }])
  })

  it('should parse one line block with tag', function () {
    expect(parse(function () {
      /** @tag */
      var a
    }))
      .to.eql([{
        description: '',
        line: 1,
        source: '@tag',
        tags: [{
          tag: 'tag',
          type: '',
          name: '',
          description: '',
          line: 1,
          optional: false,
          source: '@tag',
          positions: {
            tag: {
              posStart: 10,
              posEnd: 14,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 14,
              partLength: 0
            }
          }
        }]
      }])
  })

  it('should parse `@tag`', function () {
    expect(parse(function () {
      /**
       *
       * @my-tag
       */
      var a
    }))
      .to.eql([{
        line: 1,
        source: '@my-tag',
        description: '',
        tags: [{
          line: 3,
          tag: 'my-tag',
          source: '@my-tag',
          type: '',
          name: '',
          optional: false,
          description: '',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            name: {
              posStart: 16,
              posEnd: 16,
              partLength: 0
            }
          }
        }]
      }])
  })

  it('should parse `@tag {my.type}`', function () {
    expect(parse(function () {
      /**
       * @my-tag {my.type}
       */
      var a
    }))
      .to.eql([{
        line: 1,
        source: '@my-tag {my.type}',
        description: '',
        tags: [{
          line: 2,
          tag: 'my-tag',
          type: 'my.type',
          name: '',
          source: '@my-tag {my.type}',
          optional: false,
          description: '',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 26,
              partLength: 9
            },
            name: {
              posStart: 26,
              posEnd: 26,
              partLength: 0
            }
          }
        }]
      }])
  })

  it('should parse tag with name only `@tag name`', function () {
    expect(parse(function () {
      /**
       * @my-tag name
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@my-tag name',
        tags: [{
          line: 2,
          tag: 'my-tag',
          type: '',
          name: 'name',
          source: '@my-tag name',
          optional: false,
          description: '',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            name: {
              posStart: 17,
              posEnd: 21,
              partLength: 4
            }
          }
        }]
      }])
  })

  it('should parse tag with type and name `@tag {my.type} name`', function () {
    expect(parse(function () {
      /**
       * @my-tag {my.type} name
       */
    }))
      .to.eql([{
        line: 1,
        source: '@my-tag {my.type} name',
        description: '',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: 'my.type',
          name: 'name',
          source: '@my-tag {my.type} name',
          description: '',
          optional: false,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 26,
              partLength: 9
            },
            name: {
              posStart: 27,
              posEnd: 31,
              partLength: 4
            }
          }
        }]
      }])
  })

  it('should parse tag with type, name and description `@tag {my.type} name description`', function () {
    expect(parse(function () {
      /**
       * @my-tag {my.type} name description
       */
    }))
      .to.eql([{
        line: 1,
        source: '@my-tag {my.type} name description',
        description: '',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: 'my.type',
          name: 'name',
          source: '@my-tag {my.type} name description',
          description: 'description',
          optional: false,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 26,
              partLength: 9
            },
            name: {
              posStart: 27,
              posEnd: 31,
              partLength: 4
            },
            description: {
              posStart: 32,
              posEnd: 43,
              partLength: 11
            }
          }
        }]
      }])
  })

  it('should parse tag with type, name and description `@tag {my.type} name description with `/**` characters`', function () {
    expect(parse(function () {
      /**
       * @my-tag {my.type} name description `/**`
       */
    }))
      .to.eql([{
        line: 1,
        source: '@my-tag {my.type} name description `/**`',
        description: '',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: 'my.type',
          name: 'name',
          source: '@my-tag {my.type} name description `/**`',
          description: 'description `/**`',
          optional: false,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 26,
              partLength: 9
            },
            name: {
              posStart: 27,
              posEnd: 31,
              partLength: 4
            },
            description: {
              posStart: 32,
              posEnd: 49,
              partLength: 17
            }
          }
        }]
      }])
  })

  it('should parse tag with type, name and description separated by tab `@tag {my.type} name  description`', function () {
    expect(parse(
      /* eslint-disable no-tabs */
      function () {
      /**
       * @my-tag	{my.type}	name	description
       */
      }
      /* eslint-enable no-tabs */
    ))
      .to.eql([{
        line: 1,
        source: '@my-tag\t{my.type}\tname\tdescription',
        description: '',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: 'my.type',
          name: 'name',
          source: '@my-tag\t{my.type}\tname\tdescription',
          description: 'description',
          optional: false,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 26,
              partLength: 9
            },
            name: {
              posStart: 27,
              posEnd: 31,
              partLength: 4
            },
            description: {
              posStart: 32,
              posEnd: 43,
              partLength: 11
            }
          }
        }]
      }])
  })

  it('should parse tag with whitespace description and `opts.trim = false`', function () {
    expect(parse(`
      /**
       * @my-tag {my.type} name\t
       */
    `, { trim: false }))
      .to.eql([{
        line: 1,
        source: '\n@my-tag {my.type} name\t\n',
        description: '',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: 'my.type',
          name: 'name',
          source: '@my-tag {my.type} name\t\n',
          // Default parser trims regardless of `trim` setting
          description: '',
          optional: false,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 26,
              partLength: 9
            },
            name: {
              posStart: 27,
              posEnd: 31,
              partLength: 4
            },
            description: {
              posStart: 32,
              posEnd: 32,
              partLength: 0
            }
          }
        }]
      }])
  })

  it('should parse tag with multiline description', function () {
    expect(parse(function () {
      /**
       * @my-tag {my.type} name description line 1
       *                   description line 2
       *                   description line 3
       */
    }))
      .to.eql([{
        line: 1,
        source: '@my-tag {my.type} name description line 1\ndescription line 2\ndescription line 3',
        description: '',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: 'my.type',
          name: 'name',
          source: '@my-tag {my.type} name description line 1\ndescription line 2\ndescription line 3',
          description: 'description line 1\ndescription line 2\ndescription line 3',
          optional: false,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 26,
              partLength: 9
            },
            name: {
              posStart: 27,
              posEnd: 31,
              partLength: 4
            },
            description: {
              posStart: 32,
              posEnd: 88,
              partLength: 56
            }
          }
        }]
      }])
  })

  it('should gracefully fail on syntax errors `@tag [name`', function () {
    expect(parse(function () {
      /**
       * @my-tag [name
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@my-tag [name',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: '',
          name: '',
          description: '',
          source: '@my-tag [name',
          optional: false,
          errors: ['parse_name: Invalid `name`, unpaired brackets'],
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            }
          }
        }]
      }])
  })

  it('should gracefully fail on syntax errors `@tag [name=]`', function () {
    expect(parse(function () {
      /**
       * @my-tag [name=]
       */
    })).to.eql([{
      line: 1,
      description: '',
      source: '@my-tag [name=]',
      tags: [{
        tag: 'my-tag',
        line: 2,
        type: '',
        name: 'name',
        source: '@my-tag [name=]',
        default: '',
        description: '',
        optional: true,
        errors: ['parse_name: Empty `name`, bad syntax'],
        positions: {
          tag: {
            posStart: 9,
            posEnd: 16,
            partLength: 7
          },
          name: {
            posStart: 17,
            posEnd: 24,
            partLength: 7
          }
        }
      }]
    }])
  })

  it('should gracefully fail on syntax errors `@tag [=value]`', function () {
    expect(parse(function () {
      /**
       * @my-tag [=value]
       */
    })).to.eql([{
      line: 1,
      description: '',
      source: '@my-tag [=value]',
      tags: [{
        tag: 'my-tag',
        line: 2,
        type: '',
        name: '',
        source: '@my-tag [=value]',
        description: '',
        optional: false,
        errors: ['parse_name: Invalid `name`, bad syntax'],
        positions: {
          tag: {
            posStart: 9,
            posEnd: 16,
            partLength: 7
          }
        }
      }]
    }])
  })

  it('should gracefully fail on syntax errors `@tag [=]`', function () {
    expect(parse(function () {
      /**
       * @my-tag [=]
       */
    })).to.eql([{
      line: 1,
      description: '',
      source: '@my-tag [=]',
      tags: [{
        tag: 'my-tag',
        line: 2,
        type: '',
        name: '',
        source: '@my-tag [=]',
        description: '',
        optional: false,
        errors: ['parse_name: Invalid `name`, bad syntax'],
        positions: {
          tag: {
            posStart: 9,
            posEnd: 16,
            partLength: 7
          }
        }
      }]
    }])
  })

  it('should gracefully fail on syntax errors `@tag [==]`', function () {
    expect(parse(function () {
      /**
       * @my-tag [==]
       */
    })).to.eql([{
      line: 1,
      description: '',
      source: '@my-tag [==]',
      tags: [{
        tag: 'my-tag',
        line: 2,
        type: '',
        name: '',
        source: '@my-tag [==]',
        description: '',
        optional: false,
        errors: ['parse_name: Invalid `name`, bad syntax'],
        positions: {
          tag: {
            posStart: 9,
            posEnd: 16,
            partLength: 7
          }
        }
      }]
    }])
  })

  it('should parse tag with type and optional name `@tag {my.type} [name]`', function () {
    expect(parse(function () {
      /**
       * @my-tag {my.type} [name]
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@my-tag {my.type} [name]',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: 'my.type',
          name: 'name',
          description: '',
          source: '@my-tag {my.type} [name]',
          optional: true,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 26,
              partLength: 9
            },
            name: {
              posStart: 27,
              posEnd: 33,
              partLength: 6
            }
          }
        }]
      }])
  })

  it('should tolerate loose tag names', function () {
    expect(parse(function () {
      /**
         Description text
         @.tag0 tagname Tag 0 description
         @-tag1 tagname Tag 1 description
         @+tag2 tagname Tag 2 description
      */
    }))
      .eql([{
        description: 'Description text',
        source: 'Description text\n@.tag0 tagname Tag 0 description\n@-tag1 tagname Tag 1 description\n@+tag2 tagname Tag 2 description',
        line: 1,
        tags: [{
          tag: '.tag0',
          name: 'tagname',
          optional: false,
          description: 'Tag 0 description',
          type: '',
          line: 3,
          source: '@.tag0 tagname Tag 0 description',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 15,
              partLength: 6
            },
            name: {
              posStart: 16,
              posEnd: 23,
              partLength: 7
            },
            description: {
              posStart: 24,
              posEnd: 41,
              partLength: 17
            }
          }
        }, {
          tag: '-tag1',
          name: 'tagname',
          optional: false,
          description: 'Tag 1 description',
          type: '',
          line: 4,
          source: '@-tag1 tagname Tag 1 description',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 15,
              partLength: 6
            },
            name: {
              posStart: 16,
              posEnd: 23,
              partLength: 7
            },
            description: {
              posStart: 24,
              posEnd: 41,
              partLength: 17
            }
          }
        }, {
          tag: '+tag2',
          name: 'tagname',
          optional: false,
          description: 'Tag 2 description',
          type: '',
          line: 5,
          source: '@+tag2 tagname Tag 2 description',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 15,
              partLength: 6
            },
            name: {
              posStart: 16,
              posEnd: 23,
              partLength: 7
            },
            description: {
              posStart: 24,
              posEnd: 41,
              partLength: 17
            }
          }
        }]
      }])
  })

  it('should parse tag with optional name containing whitespace `@tag [spaced name]`', function () {
    expect(parse(function () {
      /**
       * @my-tag [spaced name]
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@my-tag [spaced name]',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: '',
          name: 'spaced name',
          description: '',
          source: '@my-tag [spaced name]',
          optional: true,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            name: {
              posStart: 17,
              posEnd: 30,
              partLength: 13
            }
          }
        }]
      }])
  })

  it('should parse tag with optional name, default value unquoted `@tag [name=value]`', function () {
    expect(parse(function () {
      /**
       * @my-tag [name=value]
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@my-tag [name=value]',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: '',
          name: 'name',
          default: 'value',
          source: '@my-tag [name=value]',
          description: '',
          optional: true,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            name: {
              posStart: 17,
              posEnd: 29,
              partLength: 12
            }
          }
        }]
      }])
  })

  it('should parse tag with optional name containing whitespace, default value unquoted containing whitespace, spaced `@tag [ spaced name = spaced value ]`', function () {
    expect(parse(function () {
      /**
       * @my-tag [ spaced name = spaced value ]
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@my-tag [ spaced name = spaced value ]',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: '',
          name: 'spaced name',
          default: 'spaced value',
          source: '@my-tag [ spaced name = spaced value ]',
          description: '',
          optional: true,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            name: {
              posStart: 17,
              posEnd: 47,
              partLength: 30
            }
          }
        }]
      }])
  })

  it('should parse tag with optional name, default value quoted `@tag [name="value"]`', function () {
    expect(parse(function () {
      /**
       * @tag [name="value"]
       */
    }))
      .to.eql([{
        line: 1,
        source: '@tag [name="value"]',
        description: '',
        tags: [{
          tag: 'tag',
          line: 2,
          type: '',
          name: 'name',
          source: '@tag [name="value"]',
          default: '"value"',
          description: '',
          optional: true,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 28,
              partLength: 14
            }
          }
        }]
      }])
  })

  it('should parse tag with optional name, default value quoted containing `=` `@tag [name="="]`', function () {
    expect(parse(function () {
      /**
       * @tag {t} [name="="]
       */
    }))
      .to.eql([{
        line: 1,
        source: '@tag {t} [name="="]',
        description: '',
        tags: [{
          tag: 'tag',
          line: 2,
          type: 't',
          name: 'name',
          source: '@tag {t} [name="="]',
          default: '"="',
          optional: true,
          description: '',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            type: {
              posStart: 14,
              posEnd: 17,
              partLength: 3
            },
            name: {
              posStart: 18,
              posEnd: 28,
              partLength: 10
            }
          }
        }]
      }])
  })

  it('should keep value as is if quotes are mismatched `@tag [name="value\']`', function () {
    expect(parse(function () {
      /**
       * @tag [name="value'] desc
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@tag [name="value\'] desc',
        tags: [{
          tag: 'tag',
          line: 2,
          type: '',
          name: 'name',
          source: '@tag [name="value\'] desc',
          default: '"value\'',
          description: 'desc',
          optional: true,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 28,
              partLength: 14
            },
            description: {
              posStart: 29,
              posEnd: 33,
              partLength: 4
            }
          }
        }]
      }])
  })

  it('should parse rest names `@tag ...name desc`', function () {
    expect(parse(function () {
      /**
       * @tag {t} ...name desc
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@tag {t} ...name desc',
        tags: [{
          tag: 'tag',
          line: 2,
          type: 't',
          name: '...name',
          optional: false,
          source: '@tag {t} ...name desc',
          description: 'desc',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            type: {
              posStart: 14,
              posEnd: 17,
              partLength: 3
            },
            name: {
              posStart: 18,
              posEnd: 25,
              partLength: 7
            },
            description: {
              posStart: 26,
              posEnd: 30,
              partLength: 4
            }
          }
        }]
      }])
  })

  it('should parse optional rest names `@tag [...name] desc`', function () {
    expect(parse(function () {
      /**
       * @tag {t} [...name] desc
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@tag {t} [...name] desc',
        tags: [{
          tag: 'tag',
          line: 2,
          type: 't',
          name: '...name',
          optional: true,
          source: '@tag {t} [...name] desc',
          description: 'desc',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            type: {
              posStart: 14,
              posEnd: 17,
              partLength: 3
            },
            name: {
              posStart: 18,
              posEnd: 27,
              partLength: 9
            },
            description: {
              posStart: 28,
              posEnd: 32,
              partLength: 4
            }
          }
        }]
      }])
  })

  it('should parse multiple tags', function () {
    expect(parse(function () {
      /**
       * Description
       * @my-tag1
       * @my-tag2
       */
    }))
      .to.eql([{
        line: 1,
        description: 'Description',
        source: 'Description\n@my-tag1\n@my-tag2',
        tags: [{
          tag: 'my-tag1',
          line: 3,
          type: '',
          name: '',
          optional: false,
          source: '@my-tag1',
          description: '',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 17,
              posEnd: 17,
              partLength: 0
            }
          }
        }, {
          tag: 'my-tag2',
          line: 4,
          type: '',
          name: '',
          optional: false,
          source: '@my-tag2',
          description: '',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 17,
              posEnd: 17,
              partLength: 0
            }
          }
        }]
      }])
  })

  it('should parse nested tags', function () {
    // eslint-disable-next-line no-extend-native
    Object.prototype.ensureFilteringPrototype = true
    expect(parse(function () {
      /**
       * Description
       * @my-tag name
       * @my-tag name.sub-name
       * @my-tag name.sub-name.sub-sub-name
       */
    }, { dotted_names: true }))
      .to.eql([{
        line: 1,
        description: 'Description',
        source: 'Description\n@my-tag name\n@my-tag name.sub-name\n@my-tag name.sub-name.sub-sub-name',
        tags: [{
          tag: 'my-tag',
          line: 3,
          type: '',
          name: 'name',
          source: '@my-tag name',
          optional: false,
          description: '',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            name: {
              posStart: 17,
              posEnd: 21,
              partLength: 4
            }
          },
          tags: [{
            tag: 'my-tag',
            line: 4,
            type: '',
            name: 'sub-name',
            optional: false,
            source: '@my-tag name.sub-name',
            description: '',
            positions: {
              tag: {
                posStart: 9,
                posEnd: 16,
                partLength: 7
              },
              name: {
                posStart: 17,
                posEnd: 30,
                partLength: 13
              }
            },
            tags: [{
              tag: 'my-tag',
              line: 5,
              type: '',
              name: 'sub-sub-name',
              optional: false,
              source: '@my-tag name.sub-name.sub-sub-name',
              description: '',
              positions: {
                tag: {
                  posStart: 9,
                  posEnd: 16,
                  partLength: 7
                },
                name: {
                  posStart: 17,
                  posEnd: 43,
                  partLength: 26
                }
              }
            }]
          }]
        }]
      }])
    // Restore
    delete Object.prototype.ensureFilteringPrototype
  })

  it('should parse nested tags with missing parent', function () {
    expect(parse(function () {
      /**
       * Description
       * @my-tag name.sub-name
       * @my-tag name.sub-name.sub-sub-name
       */
    }, { dotted_names: true }))
      .to.eql([{
        line: 1,
        description: 'Description',
        source: 'Description\n@my-tag name.sub-name\n@my-tag name.sub-name.sub-sub-name',
        tags: [{
          tag: 'my-tag',
          line: 3,
          type: '',
          name: 'name',
          description: '',
          tags: [{
            tag: 'my-tag',
            line: 3,
            type: '',
            name: 'sub-name',
            optional: false,
            source: '@my-tag name.sub-name',
            description: '',
            positions: {
              tag: {
                posStart: 9,
                posEnd: 16,
                partLength: 7
              },
              name: {
                posStart: 17,
                posEnd: 30,
                partLength: 13
              }
            },
            tags: [{
              tag: 'my-tag',
              line: 4,
              type: '',
              name: 'sub-sub-name',
              optional: false,
              source: '@my-tag name.sub-name.sub-sub-name',
              description: '',
              positions: {
                tag: {
                  posStart: 9,
                  posEnd: 16,
                  partLength: 7
                },
                name: {
                  posStart: 17,
                  posEnd: 43,
                  partLength: 26
                }
              }
            }]
          }]
        }]
      }])
  })

  it('should parse nested tags with missing parent but with matching tag name', function () {
    expect(parse(function () {
      /**
       * Description
       * @my-tag
       * @my-tag name.sub-name
       * @my-tag name.sub-name.sub-sub-name
       */
    }, { dotted_names: true }))
      .to.eql([{
        line: 1,
        description: 'Description',
        source: 'Description\n@my-tag\n@my-tag name.sub-name\n@my-tag name.sub-name.sub-sub-name',
        tags: [{
          tag: 'my-tag',
          line: 3,
          type: '',
          name: '',
          source: '@my-tag',
          optional: false,
          description: '',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            name: {
              posStart: 16,
              posEnd: 16,
              partLength: 0
            }
          }
        }, {
          tag: 'my-tag',
          line: 4,
          type: '',
          name: 'name',
          description: '',
          tags: [{
            tag: 'my-tag',
            line: 4,
            type: '',
            name: 'sub-name',
            optional: false,
            source: '@my-tag name.sub-name',
            description: '',
            positions: {
              tag: {
                posStart: 9,
                posEnd: 16,
                partLength: 7
              },
              name: {
                posStart: 17,
                posEnd: 30,
                partLength: 13
              }
            },
            tags: [{
              tag: 'my-tag',
              line: 5,
              type: '',
              name: 'sub-sub-name',
              optional: false,
              source: '@my-tag name.sub-name.sub-sub-name',
              description: '',
              positions: {
                tag: {
                  posStart: 9,
                  posEnd: 16,
                  partLength: 7
                },
                name: {
                  posStart: 17,
                  posEnd: 43,
                  partLength: 26
                }
              }
            }]
          }]
        }]
      }])
  })

  it('should parse complex types `@tag {{a: type}} name`', function () {
    expect(parse(function () {
      /**
       * @my-tag {{a: number}} name
       */
    }))
      .to.eql([{
        line: 1,
        source: '@my-tag {{a: number}} name',
        description: '',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: '{a: number}',
          name: 'name',
          source: '@my-tag {{a: number}} name',
          optional: false,
          description: '',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 30,
              partLength: 13
            },
            name: {
              posStart: 31,
              posEnd: 35,
              partLength: 4
            }
          }
        }]
      }])
  })

  it('should gracefully fail on syntax errors `@tag {{a: type} name`', function () {
    expect(parse(function () {
      /**
       * @my-tag {{a: number} name
       */
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@my-tag {{a: number} name',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: '',
          name: '',
          description: '',
          source: '@my-tag {{a: number} name',
          optional: false,
          errors: ['parse_type: Invalid `{type}`, unpaired curlies'],
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            }
          }
        }]
      }])
  })

  it('should parse $ in description`', function () {
    expect(parse(function () {
      /**
       * @my-tag {String} name description with $ char
       */
    }))
      .to.eql([{
        line: 1,
        source: '@my-tag {String} name description with $ char',
        description: '',
        tags: [{
          tag: 'my-tag',
          line: 2,
          type: 'String',
          name: 'name',
          source: '@my-tag {String} name description with $ char',
          optional: false,
          description: 'description with $ char',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 16,
              partLength: 7
            },
            type: {
              posStart: 17,
              posEnd: 25,
              partLength: 8
            },
            name: {
              posStart: 26,
              posEnd: 30,
              partLength: 4
            },
            description: {
              posStart: 31,
              posEnd: 54,
              partLength: 23
            }
          }
        }]
      }])
  })

  it('should parse doc block with bound forced to the left', function () {
    expect(parse(function () {
      /**
   * Description text
   * @tag tagname Tag description
   */
    }))
      .to.eql([{
        description: 'Description text',
        source: 'Description text\n@tag tagname Tag description',
        line: 1,
        tags: [{
          tag: 'tag',
          name: 'tagname',
          optional: false,
          description: 'Tag description',
          type: '',
          line: 3,
          source: '@tag tagname Tag description',
          positions: {
            tag: {
              posStart: 5,
              posEnd: 9,
              partLength: 4
            },
            name: {
              posStart: 10,
              posEnd: 17,
              partLength: 7
            },
            description: {
              posStart: 18,
              posEnd: 33,
              partLength: 15
            }
          }
        }]
      }])
  })

  it('should parse doc block with bound forced to the right', function () {
    expect(parse(function () {
      /**
           * Description text
           * @tag tagname Tag description
           */
    }))
      .to.eql([{
        description: 'Description text',
        source: 'Description text\n@tag tagname Tag description',
        line: 1,
        tags: [{
          tag: 'tag',
          name: 'tagname',
          optional: false,
          description: 'Tag description',
          type: '',
          line: 3,
          source: '@tag tagname Tag description',
          positions: {
            tag: {
              posStart: 13,
              posEnd: 17,
              partLength: 4
            },
            name: {
              posStart: 18,
              posEnd: 25,
              partLength: 7
            },
            description: {
              posStart: 26,
              posEnd: 41,
              partLength: 15
            }
          }
        }]
      }])
  })

  it('should parse doc block with soft bound', function () {
    expect(parse(function () {
      /**
   Description text
           another line
   @tag tagname Tag description
   */
    }))
      .to.eql([{
        description: 'Description text\nanother line',
        source: 'Description text\nanother line\n@tag tagname Tag description',
        line: 1,
        tags: [{
          tag: 'tag',
          name: 'tagname',
          optional: false,
          description: 'Tag description',
          type: '',
          line: 4,
          source: '@tag tagname Tag description',
          positions: {
            tag: {
              posStart: 3,
              posEnd: 7,
              partLength: 4
            },
            name: {
              posStart: 8,
              posEnd: 15,
              partLength: 7
            },
            description: {
              posStart: 16,
              posEnd: 31,
              partLength: 15
            }
          }
        }]
      }])
  })

  it('should parse doc block with soft bound respecting `opts.trim = false`', function () {
    expect(parse(function () {
      /**
   Description text
           another line
   @tag tagname Tag description
   */
    }, {
      trim: false
    }))
      .to.eql([{
        description: '\nDescription text\n  another line',
        source: '\nDescription text\n  another line\n@tag tagname Tag description\n',
        line: 1,
        tags: [{
          tag: 'tag',
          name: 'tagname',
          optional: false,
          description: 'Tag description\n',
          type: '',
          line: 4,
          source: '@tag tagname Tag description\n',
          positions: {
            tag: {
              posStart: 3,
              posEnd: 7,
              partLength: 4
            },
            name: {
              posStart: 8,
              posEnd: 15,
              partLength: 7
            },
            description: {
              posStart: 16,
              posEnd: 32,
              partLength: 16
            }
          }
        }]
      }])
  })

  it('should parse multiline without star as same line respecting `opts.join = true`', function () {
    expect(parse(function () {
      /**
       * @tag name
       * description
         same line
       */
    }, {
      join: true
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@tag name\ndescription\nsame line',
        tags: [{
          tag: 'tag',
          line: 2,
          type: '',
          name: 'name',
          description: 'description same line',
          source: '@tag name\ndescription same line',
          optional: false,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 18,
              partLength: 4
            },
            description: {
              posStart: 18,
              posEnd: 39,
              partLength: 21
            }
          }
        }]
      }])
  })

  it('should parse multiline without star as same line respecting `opts.join = "\\t"`', function () {
    expect(parse(function () {
      /**
       * @tag name
       * description
         same line
       */
    }, {
      join: '\t'
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '@tag name\ndescription\nsame line',
        tags: [{
          tag: 'tag',
          line: 2,
          type: '',
          name: 'name',
          description: 'description\tsame line',
          source: '@tag name\ndescription\tsame line',
          optional: false,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 18,
              partLength: 4
            },
            description: {
              posStart: 18,
              posEnd: 39,
              partLength: 21
            }
          }
        }]
      }])
  })

  it('should parse multiline without star as same line with intent respecting `opts.join = 1` and `opts.trim = false`', function () {
    expect(parse(function () {
      /**
       * @tag name
       * description
           intent same line
       */
    }, {
      join: 1,
      trim: false
    }))
      .to.eql([{
        line: 1,
        description: '',
        source: '\n@tag name\ndescription\n  intent same line\n',
        tags: [{
          tag: 'tag',
          line: 2,
          type: '',
          name: 'name',
          description: 'description  intent same line\n',
          source: '@tag name\ndescription  intent same line\n',
          optional: false,
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 18,
              partLength: 4
            },
            description: {
              posStart: 18,
              posEnd: 48,
              partLength: 30
            }
          }
        }]
      }])
  })

  it('should parse doc block with star and initial whitespace respecting `opts.trim = false`', function () {
    expect(parse(function () {
      /**
       * Description text
       *  @tag tagname Tag description
       */
    }, {
      trim: false
    }))
      .to.eql([{
        description: '\nDescription text',
        source: '\nDescription text\n @tag tagname Tag description\n',
        line: 1,
        tags: [{
          tag: 'tag',
          name: 'tagname',
          optional: false,
          description: 'Tag description\n',
          type: '',
          line: 3,
          source: ' @tag tagname Tag description\n',
          positions: {
            tag: {
              posStart: 10,
              posEnd: 14,
              partLength: 4
            },
            name: {
              posStart: 15,
              posEnd: 22,
              partLength: 7
            },
            description: {
              posStart: 23,
              posEnd: 39,
              partLength: 16
            }
          }
        }]
      }])
  })

  it('should parse same line closing section (issue #22)', function () {
    expect(parse(function () {
      /**
       * Start here
       * Here is more stuff */
      var a
    }))
      .to.eql([{
        description: 'Start here\nHere is more stuff',
        line: 1,
        source: 'Start here\nHere is more stuff',
        tags: []
      }])
  })

  it('should tolerate inconsistent formatting (issue #29)', function () {
    expect(parse(function () {
      /**
         * @param {Object} options 配置
         * @return {Any} obj 组件返回的对象
         * @example name
         * var widget = XX.showWidget('searchlist', {
         *    onComplete: function() {
         *          todoSomething();
         *     }
         * });
     */
    }, {
      join: 1,
      trim: false
    })).to.eql([{
      description: '',
      line: 1,
      source: "\n@param {Object} options 配置\n@return {Any} obj 组件返回的对象\n@example name\nvar widget = XX.showWidget('searchlist', {\n   onComplete: function() {\n         todoSomething();\n    }\n});\n",
      tags: [{
        description: '配置',
        line: 2,
        name: 'options',
        optional: false,
        source: '@param {Object} options 配置',
        tag: 'param',
        type: 'Object',
        positions: {
          tag: {
            posStart: 11,
            posEnd: 17,
            partLength: 6
          },
          type: {
            posStart: 18,
            posEnd: 26,
            partLength: 8
          },
          name: {
            posStart: 27,
            posEnd: 34,
            partLength: 7
          },
          description: {
            posStart: 35,
            posEnd: 37,
            partLength: 2
          }
        }
      }, {
        description: '组件返回的对象',
        line: 3,
        name: 'obj',
        optional: false,
        source: '@return {Any} obj 组件返回的对象',
        tag: 'return',
        type: 'Any',
        positions: {
          tag: {
            posStart: 11,
            posEnd: 18,
            partLength: 7
          },
          type: {
            posStart: 19,
            posEnd: 24,
            partLength: 5
          },
          name: {
            posStart: 25,
            posEnd: 28,
            partLength: 3
          },
          description: {
            posStart: 29,
            posEnd: 36,
            partLength: 7
          }
        }
      }, {
        description: "var widget = XX.showWidget('searchlist', {\n   onComplete: function() {\n         todoSomething();\n    }\n});\n",
        line: 4,
        name: 'name',
        optional: false,
        source: "@example name\nvar widget = XX.showWidget('searchlist', {\n   onComplete: function() {\n         todoSomething();\n    }\n});\n",
        tag: 'example',
        type: '',
        positions: {
          tag: {
            posStart: 11,
            posEnd: 19,
            partLength: 8
          },
          name: {
            posStart: 20,
            posEnd: 24,
            partLength: 4
          },
          description: {
            posStart: 24,
            posEnd: 131,
            partLength: 107
          }
        }
      }]
    }])
  })

  it('should keep optional names spaces (issue #41)`', function () {
    expect(parse(function () {
      /**
       * @section [Brand Colors] Here you can find all the brand colors
       */
    }))
      .to.eql([{
        line: 1,
        source: '@section [Brand Colors] Here you can find all the brand colors',
        description: '',
        tags: [{
          tag: 'section',
          line: 2,
          type: '',
          name: 'Brand Colors',
          source: '@section [Brand Colors] Here you can find all the brand colors',
          optional: true,
          description: 'Here you can find all the brand colors',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 18,
              posEnd: 32,
              partLength: 14
            },
            description: {
              posStart: 33,
              posEnd: 71,
              partLength: 38
            }
          }
        }]
      }])
  })

  it('should keep quotes in description (issue #41)`', function () {
    expect(parse(function () {
      /**
       * @section "Brand Colors" Here you can find all the brand colors
       */
    }))
      .to.eql([{
        line: 1,
        source: '@section "Brand Colors" Here you can find all the brand colors',
        description: '',
        tags: [{
          tag: 'section',
          line: 2,
          type: '',
          name: 'Brand Colors',
          source: '@section "Brand Colors" Here you can find all the brand colors',
          optional: false,
          description: 'Here you can find all the brand colors',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 18,
              posEnd: 32,
              partLength: 14
            },
            description: {
              posStart: 33,
              posEnd: 71,
              partLength: 38
            }
          }
        }]
      }])
  })

  it('should use only quoted name (issue #41)`', function () {
    expect(parse(function () {
      /**
       * @section "Brand Colors" Here you can find "all" the brand colors
       */
    }))
      .to.eql([{
        line: 1,
        source: '@section "Brand Colors" Here you can find "all" the brand colors',
        description: '',
        tags: [{
          tag: 'section',
          line: 2,
          type: '',
          name: 'Brand Colors',
          source: '@section "Brand Colors" Here you can find "all" the brand colors',
          optional: false,
          description: 'Here you can find "all" the brand colors',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 18,
              posEnd: 32,
              partLength: 14
            },
            description: {
              posStart: 33,
              posEnd: 73,
              partLength: 40
            }
          }
        }]
      }])
  })

  it('should ignore inconsistent quoted groups (issue #41)`', function () {
    expect(parse(function () {
      /**
       * @section "Brand Colors Here you can find all the brand colors
       */
    }))
      .to.eql([{
        line: 1,
        source: '@section "Brand Colors Here you can find all the brand colors',
        description: '',
        tags: [{
          tag: 'section',
          line: 2,
          type: '',
          name: '"Brand',
          source: '@section "Brand Colors Here you can find all the brand colors',
          optional: false,
          description: 'Colors Here you can find all the brand colors',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 18,
              posEnd: 24,
              partLength: 6
            },
            description: {
              posStart: 25,
              posEnd: 70,
              partLength: 45
            }
          }
        }]
      }])
  })

  it('should include non-space immediately after asterisk`', function () {
    expect(parse(function () {
      /**
       * @example
       *```typescript
       * ```
       */
      function A () {}
    }))
      .to.eql([{
        line: 1,
        source: '@example\n```typescript\n```',
        description: '',
        tags: [{
          tag: 'example',
          name: '\n```typescript',
          optional: false,
          description: '```',
          type: '',
          line: 2,
          source: '@example\n```typescript\n```',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 17,
              posEnd: 31,
              partLength: 14
            },
            description: {
              posStart: 31,
              posEnd: 34,
              partLength: 3
            }
          }
        }]
      }])
  })

  it('should handle fenced description (issue #61)`', function () {
    expect(parse(function () {
      /**
       * @example "" ```ts
      @transient()
      class Foo { }
      ```
       * @tag name description
       */
    }))
      .to.eql([{
        line: 1,
        source: '@example "" ```ts\n@transient()\nclass Foo { }\n```\n@tag name description',
        description: '',
        tags: [{
          tag: 'example',
          name: '',
          optional: false,
          description: '```ts\n@transient()\nclass Foo { }\n```',
          type: '',
          line: 2,
          source: '@example "" ```ts\n@transient()\nclass Foo { }\n```',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 18,
              posEnd: 20,
              partLength: 2
            },
            description: {
              posStart: 21,
              posEnd: 57,
              partLength: 36
            }
          }
        }, {
          tag: 'tag',
          name: 'name',
          optional: false,
          description: 'description',
          type: '',
          line: 6,
          source: '@tag name description',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 18,
              partLength: 4
            },
            description: {
              posStart: 19,
              posEnd: 30,
              partLength: 11
            }
          }
        }]
      }])
  })

  it('should handle one line fenced description (issue #61)`', function () {
    expect(parse(function () {
      /**
       * @example "" ```fenced text```
       * @tag name description
       */
    }))
      .to.eql([{
        line: 1,
        source: '@example "" ```fenced text```\n@tag name description',
        description: '',
        tags: [{
          tag: 'example',
          name: '',
          optional: false,
          description: '```fenced text```',
          type: '',
          line: 2,
          source: '@example "" ```fenced text```',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 18,
              posEnd: 20,
              partLength: 2
            },
            description: {
              posStart: 21,
              posEnd: 38,
              partLength: 17
            }
          }
        }, {
          tag: 'tag',
          name: 'name',
          optional: false,
          description: 'description',
          type: '',
          line: 3,
          source: '@tag name description',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 18,
              partLength: 4
            },
            description: {
              posStart: 19,
              posEnd: 30,
              partLength: 11
            }
          }
        }]
      }])
  })

  it('should handle description with multiple fences (issue #61)`', function () {
    expect(parse(function () {
      /**
       * @example "" ```fenced text``` not fenced text ```ts
      @transient()
      class Foo { }
      ```
       * @tag name description
       */
    }))
      .to.eql([{
        line: 1,
        source: '@example "" ```fenced text``` not fenced text ```ts\n@transient()\nclass Foo { }\n```\n@tag name description',
        description: '',
        tags: [{
          tag: 'example',
          name: '',
          optional: false,
          description: '```fenced text``` not fenced text ```ts\n@transient()\nclass Foo { }\n```',
          type: '',
          line: 2,
          source: '@example "" ```fenced text``` not fenced text ```ts\n@transient()\nclass Foo { }\n```',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 18,
              posEnd: 20,
              partLength: 2
            },
            description: {
              posStart: 21,
              posEnd: 91,
              partLength: 70
            }
          }
        }, {
          tag: 'tag',
          name: 'name',
          optional: false,
          description: 'description',
          type: '',
          line: 6,
          source: '@tag name description',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 18,
              partLength: 4
            },
            description: {
              posStart: 19,
              posEnd: 30,
              partLength: 11
            }
          }
        }]
      }])
  })

  it('should allow custom fence detection logic (issue #61)`', function () {
    expect(parse(function () {
      /**
       * @example "" ###ts
      @transient()
      class Foo { }
      ###
       * @tag name description
       */
    }, {
      fence: line => line.indexOf('###') !== -1
    }))
      .to.eql([{
        line: 1,
        source: '@example "" ###ts\n@transient()\nclass Foo { }\n###\n@tag name description',
        description: '',
        tags: [{
          tag: 'example',
          name: '',
          optional: false,
          description: '###ts\n@transient()\nclass Foo { }\n###',
          type: '',
          line: 2,
          source: '@example "" ###ts\n@transient()\nclass Foo { }\n###',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 17,
              partLength: 8
            },
            name: {
              posStart: 18,
              posEnd: 20,
              partLength: 2
            },
            description: {
              posStart: 21,
              posEnd: 57,
              partLength: 36
            }
          }
        }, {
          tag: 'tag',
          name: 'name',
          optional: false,
          description: 'description',
          type: '',
          line: 6,
          source: '@tag name description',
          positions: {
            tag: {
              posStart: 9,
              posEnd: 13,
              partLength: 4
            },
            name: {
              posStart: 14,
              posEnd: 18,
              partLength: 4
            },
            description: {
              posStart: 19,
              posEnd: 30,
              partLength: 11
            }
          }
        }]
      }])
  })
})
