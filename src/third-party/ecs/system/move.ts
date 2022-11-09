import type Dispatch from '../../../dispatch/dispatch'
import { type Renderer } from '../../../render/interface'
import ForRender from '../component/for-render'
import Moveable from '../component/moveable'
import Position from '../component/position'
import { Resizing } from '../component/resizing'
import { Selected } from '../component/selected'
import { Type } from '../component/type'
import { System } from '../minimal-ecs'

class Move extends System {
  private readonly grid = 1

  private readonly state: {
    entityStates: (
      | {
          offset: { x: number; y: number }
        }
      | undefined
    )[]
  } = {
    entityStates: [],
  }

  public readonly componentsRequired = new Set<Function>([Position, Selected])

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
        const moveable = components.get(Moveable)
        if (selected === undefined || moveable === undefined)
          throw new Error('Invalid entity!')
        if (selected.key > 0) {
          moveable.key = true
          this.state.entityStates[info.entity] = {
            offset: {
              x: Math.round(info.offset.x / this.grid) * this.grid,

              y: Math.round(info.offset.y / this.grid) * this.grid,
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
        const moveable = components.get(Moveable)
        if (selected === undefined || moveable === undefined)
          throw new Error('Invalid entity!')
        if (!moveable.key) return
        const a = this.state.entityStates[info.entity]
        if (a === undefined) return
        info.renderer.render({
          entity: info.entity,
          x: Math.round(info.point.x / this.grid) * this.grid + a.offset.x,
          y: Math.round(info.point.y / this.grid) * this.grid + a.offset.y,
        })
      }
    )
    this.dispatch.on(
      'onDragEnd',
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
        const a = this.state.entityStates[info.entity]
        if (a === undefined) return
        const components = this.ecs.getComponents(info.entity)
        const moveable = components.get(Moveable)
        if (moveable === undefined) throw new Error('Invalid entity!')
        moveable.key = false
        const pos = components.get(Position)
        if (pos === undefined) throw new Error('Invalid entity!')
        pos.set({
          x: Math.round(info.point.x / this.grid) * this.grid + a.offset.x,
          y: Math.round(info.point.y / this.grid) * this.grid + a.offset.y,
        })
      }
    )
  }

  public update() {}
}

export { Move }
