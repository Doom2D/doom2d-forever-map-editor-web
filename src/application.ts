import { initializeImageMagick } from '@imagemagick/magick-wasm'

import { DFWad } from './df/resource/wad/dfwad'
import convertedMap from './editor/game/converted-map'
import ECSFromMap from './editor/game/map-as-entities'
import imagesFromWad from './editor/game/wad-images'
import EditorMap from './editor/map/map'
import { FileCategories } from './file-category/file-categories'
import ResourceManager from './resource-manager/resource-manager'

class Application {
  private readonly manager: ResourceManager

  private readonly tabs: number[] = []

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
    const imgs = new imagesFromWad(wad)
    const prepare = await imgs.prepareImages()
    const promises: Promise<unknown>[] = []
    for (const [, v] of Object.entries(prepare)) {
      const func = this.manager.saveItem(v.file.path.asThisEditorPath(false), v.image, true)
      promises.push(func)
    }
    await Promise.all(promises)
    const ecs = new ECSFromMap(parsed, src, this.manager)
    await ecs.init()
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
