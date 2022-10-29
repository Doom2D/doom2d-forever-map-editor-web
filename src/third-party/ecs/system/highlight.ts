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
          const components = this.ecs.getComponents(i)
          v.clicked = 0
          const selected = components.get(Selected)
          info.renderer.clearArrows(i)
          info.renderer.clearHighlight(i)
          if (selected === undefined) throw new Error('Invalid entity!')
          selected.key = false
        })
        const a = this.state.entityStates[entity]
        if (this.state.entityStates[entity] === undefined) {
          this.state.entityStates[entity] = {
            clicked: 1,
          }
        } else {
          a.clicked +=  1
        }
        if (a?.clicked === this.clicksToHighlight) {
          const components = this.ecs.getComponents(entity)
          const selected = components.get(Selected)
          if (selected === undefined) throw new Error('Invalid entity!')
          selected.key = true
          info.renderer.highlight(entity)
          info.renderer.addResizeArrows(entity)
        }
      }
    )
    this.dispatch.on(
      'onDragMove',
      (
        info: Readonly<{
          renderer: Readonly<Renderer>
          entity: number
          point: Readonly<{
            x: number
            y: number
          }>
        }>
      ) => {
        const components = this.ecs.getComponents(info.entity)
        const selected = components.get(Selected)
        if (selected === undefined) throw new Error('Invalid entity!')
        info.renderer.clearArrows(info.entity)
        if (selected.key) {
          info.renderer.addResizeArrows(info.entity)
        }
      }
    )
    this.dispatch.on(
      'onDragEnd',
      (
        info: Readonly<{
          renderer: Readonly<Renderer>
          entity: number
        }>
      ) => {
        const components = this.ecs.getComponents(info.entity)
        const selected = components.get(Selected)
        if (selected === undefined) throw new Error('Invalid entity!')
        info.renderer.clearArrows(info.entity)
        info.renderer.addResizeArrows(info.entity)
      }
    )
  }

  public update() {}
}

export { Highlight }
