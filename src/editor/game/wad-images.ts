/* eslint-disable promise/avoid-new */
import { compareResourcePaths } from '../../df/compare-names'
import type { DFWad } from '../../df/resource/wad/dfwad'
import {
  FileCategories,
  type fileInfo,
} from '../../file-category/file-categories'
import Bild from '../../image/bild'
import AnimTextureWrapper from '../../image/sheet-wrapper/sheet-wrapper'
import loadImage from '../../utility/load-image-async'

import AnimTexture from './anim-texture'

class imagesFromWad {
  public constructor(private readonly src: Readonly<DFWad>) {}

  public async prepareImages() {
    const iter = await new FileCategories(
      this.src.filesForCategorising()
    ).getCategories()
    const images: {
      full?: Readonly<ArrayBuffer>
      buffer: Readonly<ArrayBuffer>
      image: HTMLImageElement
      file: fileInfo
    }[] = []
    for (const [, v] of Object.entries(iter)) {
      if (v.type === 'image' || v.type === 'dfwad') {
        const p = async () => {
          const i = this.src.loadFileAsArrayBuffer((a) =>
            compareResourcePaths(a, v.path)
          )
          if (i === undefined) throw new Error("Couldn't find file in DFWad!")
          let buffer: ArrayBuffer = i
          if (v.type === 'dfwad') {
            const animTexture = new AnimTexture(i)
            await animTexture.init()
            buffer = animTexture.giveFullImage()
            const info = animTexture.giveInfo()
            const t = new AnimTextureWrapper(buffer, info.width, info.height)
            await t.init()
            const image = await loadImage(t.giveBuffer())
            images.push({
              full: t.giveBufferFull(),
              buffer: t.giveBuffer(),
              image,
              file: v,
            })
          } else {
            const t = new Bild(buffer)
            await t.init()
            const image = await loadImage(t.giveBuffer())
            images.push({ buffer: t.giveBuffer(), image, file: v })
          }
          return true
        }

        // The only reason we have to do this is due to the imagemagick library!
        // eslint-disable-next-line no-await-in-loop
        await p()
      }
    }
    console.log(images)
    return images
  }
}

export default imagesFromWad
