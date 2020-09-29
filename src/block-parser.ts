import { Line, Tokens } from './source-parser'

const reTag = /^@\S+/

export interface Item {
  text: string
  source: Line[]
}

export type Parser = (block: Line[]) => Item[]

type Joiner = (lines: Tokens[]) => string
type Fencer = (source: string) => boolean

export interface Options {
  join: 'compact' | 'formatted' | Joiner
  fence: string | Fencer
}

export default function getParser ({ join = 'compact', fence = '```' }: Partial<Options> = {}): Parser {
  const fencer = getFencer(fence)
  const toggleFence = (source: string, isFenced: boolean): boolean => fencer(source) ? !isFenced : isFenced

  const joiner = getJoiner(join)
  const joinText = ({ source }: Item): Item => {
    const text = joiner(source.map(({ tokens }: Line) => tokens))
    return { source, text }
  }

  return function parse (block: Line[]): Item[] {
    // start with description item
    const items: Item[] = [{ text: '', source: [] }]

    let isFenced = false
    for (const line of block) {
      if (reTag.test(line.tokens.text) && !isFenced) {
        items.push({ text: '', source: [line] })
      } else {
        items[items.length - 1].source.push(line)
      }
      isFenced = toggleFence(line.tokens.text, isFenced)
    }

    return items.map(joinText)
  }
}

function getJoiner (join: 'compact' | 'formatted' | Joiner): Joiner {
  if (join === 'compact') return compactJoiner
  if (join === 'formatted') return formattedJoiner
  return join
}

function getFencer (fence: string | Fencer): Fencer {
  if (typeof fence === 'string') return (source: string) => source.split(fence).length % 2 === 0
  return fence
}

function compactJoiner (lines: Tokens[]): string {
  return lines
    .map(({ text }: Tokens) => text.trim())
    .filter(text => text !== '')
    .join(' ')
}

function formattedJoiner (lines: Tokens[]): string {
  return lines.reduce((joined, tokens: Tokens) => joined + tokens.text.trim(), '')
}
