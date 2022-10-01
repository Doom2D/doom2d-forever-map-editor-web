import { inflate } from 'pako'
import * as JSZip from 'jszip'

import isBufferBinary from '../../../utility/is-buffer-binary'
import readString from '../../../utility/read-string'
import type ResourcePath from '../path/path'
import { ResourcePathFromWad } from '../path/path-from'

import type ResourceArchive from './interface'
import { wadAsJson } from './wad-as-json'

class DFWad implements ResourceArchive {
  public isSupported = false

  private readonly files: {
    path: ResourcePath
    content: ArrayBuffer | string
  }[] = []

  public getFiles = () => [] as ResourcePath[]

  public loadFileAsArrayBuffer = () => new ArrayBuffer(0)

  public loadFileAsString = () => ''

  public saveFileArrayBuffer = () => true

  public saveFileString = () => true

  public constructor(src: Readonly<ArrayBuffer>, name = '') {
    const tryWad = wadAsJson(src)
    if (tryWad.isValid) {
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
        this.getFiles = () => this.getFiles().concat(path)
        if (!isBufferBinary(content.buffer)) {
          this.files = this.files.concat({
            path,
            content: readString(content.buffer, 0, content.length, 'win1251'),
          })
        } else {
          this.getFiles = () => this.getFiles().concat(path)
          this.files = this.files.concat({
            path,
            content,
          })
        }
      }
    }
  }
}

export { DFWad }
