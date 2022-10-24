import { compareResourcePaths } from '../../df/compare-names'
import type { DFWad } from '../../df/resource/wad/dfwad'
import type ResourceManager from '../../resource-manager/resource-manager'
import isObject from '../../utility/is-object'
import type EditorMap from '../map/map'

import AnimTexture from './anim-texture'
import imagesFromWad from './wad-images'

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
          const u = x.isAnimated()
          if (u) {
            const infoPath = `${p.asThisEditorPath(true)}[INFO]`
            const fullPath = `${p.asThisEditorPath(true)}[FULL]`

            // TODO Add serialization for AnimTexture info
            const infoResponse = await this.m.getItem(infoPath)
            const fullResponse = await this.m.getItem(fullPath)
          } else {
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
