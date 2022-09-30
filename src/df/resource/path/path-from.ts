import pathSplit from '../../../utility/split-path'
import type { WadRecord } from '../wad/wad-as-json'

import ResourcePath from './path'

function ResourcePathFromWad(p: Readonly<WadRecord>, name: string) {
  return new ResourcePath([p.parentSection].flat(), p.name, name)
}

function ResourcePathFromZip(p: string) {
  const path = pathSplit(p)
  return new ResourcePath(path.directory, path.fileName)
}

export { ResourcePathFromWad, ResourcePathFromZip }
