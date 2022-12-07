/* eslint-disable max-lines */
import { System } from '../minimal-ecs'
import ForRender from '../component/for-render'
import Position from '../component/position'
import { Type } from '../component/type'
import type Dispatch from '../../../dispatch/dispatch'
import { Selected } from '../component/selected'
import { type Renderer } from '../../../render/interface'
import Resizeable from '../component/resizeable'
import { Resizing } from '../component/resizing'
import Size from '../component/size'
import { Highlighted } from '../component/highlighted'
import Moveable from '../component/moveable'

class StartResizing extends System {
  public readonly componentsRequired = new Set<Function>([Resizeable, Resizing])

  public entitiesLastSeenUpdate = -1

  private readonly state = {
    entityStates: new Map<number, Map<number, string>>(),
  }

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'resizeStart',
      (
        info: Readonly<{
          entity: number
          dir: string
        }>
      ) => {
        const c = this.ecs.getComponents(info.entity)
        const resizing = c.get(Resizing)
        const resizeable = c.get(Resizeable)
        if (resizing === undefined || resizeable === undefined)
          throw new Error('Invalid entity!')
        if (!resizeable.key) return
        resizing.key = true
      }
    )
    this.dispatch.on(
      'onDeselectEntity',
      (
        a: Readonly<{
          entity: number
          renderer: Readonly<Renderer>
        }>
      ) => {
        const c = this.ecs.getComponents(a.entity)
        const resizing = c.get(Resizing)
        const resizeable = c.get(Resizeable)
        if (resizing === undefined || resizeable === undefined) return
        resizing.key = false
        resizeable.key = false
        this.clearArrows(a.entity)
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
        const resizing = c.get(Resizing)
        const resizeable = c.get(Resizeable)
        if (resizing === undefined || resizeable === undefined) return
        if (resizeable.never) return
        resizeable.key = true
        this.addResizeArrows(a.entity)
      }
    )
    this.dispatch.on(
      'onDragStart',
      (
        data: Readonly<{
          entity: number
          renderer: Readonly<Renderer>
          point: Readonly<{
            x: number
            y: number
          }>
        }>
      ) => {
        for (const [, v] of Object.entries(
          Array.from(this.state.entityStates)
        )) {
          const c = this.ecs.getComponents(v[0])
          const position = c.get(Position)
          const size = c.get(Size)
          const resizing = c.get(Resizing)
          if (
            position === undefined ||
            size === undefined ||
            resizing === undefined
          )
            continue
          for (const [, vv] of Object.entries(Array.from(v[1]))) {
            if (vv[0] === data.entity) {
              console.log('resizeStart')
              ;[, resizing.dir] = vv
              this.dispatch.dispatch('resizeStart', {
                dir: vv[1],
                entity: v[0],
              })
            }
          }
        }
      }
    )
    this.dispatch.on(
      'onMouseUpGeneral',
      (
        data: Readonly<{
          renderer: Readonly<Renderer>
          entity: number
        }>
      ) => {
        for (const [, v] of Object.entries(
          Array.from(this.state.entityStates)
        )) {
          const c = this.ecs.getComponents(v[0])
          const position = c.get(Position)
          const size = c.get(Size)
          const resizing = c.get(Resizing)
          if (
            position === undefined ||
            size === undefined ||
            resizing === undefined
          )
            continue
          resizing.dir = 'none'
          for (const [, vv] of Object.entries(Array.from(v[1]))) {
            if (vv[0] === data.entity) {
              this.dispatch.dispatch('resizeEnd1', {
                dir: vv[1],
                entity: v[0],
              })
            }
          }
        }
      }
    )
    this.dispatch.on(
      'onMouseInAir',
      (
        data: Readonly<{
          renderer: Readonly<Renderer>
          entity: number
        }>
      ) => {
        for (const [, v] of Object.entries(
          Array.from(this.state.entityStates)
        )) {
          const c = this.ecs.getComponents(v[0])
          const position = c.get(Position)
          const size = c.get(Size)
          const resizing = c.get(Resizing)
          if (
            position === undefined ||
            size === undefined ||
            resizing === undefined
          )
            continue
          resizing.dir = 'none'
          for (const [, vv] of Object.entries(Array.from(v[1]))) {
            if (vv[0] === data.entity) {
              this.dispatch.dispatch('resizeEnd1', {
                dir: vv[1],
                entity: v[0],
              })
            }
          }
        }
      }
    )
  }

  private clearArrows(entity: number) {
    const l = this.state.entityStates.get(entity)
    if (l === undefined) return
    for (const v of l) {
      const c = this.ecs.getComponents(v[0])
      const type = c.get(Type)
      const render = c.get(ForRender)
      if (type === undefined || render === undefined)
        throw new Error('Invalid entity!')
      render.setForRender(false)
      this.ecs.removeEntity(v[0])
    }
  }

  private addResizeArrows(entity: number) {
    if (this.state.entityStates.get(entity) !== undefined) return
    const components = this.ecs.getComponents(entity)
    const position = components.get(Position)
    const size = components.get(Size)
    const resizeable = components.get(Resizeable)
    if (
      position === undefined ||
      size === undefined ||
      resizeable === undefined
    )
      throw new Error('Invalid entity!')
    const set = new Map<number, string>()
    const addArrow = (
      callback: string,
      offset: Readonly<{
        w: number
        h: number
      }>,
      s: Readonly<{
        w: number
        h: number
      }>
    ) => {
      const e = this.ecs.addEntity()
      this.ecs.addComponent(e, new ForRender(true))
      this.ecs.addComponent(e, new Type('support'))
      this.ecs.addComponent(
        e,
        new Position(position.x + offset.w, position.y + offset.h)
      )
      this.ecs.addComponent(e, new Size(s.w, s.h))
      this.ecs.addComponent(e, new Selected(0, true))
      this.ecs.addComponent(e, new Highlighted(false, true))
      this.ecs.addComponent(e, new Moveable(false, true))
      return e
    }
    const sizeWidth = 10
    const sizeHeight = 10
    const left = addArrow(
      'resizeLeft',
      {
        w: -sizeWidth / 2,
        h: size.h / 2 - sizeHeight / 2,
      },
      { w: sizeWidth, h: sizeHeight }
    )
    const right = addArrow(
      'resizeRight',
      {
        w: -sizeWidth / 2 + size.w,
        h: size.h / 2 - sizeHeight / 2,
      },
      { w: sizeWidth, h: sizeHeight }
    )
    const tp = addArrow(
      'resizeTop',
      {
        w: -sizeWidth / 2 + size.w / 2,
        h: -sizeHeight / 2,
      },
      { w: sizeWidth, h: sizeHeight }
    )
    const bottom = addArrow(
      'resizeBottom',
      {
        w: -sizeWidth / 2 + size.w / 2,
        h: size.h - sizeHeight / 2,
      },
      { w: sizeWidth, h: sizeHeight }
    )
    const topleft = addArrow(
      'resizeTopLeft',
      {
        w: -sizeWidth / 2,
        h: -sizeHeight / 2,
      },
      { w: sizeWidth, h: sizeHeight }
    )
    const topright = addArrow(
      'resizeTopRight',
      {
        w: -sizeWidth / 2 + size.w,
        h: -sizeHeight / 2,
      },
      { w: sizeWidth, h: sizeHeight }
    )
    const bottomleft = addArrow(
      'resizeBottomLeft',
      {
        w: -sizeWidth / 2,
        h: size.h - sizeHeight / 2,
      },
      { w: sizeWidth, h: sizeHeight }
    )
    const bottomright = addArrow(
      'resizeBottomRight',
      {
        w: -sizeWidth / 2 + size.w,
        h: size.h - sizeHeight / 2,
      },
      { w: sizeWidth, h: sizeHeight }
    )
    set.set(left, 'left')
    set.set(right, 'right')
    set.set(tp, 'top')
    set.set(bottom, 'bottom')
    set.set(topleft, 'topleft')
    set.set(topright, 'topright')
    set.set(bottomleft, 'bottomleft')
    set.set(bottomright, 'bottomright')
    this.state.entityStates.set(entity, set)
    this.dispatch.dispatch('shouldUpdateRender', {})
  }

  public update() {}
}

export { StartResizing }
