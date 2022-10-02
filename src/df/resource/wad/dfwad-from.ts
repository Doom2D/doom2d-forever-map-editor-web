import { inflate } from 'pako'

import {
  loadFileFromZip,
  loadZipObject,
} from '../../../third-party/jszip/wrapper'
import isBufferBinary from '../../../utility/is-buffer-binary'
import readString from '../../../utility/read-string'
import pathSplit from '../../../utility/split-path'
import ResourcePath from '../path/path'
import {
  ResourcePathFromWad,
  ResourcePathFromZipObject,
} from '../path/path-from'

import { DFWad } from './dfwad'
import { wadAsJson } from './wad-as-json'

async function DFWadFrom(src: Readonly<ArrayBuffer>, name = '') {
  const wad = new DFWad()
  const tryWad = wadAsJson(src)
  if (tryWad.isValid) {
    wad.isSupported = true
    for (const [, value] of Object.entries(tryWad.wadObject)) {
      if (value.type === 'parent') {
        continue
      }
      const buffer = src.slice(
        value.memAddress,
        value.memAddress + value.memLength
      )
      const content = inflate(buffer)
      const path = ResourcePathFromWad(value, name)
      wad.getFiles = () => wad.getFiles().concat(path)
      if (!isBufferBinary(content.buffer)) {
        wad.files = wad.files.concat({
          path,
          content: readString(content.buffer, 0, content.length, 'win1251'),
        })
      } else {
        wad.getFiles = () => wad.getFiles().concat(path)
        wad.files = wad.files.concat({
          path,
          content,
        })
      }
    }
  } else {
    const zip = await loadZipObject(src)
    wad.isSupported = true
    const promises: Promise<boolean>[] = []
    for (const [key] of Object.entries(zip.files)) {
      const handleEntry = async () => {
        const path = ResourcePathFromZipObject(key, name)
        wad.getFiles = () => wad.getFiles().concat(path)
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const content = (await loadFileFromZip(
          zip,
          key,
          'uint8array'
        )) as Uint8Array
        if (isBufferBinary(content.buffer)) {
          wad.files = wad.files.concat({
            path,
            content,
          })
        } else {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const contentString = (await loadFileFromZip(
            zip,
            key,
            'string'
          )) as string
          wad.files = wad.files.concat({
            path,
            content: contentString,
          })
        }
        return true
      }
      promises.push(handleEntry())
    }
    await Promise.all(promises)
  }
  wad.loadFileAsString = (f: string) => {
    const split = pathSplit(f)
    const path = new ResourcePath(
      split.directories,
      split.fileName,
      ''
    )
    const v = wad.files
      .filter((q) => q.path.getBaseName() === path.getBaseName()).pop()
    if (!v) return ''
    if (typeof v.content === 'string') return v.content
    return readString(v.content, 0, new Uint8Array(v.content).length, 'win1251')
  }
  return wad
}

export default DFWadFrom
