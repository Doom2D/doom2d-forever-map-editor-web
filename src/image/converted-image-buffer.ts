/* eslint-disable promise/avoid-new */
import * as magickwasm from '@imagemagick/magick-wasm'

import capitalize from '../utility/capitalize'

const magick = magickwasm.ImageMagick

class convertedImageBuffer {
  public constructor(
    private readonly src: ArrayBuffer,
    private readonly targetExtension: string
  ) {}

  private convertStringToEnum(str: string) {
    const s = capitalize(str)
    const key = Object.keys(magickwasm.MagickFormat).find(
      (x) => x.toLocaleLowerCase() === s.toLocaleLowerCase()
    )
    if (key === undefined) {
      throw new Error(`${str} image format is not supported!`)
    }
    return magickwasm.MagickFormat[
      Object.values(magickwasm.MagickFormat).indexOf(key.toLocaleUpperCase())
    ] as magickwasm.MagickFormat
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
  }

  private async magickWasmConvert(
    n: Readonly<ArrayBuffer>,
    f: magickwasm.MagickFormat
  ) {
    const view = new Uint8Array(n)
    const a = new Promise<Uint8Array>((resolve) => {
      magick.read(view, (img) => {
        img.write((data) => {
          resolve(data)
        }, f)
      })
    })
    const b = await a
    return b.slice().buffer
  }
}

export default convertedImageBuffer
