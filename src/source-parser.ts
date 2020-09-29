enum Markers {
  start = '/**',
  nostart = '/***',
  delim = '*',
  end = '*/'
}

export interface Tokens {
  start: string
  delimiter: string
  postDelimiter: string
  text: string
  end: string
}

export interface Line {
  line: number
  source: string
  tokens: Tokens
}

export interface Options {
  startLine: number
}

export type Parser = (source: string) => Line[] | null

export default function getParser ({ startLine = 0 }: Partial<Options> = {}): Parser {
  if (startLine < 0 || startLine % 1 > 0) throw new Error('Invalid startLine')

  const spaceChars = new Set<string>([' ', '\t'])

  let block: Line[] | null = null
  let line = startLine

  function split (s: string): [string, string] {
    let i = 0
    do { if (!spaceChars.has(s[i])) break } while (++i < s.length)
    return [s.slice(0, i), s.slice(i)]
  }

  return function parse (source: string): Line[] | null {
    let text = source
    const tokens: Tokens = {
      start: '',
      delimiter: '',
      postDelimiter: '',
      text: '',
      end: ''
    }

    ;[tokens.start, text] = split(text)

    if (block === null && text.startsWith(Markers.start) && !text.startsWith(Markers.nostart)) {
      block = []
      tokens.delimiter = text.slice(0, Markers.start.length)
      text = text.slice(Markers.start.length)
      ;[tokens.postDelimiter, text] = split(text)
    }

    if (block === null) {
      line++
      return null
    }

    const isClosed = (text.trimRight()).endsWith(Markers.end)

    if (tokens.delimiter === '' && text.startsWith(Markers.delim) && !text.startsWith(Markers.end)) {
      tokens.delimiter = Markers.delim
      text = text.slice(Markers.delim.length)
      ;[tokens.postDelimiter, text] = split(text)
    }

    if (isClosed) {
      const trimmed = text.trimRight()
      tokens.end = text.slice(trimmed.length - Markers.end.length)
      text = trimmed.slice(0, -Markers.end.length)
    }

    tokens.text = text
    block.push({ line, source, tokens })
    line++

    if (isClosed) {
      const result = block.slice()
      block = null
      return result
    }

    return null
  }
}
