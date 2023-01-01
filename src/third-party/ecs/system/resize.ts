/* eslint-disable max-lines */
import type Dispatch from '../../../dispatch/dispatch'
import { type Renderer } from '../../../render/interface'
import { clamp } from '../../../utility/clamp'
import CanonicalSize from '../component/canonical-size'
import ForRender from '../component/for-render'
import { PanelTexture } from '../component/panel-texture'
import Position from '../component/position'
import Resizeable from '../component/resizeable'
import { Resizing } from '../component/resizing'
import { Selected } from '../component/selected'
import Size from '../component/size'
import { Type } from '../component/type'
import { System } from '../minimal-ecs'
import { debounce } from '../../../utility/debounce'

interface ElementInfo {
  x: number
  y: number
  w: number
  h: number
  canonicalW: number
  canonicalH: number
}

interface Point {
  x: number
  y: number
}

interface predicateInfo {
  dir: string
  cells: number
  action: 'lessen' | 'largen'
}

type predicate = (
  element: Readonly<ElementInfo>,
  point: Readonly<Point>
) => Readonly<{
  info: Readonly<predicateInfo>[]
}>

type resizer = (
  entity: number,
  s: Readonly<Size>,
  p: Readonly<Position>,
  c: Readonly<CanonicalSize>,
  m: number
) => void

class Resize extends System {
  public readonly componentsRequired = new Set<Function>([Resizeable])

  public entitiesLastSeenUpdate = -1

  private readonly leftResizeLessen: resizer = (entity, s, p, c, m) => {
    p.set({
      x: p.x + c.info.w * m,
    })
    s.set({
      width: s.w - c.info.w * m,
    })
  }

  private readonly leftResizeLargen: resizer = (entity, s, p, c, m) => {
    p.set({
      x: p.x - c.info.w * m,
    })
    s.set({
      width: s.w + c.info.w * m,
    })
  }

  private readonly leftPredicateLessen: predicate = (element, point) => {
    const cellElement = Math.round(element.w / element.canonicalW)
    const cellPoint = Math.round((point.x - element.x) / element.canonicalW)
    const cells = clamp(Math.abs(cellPoint), 1, cellElement - 1)
    if (cellPoint > 0 && cellElement > 1) {
      return {
        info: [{ dir: 'left', cells, action: 'lessen' }],
      }
    }
    return {
      info: [],
    }
  }

  private readonly leftPredicateLargen: predicate = (element, point) => {
    const cellElement = Math.round(element.w / element.canonicalW)
    const cellPoint = Math.round((point.x - element.x) / element.canonicalW)
    const cells = Math.abs(cellPoint)
    if (cellPoint < 0 && cellElement > 0) {
      return {
        info: [{ dir: 'left', cells, action: 'largen' }],
      }
    }
    return {
      info: [],
    }
  }

  private readonly rightResizeLessen: resizer = (entity, s, p, c, m) => {
    s.set({
      width: s.w - c.info.w * m,
    })
  }

  private readonly rightResizeLargen: resizer = (entity, s, p, c, m) => {
    s.set({
      width: s.w + c.info.w * m,
    })
  }

  private readonly rightPredicateLessen: predicate = (element, point) => {
    const cellElement = Math.round(element.w / element.canonicalW)
    const cellPoint = Math.round((point.x - element.x) / element.canonicalW)
    const cells = clamp(Math.abs(cellPoint - cellElement), 1, cellElement - 1)
    if (cellPoint < cellElement && cellElement > 1) {
      return {
        info: [{ dir: 'right', cells, action: 'lessen' }],
      }
    }
    return {
      info: [],
    }
  }

  private readonly rightPredicateLargen: predicate = (element, point) => {
    const cellElement = Math.round(element.w / element.canonicalW)
    const cellPoint = Math.round((point.x - element.x) / element.canonicalW)
    const cells = Math.abs(cellPoint - cellElement)
    if (cellPoint > cellElement && cellElement > 0) {
      return {
        info: [{ dir: 'right', cells, action: 'largen' }],
      }
    }
    return {
      info: [],
    }
  }

  private readonly topResizeLessen: resizer = (entity, s, p, c, m) => {
    p.set({
      y: p.y + c.info.h * m,
    })
    s.set({
      height: s.h - c.info.h * m,
    })
  }

  private readonly topResizeLargen: resizer = (entity, s, p, c, m) => {
    p.set({
      y: p.y - c.info.h * m,
    })
    s.set({
      height: s.h + c.info.h * m,
    })
  }

