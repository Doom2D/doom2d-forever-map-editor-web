import { System } from '../minimal-ecs'
import ForRender from '../component/for-render'
import Position from '../component/position'
import { Type } from '../component/type'
import type Dispatch from '../../../dispatch/dispatch'
import { Selected } from '../component/selected'
import { type Renderer } from '../../../render/interface'
import { Resizing } from '../component/resizing'

class Select extends System {
  public readonly componentsRequired = new Set<Function>([
    Position,
    ForRender,
    Type,
  ])

  public entitiesLastSeenUpdate = -1

  private readonly clicksToHighlight = 1

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'onMouseInAir',
      (info: { entity: number; renderer: Readonly<Renderer> }) => {
        for (const [, v] of Object.entries(
          Array.from(this.ecs.getEntitiesWithComponent(new Set([Selected])))
        )) {
          const j = this.ecs.getComponents(v)
          const k = j.get(Selected)
          if (k === undefined) throw new Error('Invalid entity!')
          if (k.key > 0) {
            this.dispatch.dispatch('onDeselectEntity', {
              entity: v,
              renderer: info.renderer,
            })
            k.key = 0
          }
        }
      }
    )
    this.dispatch.on(
      'onDragStart',
      (info: Readonly<{ entity: number; renderer: Readonly<Renderer> }>) => {
        const entity = info.entity
        const components = this.ecs.getComponents(entity)
        const selected = components.get(Selected)
        if (selected === undefined) throw new Error('Invalid entity!')
        if (!selected.never) {
          selected.key += 1
        }
        for (const [, v] of Object.entries(
          Array.from(this.ecs.getEntitiesWithComponent(new Set([Selected])))
        )) {
          if (v === info.entity) continue
          const j = this.ecs.getComponents(v)
          const k = j.get(Selected)
          if (k === undefined) throw new Error('Invalid entity!')
          this.dispatch.dispatch('onDeselectEntity', {
            entity: v,
            renderer: info.renderer,
          })
          k.key = 0
        }
        console.log('onDragStart', selected, entity)
        console.log(this.dispatch)
        if (selected.key >= this.clicksToHighlight) {
          this.dispatch.dispatch('onSelectEntity', {
            entity,
            renderer: info.renderer,
          })
        }
      }
    )
  }

  public update() {}
}

export { Select }
