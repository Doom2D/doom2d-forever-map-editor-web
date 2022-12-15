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
          point: Readonly<{
            x: number
            y: number
          }>
        }>
      ) => {
        const components = this.ecs.getComponents(info.entity)
        const selected = components.get(Selected)
        const moveable = components.get(Moveable)
        const position = components.get(Position)
        if (
          selected === undefined ||
          moveable === undefined ||
          position === undefined
        )
          return
        if (selected.key > 0 && !moveable.never) {
          console.log('onDragStart', info.entity)
          moveable.key = true
          this.state.entityStates[info.entity] = {
            offset: {
              x:
                Math.round((position.x - info.point.x) / this.grid) * this.grid,

              y:
                Math.round((position.y - info.point.y) / this.grid) * this.grid,
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
        const moveable = components.get(Moveable)
        if (moveable === undefined) return
        if (!moveable.key) return
        const a = this.state.entityStates[info.entity]
        if (a === undefined) return
        const pos = components.get(Position)
        if (pos === undefined) return
        console.log('onDragStart', info.entity)
        pos.set({
          x: Math.round(info.point.x / this.grid) * this.grid + a.offset.x,
          y: Math.round(info.point.y / this.grid) * this.grid + a.offset.y,
        })
        info.renderer.render({
          entity: info.entity,

          x:
            Math.round(info.point.x / this.grid) * this.grid +
            (this.state.entityStates[info.entity]?.offset.x ?? 0),

          y:
            Math.round(info.point.y / this.grid) * this.grid +
            (this.state.entityStates[info.entity]?.offset.y ?? 0),
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
        const components = this.ecs.getComponents(info.entity)
        const moveable = components.get(Moveable)
        if (moveable === undefined) return
        moveable.key = false
        this.dispatch.dispatch('onSelectEntity', {
          entity: info.entity,
          renderer: info.renderer,
        })
      }
    )
  }

  public update() {}
}

export { Move }
