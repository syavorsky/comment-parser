enum Markers {
  start = '/**',
  nostart = '/***',
  delim = '*',
  end = '*/'
}

export interface Tokens {
  start: string
  delim: string
  postDelim: string
  tag: string
  postTag: string
  type: string
  postType: string
  name: string
  postName: string
  descr: string
  end: string
}

export interface Line {
  line: number
  source: string
  tokens: Tokens
}

export type Block = Line[]

export interface Options {
  startLine?: number
}

export type Parser = (source: string) => Block | null

const defaultTokens = {
  start: '',
  delim: '',
  postDelim: '',
  tag: '',
  postTag: '',
  type: '',
  postType: '',
  name: '',
  postName: '',
  descr: '',
  end: ''
}

export default function getParser ({ startLine = 0 }: Options = {}): Parser {
  if (startLine < 0 || startLine % 1 > 0) throw new Error('Invalid startLine')

  const spaceChars = new Set<string>([' ', '\t'])

  let block: Block | null = null
  let line = startLine

  function split (s: string): [string, string] {
    let i = 0
    do { if (!spaceChars.has(s[i])) break } while (++i < s.length)
    return [s.slice(0, i), s.slice(i)]
  }

  return function parse (source: string): Block | null {
    const tokens = { ...defaultTokens }
    ;[tokens.start, source] = split(source)

    if (block === null && source.startsWith(Markers.start) && !source.startsWith(Markers.nostart)) {
      block = []
      tokens.delim = source.slice(0, Markers.start.length)
      source = source.slice(Markers.start.length)
      ;[tokens.postDelim, source] = split(source)
    }

    if (block === null) {
      line++
      return null
    }

    const isClosed = (source.trimRight()).endsWith(Markers.end)

    if (tokens.delim === '' && source.startsWith(Markers.delim) && !source.startsWith(Markers.end)) {
      tokens.delim = Markers.delim
      source = source.slice(Markers.delim.length)
      ;[tokens.postDelim, source] = split(source)
    }

    if (isClosed) {
      const trimmed = source.trimRight()
      tokens.end = source.slice(trimmed.length - Markers.end.length)
      source = trimmed.slice(0, -Markers.end.length)
    }

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
