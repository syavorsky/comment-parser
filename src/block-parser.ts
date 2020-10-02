import { Markers, Line, Tokens } from './source-parser'

const reTag = /^@\S+/

export interface Section {
  text: string
  source: Line[]
}

export type Parser = (block: Line[]) => Section[]

type Joiner = (lines: Tokens[]) => string
type Fencer = (source: string) => boolean

export interface Options {
  join: 'compact' | 'multiline' | Joiner
  fence: string | Fencer
}

export default function getParser ({ join = 'compact', fence = '```' }: Partial<Options> = {}): Parser {
  const fencer = getFencer(fence)
  const toggleFence = (source: string, isFenced: boolean): boolean => fencer(source) ? !isFenced : isFenced

  const joiner = getJoiner(join)
  const joinText = ({ source }: Section): Section => {
    const text = joiner(source.map(({ tokens }: Line) => tokens))
    return { source, text }
  }

  return function parseBlock (block: Line[]): Section[] {
    // start with description section
    const sections: Section[] = [{ text: '', source: [] }]

    let isFenced = false
    for (const line of block) {
      if (reTag.test(line.tokens.description) && !isFenced) {
        sections.push({ text: '', source: [line] })
      } else {
        sections[sections.length - 1].source.push(line)
      }
      isFenced = toggleFence(line.tokens.description, isFenced)
    }

    return sections.map(joinText)
  }
}

function getJoiner (join: 'compact' | 'multiline' | Joiner): Joiner {
  if (join === 'compact') return compactJoiner
  if (join === 'multiline') return multilineJoiner
  return join
}

function getFencer (fence: string | Fencer): Fencer {
  if (typeof fence === 'string') return (source: string) => source.split(fence).length % 2 === 0
  return fence
}

function compactJoiner (lines: Tokens[]): string {
  return lines
    .map(({ description: text }: Tokens) => text.trim())
    .filter(text => text !== '')
    .join(' ')
}

function multilineJoiner (lines: Tokens[]): string {
  if (lines[0]?.delimiter === Markers.start) lines = lines.slice(1)
  if (lines[lines.length - 1]?.end.startsWith(Markers.end)) lines = lines.slice(0, -1)
  return lines
    .map(tokens => (tokens.delimiter === '' ? tokens.start : tokens.postDelimiter.slice(1)) + tokens.description)
    .join('\n')
}
