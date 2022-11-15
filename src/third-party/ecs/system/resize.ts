/* eslint-disable max-lines */
import type Dispatch from '../../../dispatch/dispatch'
import { type Renderer } from '../../../render/interface'
import ForRender from '../component/for-render'
import Position from '../component/position'
import Resizeable from '../component/resizeable'
import { Resizing } from '../component/resizing'
import { Selected } from '../component/selected'
import Size from '../component/size'
import { Type } from '../component/type'
import { System } from '../minimal-ecs'

class Resize extends System {
  private readonly state: {
    entityStates: (
      | {
          clicked:
            | 'bottom'
            | 'bottomleft'
            | 'bottomright'
            | 'left'
            | 'none'
            | 'right'
            | 'top'
            | 'topleft'
            | 'topright'
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

  public readonly componentsRequired = new Set<Function>([Resizeable])

  public entitiesLastSeenUpdate = -1

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'resizeStart',
      (
        i: Readonly<{
          direction:
            | 'bottom'
            | 'bottomleft'
            | 'bottomright'
            | 'left'
            | 'none'
            | 'right'
            | 'top'
            | 'topleft'
            | 'topright'
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
        console.log(a, 'resizingLeft')
        const components = this.ecs.getComponents(info.entity)
        const resizing = components.get(Resizing)
        if (resizing === undefined) throw new Error('Invalid entity!')
        if (!resizing.key) return
        const size = components.get(Size)
        if (size === undefined) throw new Error('Invalid entity!')
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
          size.set({
            width: w,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        } else if (pointGrid < 0) {
          const x = info.sprite.x - Math.abs(a.base.w)
          const w = info.sprite.w + Math.round(a.base.w)
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            w,
            entity: info.entity,
          })
          size.set({
            width: w,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
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
        const components = this.ecs.getComponents(info.entity)
        const resizing = components.get(Resizing)
        if (resizing === undefined) throw new Error('Invalid entity!')
        if (!resizing.key) return
        const size = components.get(Size)
        if (size === undefined) throw new Error('Invalid entity!')
        const grids = info.sprite.w / a.base.w
        const pointGrid = Math.round(
          (info.point.x - info.sprite.x + info.arrow.w) / a.base.w
        )
        if (pointGrid > grids) {
          const x = info.sprite.x
          const w = info.sprite.w + a.base.w
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            w,
            entity: info.entity,
          })
          size.set({
            width: w,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        } else if (pointGrid < grids && grids > 1) {
          const x = info.sprite.x
          const w = info.sprite.w - a.base.w
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            w,
            entity: info.entity,
          })
          size.set({
            width: w,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        }
      }
    )

    this.dispatch.on(
      'resizeTop',
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
        if (a === undefined || a.clicked !== 'top') return
        const components = this.ecs.getComponents(info.entity)
        const resizing = components.get(Resizing)
        if (resizing === undefined) throw new Error('Invalid entity!')
        if (!resizing.key) return
        const size = components.get(Size)
        if (size === undefined) throw new Error('Invalid entity!')
        const grids = info.sprite.h / a.base.h
        const pointGrid = Math.round(
          (info.sprite.y - info.point.y + info.sprite.h + info.arrow.h) /
            a.base.h
        )
        if (pointGrid < grids && grids > 1) {
          const y = info.sprite.y + Math.abs(a.base.h)
          const h = info.sprite.h - Math.round(a.base.h)
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            y,
            h,
            entity: info.entity,
          })
          size.set({
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        } else if (pointGrid > grids) {
          const y = info.sprite.y - Math.abs(a.base.h)
          const h = info.sprite.h + Math.round(a.base.h)
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            y,
            h,
            entity: info.entity,
          })
          size.set({
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        }
      }
    )

    this.dispatch.on(
      'resizeBottom',
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
        if (a === undefined || a.clicked !== 'bottom') return
        const components = this.ecs.getComponents(info.entity)
        const resizing = components.get(Resizing)
        if (resizing === undefined) throw new Error('Invalid entity!')
        if (!resizing.key) return
        const size = components.get(Size)
        if (size === undefined) throw new Error('Invalid entity!')
        const grids = info.sprite.h / a.base.h
        const pointGrid = Math.abs(
          Math.round((info.sprite.y - info.point.y + info.arrow.h) / a.base.h)
        )
        if (pointGrid < grids && grids > 1) {
          const y = info.sprite.y
          const h = info.sprite.h - Math.round(a.base.h)
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            y,
            h,
            entity: info.entity,
          })
          size.set({
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        } else if (pointGrid > grids) {
          const y = info.sprite.y
          const h = info.sprite.h + Math.round(a.base.h)
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            y,
            h,
            entity: info.entity,
          })
          size.set({
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        }
      }
    )

    this.dispatch.on(
      'resizeTopLeft',
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
        if (a === undefined || a.clicked !== 'topleft') return
        const components = this.ecs.getComponents(info.entity)
        const resizing = components.get(Resizing)
        if (resizing === undefined) throw new Error('Invalid entity!')
        if (!resizing.key) return
        const size = components.get(Size)
        if (size === undefined) throw new Error('Invalid entity!')
        const gridsY = info.sprite.h / a.base.h
        const pointGridY = Math.round(
          (info.sprite.y - info.point.y + info.sprite.h + info.arrow.h) /
            a.base.h
        )
        const gridsX = info.sprite.w / a.base.w
        const pointGridX = Math.round(
          (info.point.x - info.sprite.x + info.arrow.w) / a.base.w
        )
        if (pointGridX < 0 && pointGridY > gridsY) {
          const x = info.sprite.x - a.base.w
          const y = info.sprite.y - a.base.h
          const w = info.sprite.w + a.base.w
          const h = info.sprite.h + a.base.h
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            y,
            w,
            h,
            entity: info.entity,
          })
          size.set({
            width: w,
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        } else if (
          pointGridX > 0 &&
          pointGridY < gridsY &&
          gridsX > 1 &&
          gridsY > 1
        ) {
          const x = info.sprite.x + a.base.w
          const y = info.sprite.y + a.base.h
          const w = info.sprite.w - a.base.w
          const h = info.sprite.h - a.base.h
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            y,
            w,
            h,
            entity: info.entity,
          })
          size.set({
            width: w,
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        }
      }
    )

    this.dispatch.on(
      'resizeTopRight',
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
        if (a === undefined || a.clicked !== 'topright') return
        const components = this.ecs.getComponents(info.entity)
        const resizing = components.get(Resizing)
        if (resizing === undefined) throw new Error('Invalid entity!')
        if (!resizing.key) return
        const size = components.get(Size)
        if (size === undefined) throw new Error('Invalid entity!')
        const gridsY = info.sprite.h / a.base.h
        const pointGridY = Math.round(
          (info.sprite.y - info.point.y + info.sprite.h + info.arrow.h) /
            a.base.h
        )
        const gridsX = info.sprite.w / a.base.w
        const pointGridX = Math.round(
          (info.point.x - info.sprite.x + info.arrow.w) / a.base.w
        )
        if (pointGridX > gridsX && pointGridY > gridsY) {
          const x = info.sprite.x
          const y = info.sprite.y - a.base.h
          const w = info.sprite.w + a.base.w
          const h = info.sprite.h + a.base.h
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            y,
            w,
            h,
            entity: info.entity,
          })
          size.set({
            width: w,
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        } else if (
          pointGridX < gridsX &&
          pointGridY < gridsY &&
          gridsX > 1 &&
          gridsY > 1
        ) {
          const x = info.sprite.x
          const y = info.sprite.y + a.base.h
          const w = info.sprite.w - a.base.w
          const h = info.sprite.h - a.base.h
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            y,
            w,
            h,
            entity: info.entity,
          })
          size.set({
            width: w,
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        }
      }
    )

    this.dispatch.on(
      'resizeBottomLeft',
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
        if (a === undefined || a.clicked !== 'bottomleft') return
        const components = this.ecs.getComponents(info.entity)
        const resizing = components.get(Resizing)
        if (resizing === undefined) throw new Error('Invalid entity!')
        if (!resizing.key) return
        const size = components.get(Size)
        if (size === undefined) throw new Error('Invalid entity!')
        const gridsY = info.sprite.h / a.base.h
        const pointGridY = Math.abs(
          Math.round((info.sprite.y - info.point.y + info.arrow.h) / a.base.h)
        )
        const gridsX = info.sprite.w / a.base.w
        const pointGridX = Math.round(
          (info.point.x - info.sprite.x + info.arrow.w) / a.base.w
        )
        if (pointGridX < 0 && pointGridY > gridsY) {
          const x = info.sprite.x - a.base.w
          const y = info.sprite.y
          const w = info.sprite.w + a.base.w
          const h = info.sprite.h + a.base.h
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            y,
            w,
            h,
            entity: info.entity,
          })
          size.set({
            width: w,
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        } else if (
          pointGridX > 0 &&
          pointGridY < gridsY &&
          gridsX > 1 &&
          gridsY > 1
        ) {
          const x = info.sprite.x + a.base.w
          const y = info.sprite.y
          const w = info.sprite.w - a.base.w
          const h = info.sprite.h - a.base.h
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            y,
            w,
            h,
            entity: info.entity,
          })
          size.set({
            width: w,
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        }
      }
    )

