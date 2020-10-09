import { splitSpace } from './util'

export enum Markers {
  start = '/**',
  nostart = '/***',
  delim = '*',
  end = '*/'
}

export interface Tokens {
  start: string
  delimiter: string
  postDelimiter: string
  tag: string
  postTag: string
  name: string
  postName: string
  type: string
  postType: string
  description: string
  end: string
}

export interface Line {
  number: number
  source: string
  tokens: Tokens
}

export interface Options {
  startLine: number
}

export type Parser = (source: string) => Line[] | null

export default function getParser ({ startLine = 0 }: Partial<Options> = {}): Parser {
  if (startLine < 0 || startLine % 1 > 0) throw new Error('Invalid startLine')

  let block: Line[] | null = null
  let num = startLine

  return function parseSource (source: string): Line[] | null {
    let rest = source
    const tokens: Tokens = seedTokens()

    ;[tokens.start, rest] = splitSpace(rest)

    if (block === null && rest.startsWith(Markers.start) && !rest.startsWith(Markers.nostart)) {
      block = []
      tokens.delimiter = rest.slice(0, Markers.start.length)
      rest = rest.slice(Markers.start.length)
      ;[tokens.postDelimiter, rest] = splitSpace(rest)
    }

    if (block === null) {
      num++
      return null
    }

    const isClosed = (rest.trimRight()).endsWith(Markers.end)

    if (tokens.delimiter === '' && rest.startsWith(Markers.delim) && !rest.startsWith(Markers.end)) {
      tokens.delimiter = Markers.delim
      rest = rest.slice(Markers.delim.length)
      ;[tokens.postDelimiter, rest] = splitSpace(rest)
    }

    if (isClosed) {
      const trimmed = rest.trimRight()
      tokens.end = rest.slice(trimmed.length - Markers.end.length)
      rest = trimmed.slice(0, -Markers.end.length)
    }

    tokens.description = rest
    block.push({ number: num, source, tokens })
    num++

    if (isClosed) {
      const result = block.slice()
      block = null
      return result
    }

    return null
  }
}

export function seedTokens (tokens: Partial<Tokens> = {}): Tokens {
  return {
    start: '',
    delimiter: '',
    postDelimiter: '',
    tag: '',
    postTag: '',
    name: '',
    postName: '',
    type: '',
    postType: '',
    description: '',
    end: '',
    ...tokens
  }
}
