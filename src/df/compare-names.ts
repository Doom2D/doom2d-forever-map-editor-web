import withoutExtension from '../utility/without-extension'

import type ResourcePath from './resource/path/path'

function compareResourceDirectory(
  p: Readonly<ResourcePath>,
  s: Readonly<string[]>
) {
  const d = p.getParent()
  let i = 0
  for (const [, v] of Object.entries(d)) {
    if (v.toLocaleLowerCase() !== s[i].toLocaleLowerCase()) return false
    i += 1
  }
  return d.length === s.length
}

function compareResourceBasename(p: Readonly<ResourcePath>, s: string) {
  const n = withoutExtension(s).basename
  const b = p.getBaseName()
  return (
    withoutExtension(b).basename.toLocaleLowerCase() === n.toLocaleLowerCase()
  )
}

function compareResourceArchiveNames(s1: string, s2: string) {
  const n1 = withoutExtension(s1).basename.toLowerCase()
  const n2 = withoutExtension(s2).basename.toLowerCase()
  return n1 === n2
}

export {
  compareResourceBasename,
  compareResourceDirectory,
  compareResourceArchiveNames,
}
