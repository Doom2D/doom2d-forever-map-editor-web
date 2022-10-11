import type ResourcePath from '../path/path'

interface ResourceArchive {
  getFiles: () => ResourcePath[]
  loadFileAsArrayBuffer: (
    p: (a: Readonly<ResourcePath>) => boolean
  ) => ArrayBuffer | undefined
  loadFileAsString: (
    p: (a: Readonly<ResourcePath>) => boolean
  ) => string | undefined
  saveFileArrayBuffer: (path: string, content: Readonly<ArrayBuffer>) => void
  saveFileString: (path: string, content: string) => void
}

export default ResourceArchive
