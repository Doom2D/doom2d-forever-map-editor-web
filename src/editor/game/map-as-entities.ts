import Position from '../../third-party/ecs/component/position'
import Size from '../../third-party/ecs/component/size'
import { ECS } from '../../third-party/ecs/minimal-ecs'
import type EditorMap from '../map/map'
import Pixi from '../../render/pixi/render'
import RenderSystem from '../../third-party/ecs/system/render'
import Texture from '../../third-party/ecs/component/texture'
import SortedMapElements from '../render/sorted/sorted'
import { RenderRules } from '../render/rules/rules'
import type ResourceManager from '../../resource-manager/resource-manager'

// more like a Tab
class ECSFromMap {
  private readonly ECS: ECS

  private readonly pixi: Pixi

  private readonly renderSystem: RenderSystem

  private readonly sortedElements: SortedMapElements

  public constructor(
    private readonly map: Readonly<EditorMap>,
    private readonly drawSrc: Readonly<HTMLCanvasElement>,
    private readonly manager: Readonly<ResourceManager>
  ) {
    this.ECS = new ECS()
    this.pixi = new Pixi(this.drawSrc)
    this.renderSystem = new RenderSystem(this.pixi)
    this.sortedElements = new SortedMapElements(this.map, [
      RenderRules.RENDER_HIDDEN,
    ])
  }

  public giveECS() {
    return this.ECS
  }

  public resizeRender(w: number, h: number) {
    this.pixi.resize(w, h)
  }

  public async init() {
    this.renderSystem.init()
    this.ECS.addSystem(this.renderSystem)
    const info = this.map.giveMetaInfo()
    this.resizeRender(info.width, info.height)
    const promises: Promise<void>[] = []
    for (const [, v] of Object.entries(this.sortedElements.givePanels())) {
      const entity = this.ECS.addEntity()
      const pos = v.givePosition()
      const dimensions = v.giveDimensions()
      const position = new Position(pos.x, pos.y)
      const size = new Size(dimensions.width, dimensions.height)
      const pathStr = v.giveTexture().givePath().asThisEditorPath(false)
      const texture = new Texture(pathStr)
      const cacheimg = (async () => {
        const element = await this.manager.getItem(pathStr)
        await this.renderSystem.saveImage(pathStr, element)
        await this.pixi.registerEntity(entity, pathStr)
      })()
      promises.push(cacheimg)
      this.ECS.addComponent(entity, position)
      this.ECS.addComponent(entity, size)
      this.ECS.addComponent(entity, texture)
    }
    await Promise.allSettled(promises)
    this.ECS.update()
  }

  public async addImage(key: string, img: Readonly<HTMLImageElement>) {
    await this.renderSystem.saveImage(key, img)
  }
}

export default ECSFromMap
