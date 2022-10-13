import { DFWad } from '../df/resource/wad/dfwad'
import { checkFalcon } from '../parser/falcon/typescript-falcon'
import { checkKetmar } from '../parser/ketmar/typescript-ketmar'
import getFileType from '../utility/get-file-type'
import readString from '../utility/read-string'

import type fileType from './file-types'

class fileCategory {
  public constructor(private readonly src: Readonly<ArrayBuffer>) {}

  public async determine(): Promise<{
    type: fileType
    ext: string
  }> {
    const t = getFileType(this.src)
    const mime = t.split('/')
    if (mime[0] === 'image') {
      return {
        type: 'image',
        ext: mime[1],
      }
    }
    if (mime[0] === 'application') {
      if (mime[1] === 'octet-stream' && checkFalcon(this.src)) {
        return { type: 'map', ext: 'dfmap' }
      }
      if (mime[1] === 'octet-stream' || mime[1] === 'zip') {
        const w = new DFWad(this.src)
        await w.init(true)
        const supported = w.isSupported
        if (supported) {
          return mime[1] === 'octet-stream'
            ? { type: 'dfwad', ext: 'dfwad' }
            : {
                type: 'dfwad',
                ext: 'zip',
              }
        }
      }
    }
    if (
      mime[0] === 'text' &&
      mime[1] === 'plain' &&
      checkKetmar(readString(this.src, 0, undefined, 'win1251'))
    ) {
      return {
        type: 'map',
        ext: 'txt',
      }
    }
    return {
      type: 'unknown',
      ext: '',
    }
  }
}

export default fileCategory
