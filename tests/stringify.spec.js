'use strict'

const { expect } = require('chai')

const parser = require('../')

describe('Comment stringifying', function () {
  it('should stringify doc block with description', function () {
    const expected = `/**
* Singleline or multiline description text. Line breaks are preserved.
*
* @some-tag {Type} name Singleline or multiline description text
* @some-tag {Type} name.subname Singleline or multiline description text
* @some-tag {Type} name.subname.subsubname Singleline or
* multiline description text
* @some-tag {Type} [optionalName=someDefault]
* @another-tag
*/`
    const parsed = parser(expected)

    expect(parsed).to.be.an('array')

    const stringified = parser.stringify(parsed)

    expect(stringified).to.eq(expected)
  })

  it('should stringify doc block with description (supplied tags object)', function () {
    const expected = `* Singleline or multiline description text. Line breaks are preserved.
*
* @some-tag {Type} name Singleline or multiline description text
* @some-tag {Type} name.subname Singleline or multiline description text
* @some-tag {Type} name.subname.subsubname Singleline or
* multiline description text
* @some-tag {Type} [optionalName=someDefault]
* @another-tag
`
    const parsed = parser('/**\n' + expected + '*/')

    expect(parsed).to.be.an('array')

    const stringified = parser.stringify(parsed[0])

    expect(stringified).to.eq(expected)
  })

  it('should stringify doc block with description (supplied tag object)', function () {
    const expected = `* @some-tag {Type} name Singleline or multiline description text
`
    const parsed = parser('/**\n' + expected + '*/')

    expect(parsed).to.be.an('array')

    const stringified = parser.stringify(parsed[0].tags[0])

    expect(stringified).to.eq(expected)
  })

  it('should throw with bad arguments to stringify', function () {
    expect(() => {
      parser.stringify(3)
    }).to.throw(TypeError, 'Unexpected argument passed to `stringify`.')
    expect(() => {
      parser.stringify({})
    }).to.throw(TypeError, 'Unexpected argument passed to `stringify`.')
  })

  it('should stringify indented doc block with description', function () {
    const expected = `   /**
    * Singleline or multiline description text. Line breaks are preserved.
    *
    * @some-tag {Type} name Singleline or multiline description text
    * @some-tag {Type} name.subname Singleline or multiline description text
    * @some-tag {Type} name.subname.subsubname Singleline or
    * multiline description text
    * @some-tag {Type} [optionalName=someDefault]
    * @another-tag
    */`
    const parsed = parser(expected)

    expect(parsed).to.be.an('array')

    const stringified = parser.stringify(parsed, { indent: '    ' })

    expect(stringified).to.eq(expected)
  })

  it('should stringify numeric indented doc block with description', function () {
    const expected = `   /**
    * Singleline or multiline description text. Line breaks are preserved.
    *
    * @some-tag {Type} name Singleline or multiline description text
    * @some-tag {Type} name.subname Singleline or multiline description text
    * @some-tag {Type} name.subname.subsubname Singleline or
    * multiline description text
    * @some-tag {Type} [optionalName=someDefault]
    * @another-tag
    */`
    const parsed = parser(expected)

    expect(parsed).to.be.an('array')

    const stringified = parser.stringify(parsed, { indent: 4 })

    expect(stringified).to.eq(expected)
  })

  it('should stringify numeric indented doc block without description', function () {
    const expected = `   /**
    * @param Foo
    */`
    const parsed = parser(expected)

    expect(parsed).to.be.an('array')

    const stringified = parser.stringify(parsed, { indent: 4 })

    expect(stringified).to.eq(expected)
  })
})
