import type ResourcePath from '../path/path'

interface ResourceArchive {
  getFiles: () => ResourcePath[]
  loadFileAsArrayBuffer: (f: string) => ArrayBuffer
  loadFileAsString: (f: string) => string
  saveFileArrayBuffer: (path: string, content: Readonly<ArrayBuffer>) => void
  saveFileString: (path: string, content: string) => void
}

export default ResourceArchive