  private readonly topPredicateLessen: predicate = (element, point) => {
    const cellElement = Math.round(element.h / element.canonicalH)
    const cellPoint = Math.round((point.y - element.y) / element.canonicalH)
    const cells = clamp(Math.abs(cellPoint), 1, cellElement - 1)
    if (cellPoint > 0 && cellElement > 1) {
      return {
        info: [{ dir: 'top', cells, action: 'lessen' }],
      }
    }
    return {
      info: [],
    }
  }

  private readonly topPredicateLargen: predicate = (element, point) => {
    const cellElement = Math.round(element.h / element.canonicalH)
    const cellPoint = Math.round((point.y - element.y) / element.canonicalH)
    const cells = Math.abs(cellPoint)
    if (cellPoint < 0 && cellElement > 0) {
      return {
        info: [{ dir: 'top', cells, action: 'largen' }],
      }
    }
    return {
      info: [],
    }
  }

  private readonly bottomResizeLessen: resizer = (entity, s, p, c, m) => {
    s.set({
      height: s.h - c.info.h * m,
    })
  }

  private readonly bottomResizeLargen: resizer = (entity, s, p, c, m) => {
    s.set({
      height: s.h + c.info.h * m,
    })
  }

  private readonly bottomPredicateLessen: predicate = (element, point) => {
    const cellElement = Math.round(element.h / element.canonicalH)
    const cellPoint = Math.round((point.y - element.y) / element.canonicalH)
    const cells = clamp(Math.abs(cellPoint - cellElement), 1, cellElement - 1)
    if (cellPoint < cellElement && cellElement > 1) {
      return {
        info: [{ dir: 'bottom', cells, action: 'lessen' }],
      }
    }
    return {
      info: [],
    }
  }

  private readonly bottomPredicateLargen: predicate = (element, point) => {
    const cellElement = Math.round(element.h / element.canonicalH)
    const cellPoint = Math.round((point.y - element.y) / element.canonicalH)
    const cells = Math.abs(cellPoint - cellElement)
    if (cellPoint > cellElement && cellElement > 0) {
      return {
        info: [{ dir: 'bottom', cells, action: 'largen' }],
      }
    }
    return {
      info: [],
    }
  }

  private readonly topLeftPredicateLessen: predicate = (element, point) => {
    return {
      info: [
        ...this.topPredicateLessen(element, point).info,
        ...this.leftPredicateLessen(element, point).info,
      ],
    }
  }

  private readonly topLeftPredicateLargen: predicate = (element, point) => {
    return {
      info: [
        ...this.topPredicateLargen(element, point).info,
        ...this.leftPredicateLargen(element, point).info,
      ],
    }
  }

  private readonly topRightPredicateLessen: predicate = (element, point) => {
    return {
      info: [
        ...this.topPredicateLessen(element, point).info,
        ...this.rightPredicateLessen(element, point).info,
      ],
    }
  }

  private readonly topRightPredicateLargen: predicate = (element, point) => {
    return {
      info: [
        ...this.topPredicateLargen(element, point).info,
        ...this.rightPredicateLargen(element, point).info,
      ],
    }
  }

  private readonly bottomLeftPredicateLessen: predicate = (element, point) => {
    return {
      info: [
        ...this.bottomPredicateLessen(element, point).info,
        ...this.leftPredicateLessen(element, point).info,
      ],
    }
  }

  private readonly bottomLeftPredicateLargen: predicate = (element, point) => {
    return {
      info: [
        ...this.bottomPredicateLargen(element, point).info,
        ...this.leftPredicateLargen(element, point).info,
      ],
    }
  }

  private readonly bottomRightPredicateLessen: predicate = (element, point) => {
    return {
      info: [
        ...this.bottomPredicateLessen(element, point).info,
        ...this.rightPredicateLessen(element, point).info,
      ],
    }
  }

  private readonly bottomRightPredicateLargen: predicate = (element, point) => {
    return {
      info: [
        ...this.bottomPredicateLargen(element, point).info,
        ...this.rightPredicateLargen(element, point).info,
      ],
    }
  }

