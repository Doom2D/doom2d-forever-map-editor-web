import { System } from '../minimal-ecs'
import ForRender from '../component/for-render'
import Position from '../component/position'
import { Type } from '../component/type'
import type Dispatch from '../../../dispatch/dispatch'
import { Selected } from '../component/selected'
import { type Renderer } from '../../../render/interface'

class Highlight extends System {
  public readonly componentsRequired = new Set<Function>([
    Position,
    ForRender,
    Type,
  ])

  public entitiesLastSeenUpdate = -1

  private readonly clicksToHighlight = 2

  private readonly state: {
    entityStates: (
      | {
          clicked: number
        }
      | undefined
    )[]
  } = {
    entityStates: [],
  }

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'onDragStart',
      (info: { entity: number; renderer: Readonly<Renderer> }) => {
        const entity = info.entity
        this.state.entityStates.forEach((v, i) => {
          if (v === undefined || i === entity) return
          const p = v
          p.clicked = 0
          const components = this.ecs.getComponents(i)
          const selected = components.get(Selected)
          console.log(selected)
          if (selected === undefined) throw new Error('Invalid entity!')
          selected.key = false
          info.renderer.clearChildren(i)
        })
        const a = this.state.entityStates[entity]
        if (this.state.entityStates[entity] === undefined) {
          this.state.entityStates[entity] = {
            clicked: 1,
          }
        } else {
          a.clicked += 1
        }
        if (a?.clicked === this.clicksToHighlight) {
          const components = this.ecs.getComponents(entity)
          const selected = components.get(Selected)
          if (selected === undefined) throw new Error('Invalid entity!')
          selected.key = true
          info.renderer.highlight(entity)
        }
      }
    )
  }

  public update() {}
}

export { Highlight }
