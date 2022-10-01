import type ResourcePath from '../path/path'

import type ResourceArchive from './interface'

class DFWad implements ResourceArchive {
  public isSupported = false

  public files: {
    path: ResourcePath
    content: ArrayBuffer | string
  }[] = []

  public getFiles = () => [] as ResourcePath[]

  public loadFileAsArrayBuffer = () => new ArrayBuffer(0)

  public loadFileAsString = (f: string) => ''

  public saveFileArrayBuffer = () => true

  public saveFileString = () => true
}

export { DFWad }
