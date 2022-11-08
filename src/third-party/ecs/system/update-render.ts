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
      async (
        data: Readonly<{
          entity: number
        }>
      ) => {
        const c = this.ecs.getComponents(data.entity)
        const pos = c.get(Position)
        const size = c.get(Size)
        if (pos === undefined || size === undefined)
          throw new Error('Invalid entity!')

        const components = this.ecs.getComponents(data.entity)
        const selected = components.get(Selected)
        this.dispatch.dispatch('updateRender', {
          entities: [data.entity],
        })
        this.render.clearArrows(data.entity)
        await this.render.clearHighlight(data.entity)
        if (selected === undefined) throw new Error('Invalid entity!')
        if (selected.key) {
          await this.render.highlight(data.entity)
          await this.render.addResizeArrows(data.entity)
        }
      }
    )
  }

  public update() {}
}

export { UpdateRender }
