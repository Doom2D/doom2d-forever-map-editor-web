import Position from '../../third-party/ecs/component/position'
import Size from '../../third-party/ecs/component/size'
import { ECS } from '../../third-party/ecs/minimal-ecs'
import type EditorMap from '../map/map'
import Pixi from '../../render/pixi/render'
import RenderSystem from '../../third-party/ecs/system/render'
import Texture from '../../third-party/ecs/component/texture'
import type ResourceManager from '../../resource-manager/resource-manager'
import ForRender from '../../third-party/ecs/component/for-render'
import Type from '../../third-party/ecs/component/type'
import PanelTypeComponent from '../../third-party/ecs/component/panel-type'
import PanelFlags from '../../third-party/ecs/component/panel-flag'
import RenderFilter from '../../third-party/ecs/system/filter-for-render'
import { type RenderRulesKey } from '../render/rules/rules'
import type Bild from '../../image/bild'

// more like a Tab
class ECSFromMap {
  private readonly ECS: ECS

  private readonly pixi: Pixi

  private readonly renderSystem: RenderSystem

  private readonly filterSystem: RenderFilter

  private renderRules: RenderRulesKey[] = []

  public constructor(
    private readonly map: Readonly<EditorMap>,
    private readonly drawSrc: Readonly<HTMLCanvasElement>,
    private readonly manager: Readonly<ResourceManager>
  ) {
    this.ECS = new ECS()
    this.pixi = new Pixi(this.drawSrc)
    this.renderSystem = new RenderSystem(this.pixi)
    this.filterSystem = new RenderFilter(this.renderRules)
  }

  public giveECS() {
    return this.ECS
  }

  public resizeRender(w: number, h: number) {
    this.pixi.resize(w, h)
  }

  public clearRender() {
    this.pixi.clear()
  }

  public addRule(x: RenderRulesKey) {
    this.renderRules.push(x)
    this.filterSystem.newRules(this.renderRules)
  }

  public removeRule(x: RenderRulesKey) {
    this.renderRules = this.renderRules.filter((i) => i !== x)
    this.filterSystem.newRules(this.renderRules)
  }

  public removeChildren() {
    this.pixi.deregisterAll()
  }

  public reload() {
    this.ECS.update()
  }

  private registerEntitiesFromMap() {
    for (const [, v] of Object.entries(this.map.givePanels())) {
      const entity = this.ECS.addEntity()
      const pos = v.givePosition()
      const dimensions = v.giveDimensions()
      const position = new Position(pos.x, pos.y)
      const size = new Size(dimensions.width, dimensions.height)
      const pathStr = v.giveTexture().givePath().asThisEditorPath(false)
      const texture = new Texture(pathStr)
      const shouldRender = new ForRender(false)
      const typeComponent = new PanelTypeComponent(v.giveType())
      const flagComponent = new PanelFlags(v.giveFlag())
      const type = new Type('panel')
      this.ECS.addComponent(entity, position)
      this.ECS.addComponent(entity, size)
      this.ECS.addComponent(entity, texture)
      this.ECS.addComponent(entity, shouldRender)
      this.ECS.addComponent(entity, type)
      this.ECS.addComponent(entity, typeComponent)
      this.ECS.addComponent(entity, flagComponent)
    }
  }

  public async start() {
    this.registerEntitiesFromMap()
    await this.init()
  }

  public async init() {
    this.renderSystem.init()
    this.ECS.addSystem(this.filterSystem)
    this.ECS.addSystem(this.renderSystem)
    const info = this.map.giveMetaInfo()
    this.resizeRender(this.drawSrc.width, this.drawSrc.height)
    await this.cacheImagesForRender()
    this.ECS.update()
  }

  public async cacheImagesForRender() {
    const promises: Promise<void>[] = []
    for (const [, v] of Object.entries(this.map.giveTextures())) {
      const pathStr = v.givePath().asThisEditorPath(false)
      const cacheImage = (async () => {
        const x = pathStr
        const element = await this.manager.getItem(x) as HTMLImageElement | null
        if (element === null) return
        await this.renderSystem.saveImage(x, element)
      })()
      promises.push(cacheImage)
    }
    await Promise.allSettled(promises)
  }

  public async addImage(key: string, img: Readonly<HTMLImageElement>) {
    await this.renderSystem.saveImage(key, img)
  }
}

export default ECSFromMap
