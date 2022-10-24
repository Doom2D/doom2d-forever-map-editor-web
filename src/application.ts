import { initializeImageMagick } from '@imagemagick/magick-wasm'

import { DFWad } from './df/resource/wad/dfwad'
import convertedMap from './editor/game/converted-map'
import ECSFromMap from './editor/game/map-as-entities'
import imagesFromWad from './editor/game/wad-images'
import EditorMap from './editor/map/map'
import { type RenderRulesKey } from './editor/render/rules/rules'
import { FileCategories } from './file-category/file-categories'
import ResourceManager from './resource-manager/resource-manager'

class Application {
  private readonly manager: ResourceManager

  private readonly tabs: number[] = []

  private loadedMap: ECSFromMap | undefined

  public constructor(private readonly store: string) {
    this.manager = new ResourceManager(this.store)
  }

  public registerNewTab() {
    const n = this.tabs.length
    this.tabs.push(n)
    return n
  }

  public getTabsAmount() {
    return this.tabs
  }

  public getMapJSON(src: Readonly<ArrayBuffer | string>) {
    const mapObj = new convertedMap(src)
    return mapObj.getUnparsed()
  }

  public updateRenderRule(opt: RenderRulesKey, remove: boolean) {
    if (this.loadedMap === undefined) throw new Error('Tried to change render rules before a map is loaded!')
    if (remove) {
      this.loadedMap.addRule(opt)
    } else {
      this.loadedMap.removeRule(opt)
    }
    this.loadedMap.removeChildren()
    this.loadedMap.reload()
  }

  public async saveImages(tab: number, persistent = false) {
    const wad = (await this.manager.getItem(`wad${tab}`)) as DFWad
    const imgs = new imagesFromWad(wad)
    const prepare = await imgs.prepareImages()
    const promises: Promise<unknown>[] = []
    for (const [, v] of Object.entries(prepare)) {
      if (persistent) {
        const func1 = this.manager.saveItem(
          v.file.path.asThisEditorPath(false),
          v.image,
          true,
          false
        )
        const func2 = this.manager.saveItem(
          v.file.path.asThisEditorPath(false),
          v.buffer,
          false,
          true
        )
        promises.push(func1, func2)
      } else {
        const func = this.manager.saveItem(
          v.file.path.asThisEditorPath(false),
          v.image,
          true,
          false
        )
        promises.push(func)
      }
    }
    await Promise.all(promises)
  }

  public async loadWad(tab: number, src: Readonly<ArrayBuffer>, name: string) {
    const wad = new DFWad(src, name)
    await wad.init()
    await this.manager.saveItem(`wad${tab}`, wad, true)
    return wad
  }

  public async loadMap(
    tab: number,
    path: string,
    src: Readonly<HTMLCanvasElement>
  ) {
    const wad = (await this.manager.getItem(`wad${tab}`)) as DFWad
    const file = wad.loadFileWithoutConverting(
      (x) => x.asRegularPath() === path
    )
    if (file === undefined) {
      throw new Error('Invalid map path!')
    }
    const parsed = new EditorMap(new convertedMap(file).getUnparsed())
    await this.saveImages(tab, true)
    this.loadedMap = new ECSFromMap(parsed, src, this.manager)
    await this.loadedMap.start()
  }

  public async getMaps(tab: number) {
    const wad = (await this.manager.getItem(`wad${tab}`)) as DFWad
    const files = wad.filesForCategorising()
    const categories = new FileCategories(files)
    const c = await categories.getCategories()
    return c.filter((x) => x.type === 'map').map((v) => v.path.asRegularPath())
  }

  public async init() {
    await initializeImageMagick()
    await this.manager.init()
  }
}

export default Application
