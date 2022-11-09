import type Dispatch from '../../../dispatch/dispatch'
import { type Renderer } from '../../../render/interface'
import Position from '../component/position'
import { System } from '../minimal-ecs'

class SelectPosition extends System {
  public readonly componentsRequired = new Set<Function>([Position])

  public entitiesLastSeenUpdate = -1

  public constructor(
    private readonly dispatch: Readonly<Dispatch>,
    private readonly renderer: Readonly<Renderer>
  ) {
    super()
    this.dispatch.on(
      'selectPositionStart',
      (
        a: Readonly<{
          entity: number
        }>
      ) => {
        this.renderer.selectStart(a.entity)
      }
    )
  }

  public update() {}
}

export { SelectPosition }
