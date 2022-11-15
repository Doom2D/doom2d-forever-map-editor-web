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
          entity: number | undefined
        }>
      ) => {
        this.dispatch.dispatch('updateRender', {
          entities: [data.entity],
        })
      }
    )
  }

  public update() {}
}

export { UpdateRender }
