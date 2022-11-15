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

function ResourcePathFromGamePath(str: string, fileName = '') {
  const s1 = str.split(':')
  let source = ''
  if (s1.length > 1) source = s1[0]
  const s2 = (s1.pop() ?? str).split('\\')
  const basename = s2.pop() ?? str
  return new ResourcePath(s2, basename, source === '' ? fileName : source)
}

function ResourcePathFromRegularPath(str: string) {
  const path = pathSplit(str)
  return new ResourcePath(path.directories, path.fileName, '')
}

function ResourcePathFromEditorPath(str: string) {
  const src: string[] = []
  let basename = ''
  let fileSrc = ''
  const f = str.indexOf('[')
  const g = str.indexOf(']')
  fileSrc = f === -1 || g === -1 ? '' : str.slice(f + 1, g)
  const y = str.slice(g + 1).split('/')
  if (y.length > 1) {
    src.push(...y.slice(0, -1))
  }
  ;[basename] = y.slice(-1)
  return new ResourcePath(src, basename, fileSrc)
}

function isResourcePathFromEditorPath(str: string) {
  const j = str.indexOf('[')
  const l = str.indexOf(']')
  return j !== -1 && j === 0 && l !== -1
}

export {
  ResourcePathFromWad,
  ResourcePathFromZipObject,
  ResourcePathFromGamePath,
  ResourcePathFromRegularPath,
  ResourcePathFromEditorPath,
  isResourcePathFromEditorPath
}
