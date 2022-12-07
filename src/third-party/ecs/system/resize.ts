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

type predicate = (
  element: Readonly<ElementInfo>,
  point: Readonly<Point>
) => [boolean, number]
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
    const cells = Math.round(element.w / element.canonicalW)
    const cellPoint = Math.round((point.x - element.x) / element.canonicalW)
    return [
      cellPoint > 0 && cells > 1,
      clamp(Math.abs(cellPoint), 1, cells - 1),
    ]
  }

  private readonly leftPredicateLargen: predicate = (element, point) => {
    const cells = Math.round(element.w / element.canonicalW)
    const cellPoint = Math.round((point.x - element.x) / element.canonicalW)
    return [cellPoint < 0 && cells > 0, Math.abs(cellPoint)]
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
    const cells = Math.round(element.w / element.canonicalW)
    const cellPoint = Math.round((point.x - element.x) / element.canonicalW)
    return [
      cellPoint < cells && cells > 1,
      clamp(Math.abs(cellPoint - cells), 1, cells - 1),
    ]
  }

  private readonly rightPredicateLargen: predicate = (element, point) => {
    const cells = Math.round(element.w / element.canonicalW)
    const cellPoint = Math.round((point.x - element.x) / element.canonicalW)
    return [cellPoint > cells && cells > 0, Math.abs(cellPoint - cells)]
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
    const cells = Math.round(element.h / element.canonicalH)
    const cellPoint = Math.round((point.y - element.y) / element.canonicalH)
    return [
      cellPoint > 0 && cells > 1,
      clamp(Math.abs(cellPoint), 1, cells - 1),
    ]
  }

  private readonly topPredicateLargen: predicate = (element, point) => {
    const cells = Math.round(element.h / element.canonicalH)
    const cellPoint = Math.round((point.y - element.y) / element.canonicalH)
    return [cellPoint < 0 && cells > 0, Math.abs(cellPoint)]
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
    const cells = Math.round(element.h / element.canonicalH)
    const cellPoint = Math.round((point.y - element.y) / element.canonicalH)
    return [
      cellPoint < cells && cells > 1,
      clamp(Math.abs(cellPoint - cells), 1, cells - 1),
    ]
  }

  private readonly bottomPredicateLargen: predicate = (element, point) => {
    const cells = Math.round(element.h / element.canonicalH)
    const cellPoint = Math.round((point.y - element.y) / element.canonicalH)
    return [cellPoint > cells && cells > 0, Math.abs(cellPoint - cells)]
  }

  private readonly topLeftResizeLessen: resizer = (entity, s, p, c, m) => {
    this.leftResizeLessen(entity, s, p, c, m)
    this.topResizeLessen(entity, s, p, c, m)
  }

  private readonly topLeftResizeLargen: resizer = (entity, s, p, c, m) => {
    this.leftResizeLargen(entity, s, p, c, m)
    this.topResizeLargen(entity, s, p, c, m)
  }

  private readonly topLeftPredicateLessen: predicate = (element, point) => {
    const cellsW = Math.round(element.w / element.canonicalW)
    const cellsH = Math.round(element.h / element.canonicalH)
    const [tBoolean, tNumber] = this.topPredicateLessen(element, point)
    const [lBoolean, lNumber] = this.leftPredicateLessen(element, point)
    return [
      cellsW > 0 && cellsH > 0 && tBoolean && lBoolean,
      clamp(Math.max(tNumber, lNumber), 0, Math.min(cellsW, cellsH) - 1),
    ]
  }

  private readonly topLeftPredicateLargen: predicate = (element, point) => {
    const cellsW = Math.round(element.w / element.canonicalW)
    const cellsH = Math.round(element.h / element.canonicalH)
    const [tBoolean, tNumber] = this.topPredicateLargen(element, point)
    const [lBoolean, lNumber] = this.leftPredicateLargen(element, point)
    return [
      cellsW > 0 && cellsH > 0 && tBoolean && lBoolean,
      Math.max(tNumber, lNumber),
    ]
  }

  private readonly topRightResizeLessen: resizer = (entity, s, p, c, m) => {
    this.rightResizeLessen(entity, s, p, c, m)
    this.topResizeLessen(entity, s, p, c, m)
  }

  private readonly topRightResizeLargen: resizer = (entity, s, p, c, m) => {
    this.rightResizeLargen(entity, s, p, c, m)
    this.topResizeLargen(entity, s, p, c, m)
  }

  private readonly topRightPredicateLessen: predicate = (element, point) => {
    const cellsW = Math.round(element.w / element.canonicalW)
    const cellsH = Math.round(element.h / element.canonicalH)
    const [tBoolean, tNumber] = this.topPredicateLessen(element, point)
    const [rBoolean, rNumber] = this.rightPredicateLessen(element, point)
    return [
      cellsW > 0 && cellsH > 0 && tBoolean && rBoolean,
      clamp(Math.max(tNumber, rNumber), 0, Math.min(cellsW, cellsH) - 1),
    ]
  }

  private readonly topRightPredicateLargen: predicate = (element, point) => {
    const cellsW = Math.round(element.w / element.canonicalW)
    const cellsH = Math.round(element.h / element.canonicalH)
    const [tBoolean, tNumber] = this.topPredicateLargen(element, point)
    const [rBoolean, rNumber] = this.rightPredicateLargen(element, point)
    return [
      cellsW > 0 && cellsH > 0 && tBoolean && rBoolean,
      Math.max(tNumber, rNumber),
    ]
  }

  private readonly bottomLeftResizeLessen: resizer = (entity, s, p, c, m) => {
    this.leftResizeLessen(entity, s, p, c, m)
    this.bottomResizeLessen(entity, s, p, c, m)
  }

  private readonly bottomLeftResizeLargen: resizer = (entity, s, p, c, m) => {
    this.leftResizeLargen(entity, s, p, c, m)
    this.bottomResizeLargen(entity, s, p, c, m)
  }

  private readonly bottomLeftPredicateLessen: predicate = (element, point) => {
    const cellsW = Math.round(element.w / element.canonicalW)
    const cellsH = Math.round(element.h / element.canonicalH)
    const [bBoolean, bNumber] = this.bottomPredicateLessen(element, point)
    const [lBoolean, lNumber] = this.leftPredicateLessen(element, point)
    return [
      cellsW > 0 && cellsH > 0 && bBoolean && lBoolean,
      clamp(Math.max(bNumber, lNumber), 0, Math.min(cellsW, cellsH) - 1),
    ]
  }

  private readonly bottomLeftPredicateLargen: predicate = (element, point) => {
    const cellsW = Math.round(element.w / element.canonicalW)
    const cellsH = Math.round(element.h / element.canonicalH)
    const [bBoolean, bNumber] = this.bottomPredicateLargen(element, point)
    const [lBoolean, lNumber] = this.leftPredicateLargen(element, point)
    return [
      cellsW > 0 && cellsH > 0 && bBoolean && lBoolean,
      Math.max(bNumber, lNumber),
    ]
  }

  private readonly bottomRightResizeLessen: resizer = (entity, s, p, c, m) => {
    this.rightResizeLessen(entity, s, p, c, m)
    this.bottomResizeLessen(entity, s, p, c, m)
  }

  private readonly bottomRightResizeLargen: resizer = (entity, s, p, c, m) => {
    this.rightResizeLargen(entity, s, p, c, m)
    this.bottomResizeLargen(entity, s, p, c, m)
  }

  private readonly bottomRightPredicateLessen: predicate = (element, point) => {
    const cellsW = Math.round(element.w / element.canonicalW)
    const cellsH = Math.round(element.h / element.canonicalH)
    const [bBoolean, bNumber] = this.bottomPredicateLessen(element, point)
    const [rBoolean, rNumber] = this.rightPredicateLessen(element, point)
    return [
      cellsW > 0 && cellsH > 0 && bBoolean && rBoolean,
      clamp(Math.max(bNumber, rNumber), 0, Math.min(cellsW, cellsH) - 1),
    ]
  }

  private readonly bottomRightPredicateLargen: predicate = (element, point) => {
    const cellsW = Math.round(element.w / element.canonicalW)
    const cellsH = Math.round(element.h / element.canonicalH)
    const [bBoolean, bNumber] = this.bottomPredicateLargen(element, point)
    const [rBoolean, rNumber] = this.rightPredicateLargen(element, point)
    return [
      cellsW > 0 && cellsH > 0 && bBoolean && rBoolean,
      Math.max(bNumber, rNumber),
    ]
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
      resizerLessen: resizer,
      resizerLargen: resizer
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
      const [shouldLessen, lessenMultiplier] = lessen(elementInfo, point)
      const [shouldLargen, largenMultiplier] = largen(elementInfo, point)
      if (size.w % canonicalSize.info.w !== 0) {
        size.set({
          width:
            Math.round(size.w / canonicalSize.info.w) * canonicalSize.info.w,
        })
      }
      if (size.h % canonicalSize.info.h !== 0) {
        size.set({
          height:
            Math.round(size.h / canonicalSize.info.h) * canonicalSize.info.h,
        })
      }
      console.log(lessenMultiplier, largenMultiplier)
      if (shouldLessen) {
        resizerLessen(entity, size, position, canonicalSize, lessenMultiplier)
      } else if (shouldLargen) {
        resizerLargen(entity, size, position, canonicalSize, largenMultiplier)
      }
      return shouldLargen || shouldLessen
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
            this.funcs[resizing.dir].resizerLessen,
            this.funcs[resizing.dir].resizerLargen
          )
          if (p) this.dispatch.dispatch('shouldUpdateRender', {})
        }
      }
    )
  }
  public update(entities: Set<number>) {}
}

export { Resize }
