/* eslint-disable promise/avoid-new */
// import * as wasmi from 'wasm-imagemagick'
import * as magickwasm from '@imagemagick/magick-wasm'

import capitalize from '../utility/capitalize'
import getFileType from '../utility/get-file-type'

const magick = magickwasm.ImageMagick

class convertedImageBuffer {
  public constructor(
    private readonly src: ArrayBuffer,
    private readonly targetExtension: string
  ) {}

  private convertStringToEnum(str: string) {
    /*
    const key = Object.keys(magickwasm.MagickFormat).find(
      (x) => x.toLocaleLowerCase() === str.toLocaleLowerCase()
    )
    if (key === undefined) {
      throw new Error(`${str} image format is not supported!`)
    }
    const v = magickwasm.MagickFormat[
      Object.values(magickwasm.MagickFormat).indexOf(key.toLocaleUpperCase())
    ] as magickwasm.MagickFormat | undefined
    if (v === undefined) throw new Error(`Image type ${str} is not supported!`)
    */
    return str.toLocaleUpperCase() as magickwasm.MagickFormat
  }

  public giveInfo() {
    return {
      target: this.targetExtension,
    }
  }

  public async giveConvertedBuffer() {
    return await this.convert()
  }

  private async convert() {
    return await this.magickWasmConvert(
      this.src,
      this.convertStringToEnum(this.targetExtension)
    )
    return await this.wasmImageMagickConvert()
  }

  private async wasmImageMagickConvert() {
    const type = getFileType(this.src)
    const n = `src.${type}`
    const command = ['convert', n, `out.${this.targetExtension}`]
    const image = { name: n, content: new Uint8Array(this.src) }
    const result = await wasmi. call([image], command)
    const output = await result.outputFiles[0].blob.arrayBuffer()
    return output
  }

  private async magickWasmConvert(
    n: Readonly<ArrayBuffer>,
    f: magickwasm.MagickFormat
  ) {
    const view = new Uint8Array(n)
    const settings = new magickwasm.MagickSettings()
    const test = getFileType(view.buffer)
    const a = new Promise<Uint8Array>((resolve) => {
      magick.read(view,(img) => {
        img.write((data) => {
          resolve(data)
          img.dispose()
        }, f)
      })
    })
    const u = await a
    const r = new Blob([u])
    return await r.arrayBuffer()
  }
}

export default convertedImageBuffer
