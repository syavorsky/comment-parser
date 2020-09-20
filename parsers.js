'use strict'

function skipws (str) {
  let i = 0
  do {
    if (str[i] !== ' ' && str[i] !== '\t') { return i }
  } while (++i < str.length)
  return i
}

function getPositions (posStart, posEnd, partLength, multiline) {
  if (partLength === undefined || partLength === 0) {
    return undefined
  }

  if (multiline) {
    return {
      posStart,
      multiline
    }
  }

  const positions = {
    posStart,
    posEnd,
    partLength
  }

  if (multiline === false) {
    positions.multiline = multiline
  }

  return positions
}

/* ------- default parsers ------- */

const PARSERS = {}

PARSERS.parse_tag = function parse_tag (str) {
  const match = str.match(/^\s*@(\S+)/)
  if (!match) { throw new SyntaxError('Invalid `@tag`, missing @ symbol') }

  const partLength = match[0].trim().length
  const posStart = skipws(str)
  const posEnd = posStart + partLength

  return {
    source: match[0],
    data: { tag: match[1] },
    positions: getPositions(posStart, posEnd, partLength)
  }
}

PARSERS.parse_type = function parse_type (str, data) {
  if (data.errors && data.errors.length) { return null }

  const posStart = skipws(str)

  let pos = posStart
  let res = ''
  let curlies = 0

  if (str[pos] !== '{') { return null }

  while (pos < str.length) {
    curlies += (str[pos] === '{' ? 1 : (str[pos] === '}' ? -1 : 0))
    res += str[pos]
    pos++
    if (curlies === 0) { break }
  }

  if (curlies !== 0) { throw new SyntaxError('Invalid `{type}`, unpaired curlies') }

  const posEnd = pos
  const partLength = posEnd - posStart

  return {
    source: str.slice(0, pos),
    data: { type: res.slice(1, -1) },
    positions: getPositions(posStart, posEnd, partLength)
  }
}

PARSERS.parse_name = function parse_name (str, data) {
  if (data.errors && data.errors.length) { return null }

  const posStart = skipws(str)

  let pos = posStart
  let name = ''
  let brackets = 0
  let res = { optional: false }

  // if it starts with quoted group assume it is a literal
  const quotedGroups = str.slice(pos).split('"')
  if (quotedGroups.length > 1 && quotedGroups[0] === '' && quotedGroups.length % 2 === 1) {
    name = quotedGroups[1]
    pos += name.length + 2
  // assume name is non-space string or anything wrapped into brackets
  } else {
    while (pos < str.length) {
      brackets += (str[pos] === '[' ? 1 : (str[pos] === ']' ? -1 : 0))
      name += str[pos]
      pos++
      if (brackets === 0 && /\s/.test(str[pos])) { break }
    }

    if (brackets !== 0) { throw new SyntaxError('Invalid `name`, unpaired brackets') }

    res = { name, optional: false }

    if (name[0] === '[' && name[name.length - 1] === ']') {
      res.optional = true
      name = name.slice(1, -1)

      const match = name.match(
        /^\s*([^=]+?)(?:\s*=\s*(.*?))?\s*(?=$)/
      )

      if (!match) throw new SyntaxError('Invalid `name`, bad syntax')

      name = match[1]
      if (match[2]) res.default = match[2]
      // We will throw this later after processing other tags (so we
      //  will collect enough data for the user to be able to fully recover)
      else if (match[2] === '') {
        res.default = match[2]
        res.warning = 'Empty `name`, bad syntax'
      }
    }
  }

  res.name = name

  const posEnd = pos
  const partLength = posEnd - posStart

  return {
    source: str.slice(0, pos),
    data: res,
    positions: getPositions(posStart, posEnd, partLength)
  }
}

PARSERS.parse_description = function parse_description (str, data) {
  if (data.errors && data.errors.length) { return null }

  const match = str.match(/^\s+((.|\s)+)?/)

  if (!match) {
    return null
  }

  const partLength = match[1] ? match[1].length : 0
  const posStart = skipws(str)
  const posEnd = posStart + partLength
  const multiline = !!(match[1] !== undefined && match[1].match(/\n/))

  return {
    source: match[0],
    data: { description: match[1] === undefined ? '' : match[1] },
    positions: getPositions(posStart, posEnd, partLength, multiline)
  }
}

module.exports = PARSERS
