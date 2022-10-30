import type Dispatch from '../../../dispatch/dispatch'
import { type Renderer } from '../../../render/interface'
import ForRender from '../component/for-render'
import Position from '../component/position'
import { Selected } from '../component/selected'
import { Type } from '../component/type'
import { System } from '../minimal-ecs'

class Resize extends System {
  private readonly state: {
    entityStates: (
      | {
          clicked: 'left' | 'none' | 'right'
          base: {
            w: number
            h: number
          }
          canonical: {
            x: number
            y: number
            w: number
            h: number
          }
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
      'resizeStart',
      (
        i: Readonly<{
          direction: 'left' | 'none' | 'right'
          entity: number
          base: Readonly<{
            w: number
            h: number
          }>
          canonical: Readonly<{
            x: number
            y: number
            w: number
            h: number
          }>
        }>
      ) => {
        this.state.entityStates[i.entity] = {
          clicked: i.direction,

          base: {
            w: i.base.w,
            h: i.base.h,
          },

          canonical: {
            x: i.canonical.x,
            y: i.canonical.y,
            w: i.canonical.w,
            h: i.canonical.h,
          },
        }
      }
    )
    this.dispatch.on(
      'resizeLeft',
      (
        info: Readonly<{
          renderer: Readonly<Renderer>
          entity: number

          arrow: Readonly<{
            x: number
            y: number
            w: number
            h: number
          }>
          sprite: Readonly<{
            x: number
            y: number
            w: number
            h: number
          }>
          point: Readonly<{
            x: number
            y: number
          }>
        }>
      ) => {
        const a = this.state.entityStates[info.entity]
        if (a === undefined || a.clicked !== 'left') return
        const grids = info.sprite.w / a.base.w
        const pointGrid = Math.round(
          (info.point.x - info.sprite.x + info.arrow.w) / a.base.w
        )
        if (pointGrid > 0 && grids > 1) {
          const x = info.sprite.x + Math.abs(a.base.w)
          const w = info.sprite.w - Math.round(a.base.w)
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            w,
            entity: info.entity,
          })
          info.renderer.highlight(info.entity)
        }
        else if (pointGrid < 0) {
          const x = info.sprite.x - Math.abs(a.base.w)
          const w = info.sprite.w + Math.round(a.base.w)
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            w,
            entity: info.entity,
          })
          info.renderer.highlight(info.entity)
        }
      }
    )

    this.dispatch.on(
      'resizeRight',
      (
        info: Readonly<{
          renderer: Readonly<Renderer>
          entity: number

          arrow: Readonly<{
            x: number
            y: number
            w: number
            h: number
          }>
          sprite: Readonly<{
            x: number
            y: number
            w: number
            h: number
          }>
          point: Readonly<{
            x: number
            y: number
          }>
        }>
      ) => {
        const a = this.state.entityStates[info.entity]
        if (a === undefined || a.clicked !== 'right') return
        const grids = info.sprite.w / a.base.w
        const pointGrid = Math.round(
          (info.point.x - info.sprite.x + info.arrow.w) /
            a.base.w
        )
        if (pointGrid > grids) {
          const x = info.sprite.x
          const w = info.sprite.w + Math.round(a.base.w)
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            w,
            entity: info.entity,
          })
          info.renderer.highlight(info.entity)
        }
        else if (pointGrid < grids && grids > 1) {
          const x = info.sprite.x
          const w = info.sprite.w - Math.round(a.base.w)
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            w,
            entity: info.entity,
          })
          info.renderer.highlight(info.entity)
        }
      }
    )

    this.dispatch.on(
      'onMouseUp',
      (info: Readonly<{ e: number | undefined }>) => {
        this.state.entityStates.forEach((v) => {
          // eslint-disable-next-line no-param-reassign
          if (v !== undefined) v.clicked = 'none'
        })
      }
    )
  }

  public update(entities: Set<number>) {}
}

export { Resize }
