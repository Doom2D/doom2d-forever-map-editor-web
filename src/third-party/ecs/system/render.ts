import type { RenderOptions } from '../../../render/interface'
import { type Renderer } from '../../../render/interface'
import ForRender from '../component/for-render'
import Position from '../component/position'
import Size from '../component/size'
import Texture from '../component/texture'
import Type from '../component/type'
import PanelType from '../component/panel-type'
import { type Entity, System } from '../minimal-ecs'

class Render extends System {
  public readonly componentsRequired = new Set<Function>([
    Position,
    Size,
    Texture,
    ForRender,
    Type,
  ])

  public entitiesLastSeenUpdate = -1

  public constructor(
    private readonly rendererImplementation: Readonly<Renderer>
  ) {
    super()
  }

  public init() {
    this.rendererImplementation.init()
  }

  public update(entities: Readonly<Set<Entity>>): void {
    this.entitiesLastSeenUpdate = entities.size
    const renderArray: {
      ordnung: number
      opts: RenderOptions
    }[] = []
    for (const [, v] of Object.entries(Array.from(entities))) {
      const components = this.ecs.getComponents(v)
      const pos = components.get(Position)
      const size = components.get(Size)
      const texture = components.get(Texture)
      const shouldRender = components.get(ForRender)
      const type = components.get(Type)
      if (shouldRender.shouldRender()) {
        if (type.key === 'panel') {
          const typeComponent = components.get(PanelType)
          const ordnung = typeComponent.key.giveRenderOrder()
          renderArray.push({
            ordnung,

            opts: {
              x: pos.x,
              y: pos.y,
              w: size.w,
              h: size.h,
              entity: v,
              imgKey: texture.key,
            },
          })
        }
      } else {
        this.rendererImplementation.deleteEntity(v)
      }
    }
    for (const [, v] of Object.entries(
      renderArray.slice().sort((a, b) => a.ordnung - b.ordnung)
    )) {
      this.rendererImplementation.render(v.opts)
    }
  }

  public async saveImage(key: string, img: Readonly<HTMLImageElement>) {
    await (async () => {
      await this.rendererImplementation.saveImage(key, img)
    })()
    return true
  }
}

export default Render
