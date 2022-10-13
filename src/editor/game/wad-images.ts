/* eslint-disable promise/avoid-new */
import type { DFWad } from '../../df/resource/wad/dfwad'
import {
  FileCategories,
  type fileInfo,
} from '../../file-category/file-categories'
import Bild from '../../image/bild'

import AnimTexture from './anim-texture'

class imagesFromWad {
  public constructor(private readonly src: Readonly<DFWad>) {}

  public async prepareImages() {
    const iter = await new FileCategories(
      this.src.filesForCategorising()
    ).getCategories()
    const images: { image: HTMLImageElement; file: fileInfo }[] = []
    for (const [, v] of Object.entries(iter)) {
      if (v.type === 'image' || v.type === 'dfwad') {
        const p = async () => {
          const i = this.src.loadFileAsArrayBuffer((a) => a === v.path)
          if (i === undefined) throw new Error("Couldn't find file in DFWad!")
          let buffer: ArrayBuffer = i
          if (v.type === 'dfwad') {
            const animTexture = new AnimTexture(i)
            await animTexture.init()
            buffer = animTexture.giveFullImage()
          }
          const t = new Bild(buffer)
          await t.init()
          const imageLoad = new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image()
            const blob = new Blob([t.giveBuffer()])
            const url = window.URL.createObjectURL(blob)
            image.src = url
            image.addEventListener('load', () => {
              resolve(image)
            })
            image.addEventListener('error', () => {
              reject(new Error('Error loading image'))
            })
          })
          const image = await imageLoad
          images.push({ image, file: v })
          return true
        }

        // The only reason we have to do this is due to the imagemagick library!
        // eslint-disable-next-line no-await-in-loop
        await p()
      }
    }
    return images
  }
}

export default imagesFromWad
