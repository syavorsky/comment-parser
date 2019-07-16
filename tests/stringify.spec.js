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
