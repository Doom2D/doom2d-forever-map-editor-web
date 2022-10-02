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

export { ResourcePathFromWad, ResourcePathFromZipObject }
