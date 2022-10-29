import type Dispatch from '../../../dispatch/dispatch'
import { type Renderer } from '../../../render/interface'
import ForRender from '../component/for-render'
import Position from '../component/position'
import { Selected } from '../component/selected'
import { Type } from '../component/type'
import { System } from '../minimal-ecs'

class Move extends System {
  private readonly grid = 1

  private readonly state: {
    entityStates: (
      | {
          clicked: boolean
          offset: { x: number; y: number }
        }
      | undefined
    )[]
  } = {
    entityStates: [],
  }

  public readonly componentsRequired = new Set<Function>([
    Position,
    ForRender,
    Type,
  ])

  public entitiesLastSeenUpdate = -1

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'onDragStart',
      (
        info: Readonly<{
          renderer: Readonly<Renderer>
          entity: number
          offset: Readonly<{
            x: number
            y: number
          }>
        }>
      ) => {
        const components = this.ecs.getComponents(info.entity)
        const selected = components.get(Selected)
        if (selected === undefined) throw new Error('Invalid entity!')
        if (selected.key) {
          this.state.entityStates[info.entity] = {
            clicked: true,

            offset: {
              x: Math.round(info.offset.x / this.grid) * this.grid,

              y: Math.round(info.offset.y / this.grid) * this.grid,
            },
          }
        } else {
          this.state.entityStates[info.entity] = {
            clicked: false,

            offset: {
              x: 0,

              y: 0,
            },
          }
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
        const a = this.state.entityStates[info.entity]
        if (a === undefined || !a.clicked) return
        info.renderer.render({
          entity: info.entity,
          x: Math.round(info.point.x / this.grid) * this.grid + a.offset.x,
          y: Math.round(info.point.y / this.grid) * this.grid + a.offset.y,
        })
      }
    )
    this.dispatch.on('onDragEnd', (entity: number) => {
      this.state.entityStates[entity] = {
        clicked: false,
        offset: { x: 0, y: 0 },
      }
    })
  }

  public update() {}
}

export { Move }
