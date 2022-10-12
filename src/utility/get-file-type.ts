import * as wasmagic from 'wasmagic'

const magic = await wasmagic.WASMagic.create()

function getFileType(src: Readonly<ArrayBuffer>, full = false) {
  return magic.getMime(
    full ? new Uint8Array(src) : new Uint8Array(src).slice(0, 1024)
  )
}

export default getFileType
