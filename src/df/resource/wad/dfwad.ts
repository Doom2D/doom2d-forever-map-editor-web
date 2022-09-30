import { inflate } from 'pako'

import { ResourcePathFromWad } from '../path/path-from'

import type ResourceArchive from './interface'
import { wadAsJson } from './wad-as-json'

class DFWad implements ResourceArchive {
  public getFiles = () => []

  public loadFileAsArrayBuffer = () => new ArrayBuffer(0)

  public loadFileAsString = () => ''

  public saveFileArrayBuffer = () => true

  public saveFileString = () => true

  public constructor(src: Readonly<ArrayBuffer>, name = '') {
    const tryWad = wadAsJson(src)
    if (!tryWad.isValid) {
      // PANIK!1
    } else {
      for (const [, value] of Object.entries(tryWad.wadObject)) {
        if (value.type === 'parent') {
          continue
        }
        console.log(value)
        const buffer = src.slice(
          value.memAddress,
          value.memAddress + value.memLength
        )
        const inflated = inflate(buffer)
        const path = ResourcePathFromWad(value, name)
        console.log(path.asGamePath())
        console.log(path.asThisEditorPath())
        console.log(path.asGamePath(false))
        // console.log(readString(inflated.buffer, 0, inflated.length, 'win1251'))
      }
    }
  }
}

export { DFWad }
