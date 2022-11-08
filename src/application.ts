import { DFWad } from './df/resource/wad/dfwad'
import convertedMap from './editor/game/converted-map'
import ECSFromMap from './editor/game/map-as-entities'
import mapResourcesCached from './editor/game/map-resources-cached'
import wadResourcesSaved from './editor/game/wad-resources-saved'
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

  public applyInfo(data: unknown) {
    const d = this.mapDispatch()
    d.dispatch('onElementInfoApply', data)
  }

  public getTabsAmount() {
    return this.tabs
  }

  public getMapJSON(src: Readonly<ArrayBuffer | string>) {
    const mapObj = new convertedMap(src)
    return mapObj.getUnparsed()
  }

  public mapDispatch() {
    if (this.loadedMap === undefined) throw new Error('Map is not defined yet!')
    return this.loadedMap.giveDispatch()
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

  public async saveWadImages(tab: number, persistent = false) {
    const wad = (await this.manager.getItem(`wad${tab}`)) as DFWad
    const saved = new wadResourcesSaved(wad, this.manager)
    await saved.save(true, true)
  }

  public async saveMapImages(tab: number, map: Readonly<EditorMap>) {
    const wad = (await this.manager.getItem(`wad${tab}`)) as DFWad
    const cached = new mapResourcesCached(wad, map, this.manager)
    await cached.save(true, false)
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
    const unparsed = new convertedMap(file).getUnparsed()
    console.log(unparsed)
    const parsed = new EditorMap(unparsed, wad.giveFilename())
    console.log(parsed)
    await this.saveMapImages(tab, parsed)
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
    await this.manager.init()
  }
}

export default Application
