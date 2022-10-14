import pathSplit from '../../../utility/split-path'
import type { WadRecord } from '../wad/wad-as-json'

import ResourcePath from './path'

function ResourcePathFromWad(p: Readonly<WadRecord>, name: string) {
  return new ResourcePath([p.parentSection].flat(), p.name, name)
}

function ResourcePathFromZipObject(k: string, name: string) {
  const path = pathSplit(k)
  return new ResourcePath(path.directories, path.fileName, name)
}

function ResourcePathFromGamePath(str: string) {
  const s1 = str.split(':')
  let source = ''
  if (s1.length > 1) source = s1[0]
  const s2 = (s1.pop() ?? str).split('\\')
  const basename = s2.pop() ?? str
  return new ResourcePath(s2, basename, source)
}

export { ResourcePathFromWad, ResourcePathFromZipObject, ResourcePathFromGamePath }
