import type Dispatch from '../../../dispatch/dispatch'
import { type Renderer } from '../../../render/interface'
import Position from '../component/position'
import { Selected } from '../component/selected'
import Size from '../component/size'
import { System } from '../minimal-ecs'

class UpdateRender extends System {
  public readonly componentsRequired = new Set<Function>([Position])

  public entitiesLastSeenUpdate = -1

  public constructor(
    private readonly dispatch: Readonly<Dispatch>,
    private readonly render: Readonly<Renderer>
  ) {
    super()
    this.dispatch.on(
      'shouldUpdateRender',
      (
        data: Readonly<{
          entity: Readonly<number[] | number | undefined>
        }>
      ) => {
        this.dispatch.dispatch('updateRender', {
          entities: [data.entity ?? []].flat(),
        })
      }
    )
    this.dispatch.on(
      'shouldUpdateRenderEntity',
      (data: Readonly<{ entity: number[] }>) => {
        for (const entity of data.entity) {
          const components = this.ecs.getComponents(entity)
          const pos = components.get(Position)
          const size = components.get(Size)
          if (pos === undefined || size === undefined) continue
          this.render.render({
            entity,
            x: pos.x,
            y: pos.y,
            w: size.w,
            h: size.h,
          })
        }
      }
    )
  }

  public update() {}
}

export { UpdateRender }
