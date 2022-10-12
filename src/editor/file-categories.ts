import type ResourcePath from '../df/resource/path/path'
import { DFWad } from '../df/resource/wad/dfwad'
import { checkFalcon } from '../parser/falcon/typescript-falcon'
import { checkKetmar } from '../parser/ketmar/typescript-ketmar'
import encodeString from '../utility/encode-string'
import getFileType from '../utility/get-file-type'
import readString from '../utility/read-string'

type fileType = {
  path: ResourcePath
  type: 'dfwad' | 'image' | 'map' | 'unknown'
  ext: string
}

class FileCategories {
  private readonly arr: fileType[] = []

  public constructor(
    private readonly files: {
      path: ResourcePath
      content: Readonly<ArrayBuffer> | string
    }[]
  ) {}

  public async getCategories() {
    const promises: Promise<boolean>[] = []
    for (const [, file] of Object.entries(this.files)) {
      const determine = async () => {
        const v = file
        const buffer =
          typeof v.content === 'string' ? encodeString(v.content) : v.content
        const t = getFileType(buffer)
        const mime = t.split('/')
        if (mime[0] === 'image') {
          this.arr.push({
            path: v.path,
            type: 'image',
            ext: mime[1],
          })
        } else if (mime[0] === 'application') {
          if (mime[1] === 'octet-stream' && checkFalcon(buffer)) {
            this.arr.push({
              path: v.path,
              type: 'map',
              ext: 'dfmap',
            })
          } else if (
            (mime[1] === 'octet-stream' && typeof v.content !== 'string') ||
            mime[1] === 'zip'
          ) {
            const w = new DFWad(buffer)
            await w.init(true)
            const supported = w.isSupported
            if (supported) {
              if (mime[1] === 'octet-stream') {
                this.arr.push({
                  path: v.path,
                  type: 'dfwad',
                  ext: 'dfwad',
                })
              } else {
                this.arr.push({
                  path: v.path,
                  type: 'dfwad',
                  ext: 'zip',
                })
              }
            }
          }
        } else if (
          mime[0] === 'text' &&
          mime[1] === 'plain' &&
          checkKetmar(readString(buffer, 0, undefined, 'win1251'))
        ) {
          this.arr.push({
            path: v.path,
            type: 'map',
            ext: 'txt',
          })
        }
        return true
      }
      promises.push(determine())
    }
    await Promise.allSettled(promises)
    return this.arr
  }
}

export default FileCategories
