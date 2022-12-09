import { System } from '../minimal-ecs'
import type Dispatch from '../../../dispatch/dispatch'
import { Selected } from '../component/selected'
import { type Renderer } from '../../../render/interface'
import { Highlighted } from '../component/highlighted'

class Highlight extends System {
  public readonly componentsRequired = new Set<Function>([Selected])

  public entitiesLastSeenUpdate = -1

  private readonly clicksToHighlight = 1

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'onDeselectEntity',
      (
        a: Readonly<{
          entity: number
          renderer: Readonly<Renderer>
        }>
      ) => {
        const c = this.ecs.getComponents(a.entity)
        const highlight = c.get(Highlighted)
        if (highlight === undefined) throw new Error('Invalid entity!')
        highlight.key = false
        a.renderer.clearHighlight(a.entity)
      }
    )
    this.dispatch.on(
      'onSelectEntity',
      (
        a: Readonly<{
          entity: number
          renderer: Readonly<Renderer>
        }>
      ) => {
        const c = this.ecs.getComponents(a.entity)
        const highlight = c.get(Highlighted)
        if (highlight === undefined) throw new Error('Invalid entity!')
        if (highlight.never) return
        highlight.key = true
        a.renderer.highlight(a.entity)
      }
    )
    this.dispatch.on(
      'onDragStart',
      (
        a: Readonly<{
          entity: number
          renderer: Readonly<Renderer>
        }>
      ) => {
        const c = this.ecs.getComponents(a.entity)
        const highlight = c.get(Highlighted)
        if (highlight === undefined) throw new Error('Invalid entity!')
        if (highlight.never) return
        highlight.key = true
        a.renderer.highlight(a.entity)
      }
    )
  }

  public update() {}
}

export { Highlight }
