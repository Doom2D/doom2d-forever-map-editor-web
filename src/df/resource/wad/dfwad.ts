import { inflate } from 'pako'

import {
  loadZipObject,
  loadFileFromZip,
} from '../../../third-party/jszip/wrapper'
import isBufferBinary from '../../../utility/is-buffer-binary'
import readString from '../../../utility/read-string'
import encodeString from '../../../utility/encode-string'
import type ResourcePath from '../path/path'
import {
  ResourcePathFromWad,
  ResourcePathFromZipObject,
} from '../path/path-from'

import type ResourceArchive from './interface'
import { wadAsJson } from './wad-as-json'

class DFWad implements ResourceArchive {
  public type: 'dfwad' | 'none' | 'zip' = 'none'

  public isSupported = false

  private files: {
    path: ResourcePath
    content: ArrayBuffer | string
  }[] = []

  private readonly filePaths: ResourcePath[] = []

  public getFiles = () => this.filePaths

  public loadFileWithoutConverting = (
    p: (a: Readonly<ResourcePath>) => boolean
  ) => this.loadFile(p)

  public loadFileAsArrayBuffer = (
    p: (a: Readonly<ResourcePath>) => boolean
  ) => {
    const v = this.loadFile(p)
    if (v === undefined) return undefined
    return typeof v === 'string' ? encodeString(v) : v
  }

  public loadFileAsString = (p: (a: Readonly<ResourcePath>) => boolean) => {
    const v = this.loadFile(p)
    if (v === undefined) return undefined
    return typeof v === 'string' ? v : readString(v, 0, undefined, 'win1251')
  }

  public saveFileArrayBuffer = () => true

  public saveFileString = () => true

  public filesForCategorising = () => this.files

  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly name = ''
  ) {}

  private loadFile(pred: (p: Readonly<ResourcePath>) => boolean) {
    for (const [, v] of Object.entries(this.files)) {
      if (pred(v.path)) {
        return v.content
      }
    }
    return undefined
  }

  public giveFilename() {
    return this.name
  }

  public async init(checkSupported = false) {
    const tryWad = wadAsJson(this.src)
    if (tryWad.isValid) {
      this.isSupported = true
      if (checkSupported) return true
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
        this.files = !isBufferBinary(content.buffer)
          ? this.files.concat({
              path,
              content: readString(content.buffer, 0, undefined, 'win1251'),
            })
          : this.files.concat({
              path,
              content,
            })
      }
      this.type = 'dfwad'
    } else {
      try {
        const z = await loadZipObject(this.src)
        this.isSupported = true
        if (checkSupported) return true
        const promises: Promise<boolean>[] = []
        for (const [k] of Object.entries(z.files)) {
          const handleEntry = async () => {
            const key = k
            const zip = z
            if (zip.files[key].dir) return true
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
    return true
  }
}

export { DFWad }
