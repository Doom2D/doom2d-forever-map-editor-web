import { type Renderer } from '../../../render/interface'
import Position from '../component/position'
import Size from '../component/size'
import Texture from '../component/texture'
import { type Entity, System } from '../minimal-ecs'

class Render extends System {
  public readonly componentsRequired = new Set<Function>([
    Position,
    Size,
    Texture,
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

  public async update(entities: Readonly<Set<Entity>>): void {
    this.entitiesLastSeenUpdate = entities.size
    entities.forEach((v) => {
      const components = this.ecs.getComponents(v)
      const pos = components.get(Position)
      const size = components.get(Size)
      const texture = components.get(Texture)
      this.rendererImplementation.render({
        x: pos.x,
        y: pos.y,
        w: size.w,
        h: size.h,
        entity: v,
        imgKey: texture.key,
      })
    })
  }

  public async saveImage(key: string, img: Readonly<HTMLImageElement>) {
    await (async () => {
      await this.rendererImplementation.saveImage(key, img)
    })()
    return true
  }
}

export default Render
