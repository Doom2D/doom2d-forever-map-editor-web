/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { type Renderer } from '../../../render/interface'
import Position from '../component/position'
import Size from '../component/size'
import { type Entity, System } from '../minimal-ecs'

class Render extends System {
  public readonly componentsRequired = new Set<Function>([Position, Size])

  public entitiesLastSeenUpdate = -1

  public constructor(private readonly rendererImplementation: Renderer) {
    super()
  }

  public update(entities: Readonly<Set<Entity>>): void {
    this.entitiesLastSeenUpdate = entities.size
    this.rendererImplementation.clear()
    entities.forEach((v) => {
      const components = this.ecs.getComponents(v)
      const pos = components.get(Position)
      const size = components.get(Size)
      this.rendererImplementation.render({
        x: pos.x,
        y: pos.y,
        w: size.w,
        h: size.h,
      })
    })
  }
}

export default Render
