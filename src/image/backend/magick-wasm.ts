/* eslint-disable promise/avoid-new */
import * as magickwasm from '@imagemagick/magick-wasm'

import getFileType from '../../utility/get-file-type'

const magick = magickwasm.ImageMagick

class magickWasmImageManipulation {
  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly target: string
  ) {}

  private targetAsEnum() {
    return this.target.toLocaleUpperCase() as magickwasm.MagickFormat
  }

  private srcAsEnum() {
    const type = getFileType(this.src).split('/')[1]

    // for stuff like ex-tga
    const popped = type.split('-').pop() ?? type
    return popped.toLocaleUpperCase() as magickwasm.MagickFormat
  }

  private srcSettings() {
    return new magickwasm.MagickReadSettings({
      format: this.srcAsEnum()
    })
  }

  public async convertToTarget() {
    const n = this.src
    const f = this.targetAsEnum()
    const view = new Uint8Array(n)
    const a = new Promise<Uint8Array>((resolve) => {
      magick.read(view, this.srcSettings(), (img) => {
        img.autoOrient()
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
        image.autoOrient()
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
        image.autoOrient()
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
