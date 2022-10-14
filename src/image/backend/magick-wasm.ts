/* eslint-disable promise/avoid-new */
import * as magickwasm from '@imagemagick/magick-wasm'

const magick = magickwasm.ImageMagick

class magickWasmImageManipulation {
  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly target: string
  ) {}

  private targetAsEnum() {
    return this.target.toLocaleUpperCase() as magickwasm.MagickFormat
  }

  public async convertToTarget() {
    const n = this.src
    const f = this.targetAsEnum()
    const view = new Uint8Array(n)
    const a = new Promise<Uint8Array>((resolve) => {
      magick.read(view, (img) => {
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

  public async crop(x = 0, y = 0, width: number, height: number) {
    const view = new Uint8Array(this.src)
    const a = new Promise<Uint8Array>((resolve) => {
      magick.read(view, (image) => {
        image.crop(width, height)
        image.write((data) => {
          resolve(data)
          image.dispose()
        }, this.targetAsEnum())
      })
    })
    const u = await a
    const r = new Blob([u])
    return await r.arrayBuffer()
  }

  public async resize(width: number, height: number) {
    const view = new Uint8Array(this.src)
    const a = new Promise<Uint8Array>((resolve) => {
      magick.read(view, (image) => {
        image.resize(width, height)
        image.write((data) => {
          resolve(data)
          image.dispose()
        }, this.targetAsEnum())
      })
    })
    const u = await a
    return u.slice().buffer
  }

  public async getImageDimensions() {
    const view = new Uint8Array(this.src)
    const a = new Promise<{ width: number; height: number }>((resolve) => {
      magick.read(view, (img) => {
        resolve({
          width: img.width,
          height: img.height,
        })
        img.dispose()
      })
    })
    return await a
  }
}

export default magickWasmImageManipulation
