import { System } from '../minimal-ecs'
import ForRender from '../component/for-render'
import Position from '../component/position'
import { Type } from '../component/type'
import type Dispatch from '../../../dispatch/dispatch'
import { Selected } from '../component/selected'
import { type Renderer } from '../../../render/interface'
import Resizeable from '../component/resizeable'
import { Resizing } from '../component/resizing'

class StartResizing extends System {
  public readonly componentsRequired = new Set<Function>([Resizeable, Resizing])

  public entitiesLastSeenUpdate = -1

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'resizeStart',
      (
        info: Readonly<{
          entity: number
        }>
      ) => {
        const c = this.ecs.getComponents(info.entity)
        const resizing = c.get(Resizing)
        const resizeable = c.get(Resizeable)
        if (resizing === undefined || resizeable === undefined) throw new Error('Invalid entity!')
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
        if (resizing === undefined || resizeable === undefined) throw new Error('Invalid entity!')
        resizing.key = false
        resizeable.key = false
        a.renderer.clearArrows(a.entity)
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
        if (resizing === undefined || resizeable === undefined)
          throw new Error('Invalid entity!')
        if (resizeable.never) return
        resizeable.key = true
        a.renderer.addResizeArrows(a.entity)
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
        const resizeable = components.get(Resizeable)
        if (resizeable?.key ?? false) {
          info.renderer.clearArrows(info.entity)
          info.renderer.addResizeArrows(info.entity)
        }
      }
    )
    this.dispatch.on(
      'onMouseUpGeneral',
      (
        info: Readonly<{
          renderer: Readonly<Renderer>
          entity: number
        }>
      ) => {
        for (const [, v] of Object.entries(
          Array.from(this.ecs.getEntitiesWithComponent(new Set([Resizing])))
        )) {
          const j = this.ecs.getComponents(v)
          const k = j.get(Resizing)
          if (k === undefined) throw new Error('Invalid entity!')
          if (k.key) {
            info.renderer.clearArrows(v)
            info.renderer.addResizeArrows(v)
            k.key = false
          }
        }
      }
    )
    this.dispatch.on(
      'onMouseInAir',
      (
        info: Readonly<{
          renderer: Readonly<Renderer>
          entity: number
        }>
      ) => {
        for (const [, v] of Object.entries(
          Array.from(this.ecs.getEntitiesWithComponent(new Set([Resizing])))
        )) {
          const j = this.ecs.getComponents(v)
          const k = j.get(Resizing)
          if (k === undefined) throw new Error('Invalid entity!')
          if (k.key) {
            info.renderer.clearArrows(v)
            info.renderer.addResizeArrows(v)
            k.key = false
          }
        }
      }
    )
  }

  public update() {}
}

export { StartResizing }
