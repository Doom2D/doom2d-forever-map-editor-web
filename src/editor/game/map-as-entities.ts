import Position from '../../third-party/ecs/component/position'
import Size from '../../third-party/ecs/component/size'
import { ECS } from '../../third-party/ecs/minimal-ecs'
import type EditorMap from '../map/map'
import Pixi from '../../render/pixi/render'
import RenderSystem from '../../third-party/ecs/system/render'
import Texture from '../../third-party/ecs/component/texture'

// more like a Tab
class ECSFromMap {
  private readonly ECS: ECS

  private readonly pixi: Pixi

  private readonly renderSystem: RenderSystem

  public constructor(
    private readonly map: Readonly<EditorMap>,
    private readonly drawSrc: Readonly<HTMLCanvasElement>
  ) {
    this.ECS = new ECS()
    this.pixi = new Pixi(this.drawSrc)
    this.renderSystem = new RenderSystem(this.pixi)
  }

  public giveECS() {
    return this.ECS
  }

  public init() {
    const msize = this.map.giveMetaInfo()
    this.pixi.resize(msize.width, msize.height)
    this.renderSystem.init()
    this.ECS.addSystem(this.renderSystem)
    for (const [, v] of Object.entries(this.map.givePanels())) {
      const entity = this.ECS.addEntity()
      const pos = v.givePosition()
      const dimensions = v.giveDimensions()
      const position = new Position(pos.x, pos.y)
      const size = new Size(dimensions.width, dimensions.height)
      const texture = new Texture(v.giveTexture().givePath().asThisEditorPath())
      this.ECS.addComponent(entity, position)
      this.ECS.addComponent(entity, size)
      this.ECS.addComponent(entity, texture)
    }
    this.ECS.update()
  }

  public async addImage(key: string, img: Readonly<HTMLImageElement>) {
    await this.renderSystem.saveImage(key, img)
  }
}

export default ECSFromMap