  // eslint-disable-next-line sort-class-members/sort-class-members
  private readonly funcs = {
    left: {
      lessen: this.leftPredicateLessen,
      largen: this.leftPredicateLargen,
      resizerLessen: this.leftResizeLessen,
      resizerLargen: this.leftResizeLargen,
    },

    right: {
      lessen: this.rightPredicateLessen,
      largen: this.rightPredicateLargen,
      resizerLessen: this.rightResizeLessen,
      resizerLargen: this.rightResizeLargen,
    },

    top: {
      lessen: this.topPredicateLessen,
      largen: this.topPredicateLargen,
      resizerLessen: this.topResizeLessen,
      resizerLargen: this.topResizeLargen,
    },

    bottom: {
      lessen: this.bottomPredicateLessen,
      largen: this.bottomPredicateLargen,
      resizerLessen: this.bottomResizeLessen,
      resizerLargen: this.bottomResizeLargen,
    },

    topleft: {
      lessen: this.topLeftPredicateLessen,
      largen: this.topLeftPredicateLargen,
      resizerLessen: this.topLeftResizeLessen,
      resizerLargen: this.topLeftResizeLargen,
    },

    topright: {
      lessen: this.topRightPredicateLessen,
      largen: this.topRightPredicateLargen,
      resizerLessen: this.topRightResizeLessen,
      resizerLargen: this.topRightResizeLargen,
    },

    bottomleft: {
      lessen: this.bottomLeftPredicateLessen,
      largen: this.bottomLeftPredicateLargen,
      resizerLessen: this.bottomLeftResizeLessen,
      resizerLargen: this.bottomLeftResizeLargen,
    },

    bottomright: {
      lessen: this.bottomRightPredicateLessen,
      largen: this.bottomRightPredicateLargen,
      resizerLessen: this.bottomRightResizeLessen,
      resizerLargen: this.bottomRightResizeLargen,
    },
  }

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    const resizeFunc = (
      entity: number,
      point: Readonly<{
        x: number
        y: number
      }>,
      lessen: predicate,
      largen: predicate,
    ) => {
      const components = this.ecs.getComponents(entity)
      const resizing = components.get(Resizing)
      if (resizing === undefined) throw new Error('Invalid entity!')
      const size = components.get(Size)
      const position = components.get(Position)
      const texture = components.get(PanelTexture)
      if (size === undefined || position === undefined || texture === undefined)
        throw new Error('Invalid entity!')
      const canonicalSize = this.ecs
        .getComponents(texture.key)
        .get(CanonicalSize)
      if (canonicalSize === undefined) throw new Error('Invalid entity!')
      const elementInfo = {
        x: position.x,
        y: position.y,
        w: size.w,
        h: size.h,
        canonicalW: canonicalSize.info.w,
        canonicalH: canonicalSize.info.h,
      }
      const less = lessen(elementInfo, point)
      const more = largen(elementInfo, point)
      for (const [, v] of Object.entries(less.info)) {
        const func = this.funcs[v.dir].resizerLessen
        func(entity, size, position, canonicalSize, v.cells)
      }
      for (const [, v] of Object.entries(more.info)) {
        const func = this.funcs[v.dir].resizerLargen
        func(entity, size, position, canonicalSize, v.cells)
      }
      return less.info.length > 0 || more.info.length > 0
    }
    this.dispatch.on(
      'onMouseMove',
      (
        info: Readonly<{
          renderer: Readonly<Renderer>
          point: Readonly<{ x: number; y: number }>
        }>
      ) => {
        const l = Object.values(
          Array.from(this.ecs.getEntitiesWithComponent(new Set([Resizing])))
        ).filter((e) => {
          const resizing = this.ecs.getComponents(e).get(Resizing)
          if (resizing === undefined) throw new Error('Invalid entity!')
          return resizing.dir !== 'none'
        })
        for (const [, v] of Object.entries(l)) {
          const resizing = this.ecs.getComponents(v).get(Resizing)
          const pos = this.ecs.getComponents(v).get(Position)
          const size = this.ecs.getComponents(v).get(Size)
          const texture = this.ecs.getComponents(v).get(PanelTexture)
          if (
            resizing === undefined ||
            pos === undefined ||
            size === undefined ||
            texture === undefined
          )
            throw new Error('Invalid entity!')
          const canonicalSize = this.ecs
            .getComponents(texture.key)
            .get(CanonicalSize)
          if (canonicalSize === undefined) throw new Error('Invalid entity!')
          const point = {
            x: info.point.x,
            y: info.point.y,
          }
          const p = resizeFunc(
            v,
            point,
            this.funcs[resizing.dir].lessen,
            this.funcs[resizing.dir].largen,
          )
          if (p) this.dispatch.dispatch('shouldUpdateRenderEntity', {
            entity: [v],
          })
        }
      }
    )
  }
  public update(entities: Set<number>) {}
}

export { Resize }
