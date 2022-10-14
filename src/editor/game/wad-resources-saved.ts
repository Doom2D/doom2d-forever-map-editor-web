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

  public async save() {
    const images = await this.images.prepareImages()
    const promises: Promise<boolean>[] = []
    for (const [, v] of Object.entries(images)) {
      promises.push(
        (async () => {
          if (v.full !== undefined) {
            const infoPath = `${v.file.path.asThisEditorPath()}[INFO]`
            const fullPath = `${v.file.path.asThisEditorPath()}[FULL]`
            const viewPath = v.file.path.asThisEditorPath()
            const animationWad = this.src.loadFileAsArrayBuffer((a) =>
              compareResourcePaths(a, v.file.path)
            )
            if (animationWad === undefined)
              throw new Error('Error saving animtexture!')
            const animTexture = new AnimTexture(animationWad)
            await animTexture.init()
            const saveInfo = (async () => {
              await this.m.saveItem(
                infoPath,
                JSON.stringify(animTexture.giveInfo())
              )
              return true
            })()
            const saveFull = (async () => {
              await this.m.saveItem(fullPath, v.full)
              return true
            })()
            const saveView = (async () => {
              await this.m.saveItem(viewPath, v.buffer)
              return true
            })()
            await Promise.all([saveInfo, saveFull, saveView])
          } else {
            await this.m.saveItem(v.file.path.asThisEditorPath(), v.buffer)
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
