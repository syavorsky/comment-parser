
export function isSpace (source: string): boolean {
  return /^\s$/.test(source)
}

export function splitSpace (source: string): [string, string] {
  const matches = source.match(/^\s*/)
  return matches === null ? ['', source] : [source.slice(0, matches[0].length), source.slice(matches[0].length)]
}
