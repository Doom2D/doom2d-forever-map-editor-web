import { inflate } from 'pako'

import {
  loadZipObject,
  loadFileFromZip,
} from '../../../third-party/jszip/wrapper'
import isBufferBinary from '../../../utility/is-buffer-binary'
import readString from '../../../utility/read-string'
import pathSplit from '../../../utility/split-path'
import ResourcePath from '../path/path'
import {
  ResourcePathFromWad,
  ResourcePathFromZipObject,
} from '../path/path-from'

import type ResourceArchive from './interface'
import { wadAsJson } from './wad-as-json'

class DFWad implements ResourceArchive {
  public type: 'dfwad' | 'none' | 'zip' = 'none'

  public isSupported = false

  public files: {
    path: ResourcePath
    content: ArrayBuffer | string
  }[] = []

  private readonly filePaths: ResourcePath[] = []

  public getFiles = () => this.filePaths

  public loadFileAsArrayBuffer = () => new ArrayBuffer(0)

  public loadFileAsString = (f: string) => ''

  public saveFileArrayBuffer = () => true

  public saveFileString = () => true

  public constructor(private readonly src: Readonly<ArrayBuffer>, private readonly name = '') {}

  public async init() {
    const tryWad = wadAsJson(this.src)
    if (tryWad.isValid) {
      this.isSupported = true
      for (const [, value] of Object.entries(tryWad.wadObject)) {
        if (value.type === 'parent') {
          continue
        }
        const buffer = this.src.slice(
          value.memAddress,
          value.memAddress + value.memLength
        )
        const content = inflate(buffer)
        const path = ResourcePathFromWad(value, this.name)
        this.filePaths.push(path)
        if (!isBufferBinary(content.buffer)) {
          this.files = this.files.concat({
            path,
            content: readString(content.buffer, 0, undefined, 'win1251'),
          })
        } else {
          this.getFiles = () => this.getFiles().concat(path)
          this.files = this.files.concat({
            path,
            content,
          })
        }
      }
      this.type = 'dfwad'
    } else {
      try {
        const zip = await loadZipObject(this.src)
        this.isSupported = true
        const promises: Promise<boolean>[] = []
        for (const [key] of Object.entries(zip.files)) {
          const handleEntry = async () => {
            const path = ResourcePathFromZipObject(key, this.name)
            this.filePaths.push(path)
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const content = (await loadFileFromZip(
              zip,
              key,
              'uint8array'
            )) as Uint8Array
            if (isBufferBinary(content.buffer)) {
              this.files = this.files.concat({
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
              this.files = this.files.concat({
                path,
                content: contentString,
              })
            }
            return true
          }
          promises.push(handleEntry())
        }
        await Promise.all(promises)
        this.type = 'zip'
      } catch {
        this.isSupported = false
      }
    }
    if (this.isSupported) {
      this.loadFileAsString = (f: string) => {
        const split = pathSplit(f)
        const path = new ResourcePath(split.directories, split.fileName, '')
        const v = this.files
          .filter((q) => q.path.getBaseName() === path.getBaseName())
          .pop()
        if (!v) return ''
        if (typeof v.content === 'string') return v.content
        return readString(v.content, 0, undefined, 'win1251')
      }
    }
    return true
  }
}

export { DFWad }
