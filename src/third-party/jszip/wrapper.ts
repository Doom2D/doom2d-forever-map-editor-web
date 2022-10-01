import * as JSZip from 'jszip'

async function loadZipObject(src: Readonly<ArrayBuffer>) {
  const newZip = new JSZip()
  return await newZip.loadAsync(src)
}

async function loadFileFromZip(
  zip: Readonly<JSZip>,
  path: string,
  how: 'string' | 'uint8array'
) {
  const b = await zip.file(path)?.async(how)
  return b ?? new Uint8Array(new ArrayBuffer(0))
}

export { loadZipObject, loadFileFromZip }
