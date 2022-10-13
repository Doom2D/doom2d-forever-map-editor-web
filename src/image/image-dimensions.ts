/* eslint-disable promise/avoid-new */
import * as magickwasm from '@imagemagick/magick-wasm'

const magick = magickwasm.ImageMagick

class imageDimensions {
  public constructor(private readonly src: ArrayBuffer) {}

  public async giveInfo() {
    return await this.getImageDimensions()
  }

  private async getImageDimensions() {
    const view = new Uint8Array(this.src)
    const a = new Promise<{ width: number; height: number }>((resolve) => {
      magick.read(view, (img) => {
        resolve({
          width: img.width,
          height: img.height,
        })
      })
    })
    return await a
  }
}

export default imageDimensions
