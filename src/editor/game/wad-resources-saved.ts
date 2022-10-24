import { compareResourcePaths } from '../../df/compare-names'
import type { DFWad } from '../../df/resource/wad/dfwad'
import type ResourceManager from '../../resource-manager/resource-manager'

import AnimTexture from './anim-texture'
import imagesFromWad from './wad-images'

class wadResourcesSaved {
  private saved = false

  private readonly images: imagesFromWad

  public constructor(
    private readonly src: Readonly<DFWad>,
    private readonly m: Readonly<ResourceManager>
  ) {
    this.images = new imagesFromWad(this.src)
  }

  public hasSaved() {
    return this.saved
  }

  public async save(cache: boolean, persist: boolean) {
    const images = await this.images.prepareImages()
    const promises: Promise<boolean>[] = []
    for (const [, x] of Object.entries(images)) {
      promises.push(
        (async () => {
          const v = x
          if (v.full !== undefined) {
            const animationWad = this.src.loadFileAsArrayBuffer((a) =>
              compareResourcePaths(a, v.file.path)
            )
            if (animationWad === undefined)
              throw new Error('Error saving animtexture!')
            const animTexture = new AnimTexture(animationWad)
            await animTexture.init()
            if (cache) {
              await this.m.saveItem(
                v.file.path.asThisEditorPath(false),
                v.image,
                true,
                false
              )
            }
            if (persist) {
              const infoPath = `${v.file.path.asThisEditorPath(true)}[INFO]`
              const fullPath = `${v.file.path.asThisEditorPath(true)}[FULL]`
              const saveInfo = (async () => {
                await this.m.saveItem(
                  infoPath,
                  JSON.stringify(animTexture.giveInfo()),
                  false,
                  true
                )
                return true
              })()
              const saveFull = (async () => {
                await this.m.saveItem(fullPath, v.full, false, true)
                return true
              })()
              await Promise.all([saveInfo, saveFull])
            }
          } else {
            if (cache) {
              await this.m.saveItem(
                v.file.path.asThisEditorPath(false),
                v.image,
                true,
                false
              )
            }
            if (persist) {
              await this.m.saveItem(
                v.file.path.asThisEditorPath(true),
                v.buffer,
                false,
                true
              )
            }
          }
          return true
        })()
      )
    }
    await Promise.all(promises)
    this.saved = true
    return true
  }
}

export default wadResourcesSaved