    this.dispatch.on(
      'resizeBottomRight',
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
        if (a === undefined || a.clicked !== 'bottomright') return
        const components = this.ecs.getComponents(info.entity)
        const resizing = components.get(Resizing)
        if (resizing === undefined) throw new Error('Invalid entity!')
        if (!resizing.key) return
        const size = components.get(Size)
        if (size === undefined) throw new Error('Invalid entity!')
        const gridsY = info.sprite.h / a.base.h
        const pointGridY = Math.abs(
          Math.round((info.sprite.y - info.point.y + info.arrow.h) / a.base.h)
        )
        const gridsX = info.sprite.w / a.base.w
        const pointGridX = Math.round(
          (info.point.x - info.sprite.x + info.arrow.w) / a.base.w
        )
        if (pointGridX > gridsX && pointGridY > gridsY) {
          const x = info.sprite.x
          const y = info.sprite.y
          const w = info.sprite.w + a.base.w
          const h = info.sprite.h + a.base.h
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            y,
            w,
            h,
            entity: info.entity,
          })
          size.set({
            width: w,
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        } else if (
          pointGridX < gridsX &&
          pointGridY < gridsY &&
          gridsX > 1 &&
          gridsY > 1
        ) {
          const x = info.sprite.x
          const y = info.sprite.y
          const w = info.sprite.w - a.base.w
          const h = info.sprite.h - a.base.h
          info.renderer.clearHighlight(info.entity)
          info.renderer.render({
            x,
            y,
            w,
            h,
            entity: info.entity,
          })
          size.set({
            width: w,
            height: h,
          })
          this.dispatch.dispatch('onSelectEntity', {
            entity: info.entity,
            renderer: info.renderer,
          })
        }
      }
    )
  }

  public update(entities: Set<number>) {}
}

export { Resize }
