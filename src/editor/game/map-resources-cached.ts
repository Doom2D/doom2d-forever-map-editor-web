import { compareResourceBasename, compareResourcePaths } from '../../df/compare-names'
import type { DFWad } from '../../df/resource/wad/dfwad'
import type ResourceManager from '../../resource-manager/resource-manager'
import isObject from '../../utility/is-object'
import type EditorMap from '../map/map'
import Bild from '../../image/bild'

import AnimTexture from './anim-texture'
import imagesFromWad from './wad-images'
import loadImage from '../../utility/load-image-async'

class mapResourcesCached {
  public constructor(
    private readonly src: Readonly<DFWad>,
    private readonly map: Readonly<EditorMap>,
    private readonly m: Readonly<ResourceManager>
  ) {}

  public async save(cache: boolean, persist: boolean) {
    const promises: Promise<boolean>[] = []
    const textures = this.map.giveTextures()
    for (const [, i] of Object.entries(textures)) {
      promises.push(
        (async () => {
          const x = i
          const p = x.givePath()
          if (compareResourceBasename(p, '_water_0') || compareResourceBasename(p, '_water_1') || compareResourceBasename(p, '_water_2')) {
            return false
          }
          const u = x.isAnimated()
          if (u) {
            const infoPath = `${p.asThisEditorPath(true)}[INFO]`
            const fullPath = `${p.asThisEditorPath(true)}[FULL]`

            const infoResponse = await this.m.getItem(infoPath)
            const fullResponse = await this.m.getItem(fullPath)
            if (infoResponse === null || fullResponse === null)
              throw new Error('Error loading animated texture!')
            const bild = new Bild(
              fullResponse,
              infoResponse.width,
              infoResponse.height
            )
            await bild.init()
            const image = await loadImage(bild.giveBuffer())
            await this.m.saveItem(p.asThisEditorPath(false), image, true, false)
          } else {
            const response = await this.m.getItem(p.asThisEditorPath(true))
            if (response === null)
              throw new Error('Error loading texture!')
            const bild = new Bild(response)
            await bild.init()
            const image = await loadImage(bild.giveBuffer())
            await this.m.saveItem(p.asThisEditorPath(false), image, true, false)
          }
          return true
        })()
      )
    }
    await Promise.all(promises)
    return true
  }
}

export default mapResourcesCached
