import type ResourcePath from '../df/resource/path/path'
import encodeString from '../utility/encode-string'

import fileCategory from './file-category'

type fileInfo = {
  path: ResourcePath
  type: 'dfwad' | 'image' | 'map' | 'unknown'
  ext: string
}

class FileCategories {
  private readonly arr: fileInfo[] = []

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
        const category = new fileCategory(buffer)
        const i = await category.determine()
        this.arr.push({
          path: v.path,
          type: i.type,
          ext: i.ext,
        })
        return true
      }
      promises.push(determine())
    }
    await Promise.allSettled(promises)
    return this.arr
  }
}

export default FileCategories
