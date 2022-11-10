import type Dispatch from '../../../dispatch/dispatch'
import { MessageValue, type MessagePosition } from '../../../messager-types'
import { type Renderer } from '../../../render/interface'
import Alpha from '../component/alpha'
import ForRender from '../component/for-render'
import { Highlighted } from '../component/highlighted'
import Id from '../component/id'
import Moveable from '../component/moveable'
import PanelFlags from '../component/panel-flag'
import Platform from '../component/panel-platform'
import { PanelTexture } from '../component/panel-texture'
import PanelTypeComponent from '../component/panel-type'
import PathComponent from '../component/path'
import Position from '../component/position'
import Resizeable from '../component/resizeable'
import { Resizing } from '../component/resizing'
import { Selected } from '../component/selected'
import Size from '../component/size'
import Type from '../component/type'
import { System } from '../minimal-ecs'

class SelectSize extends System {
  public readonly componentsRequired = new Set<Function>([Position])

  public entitiesLastSeenUpdate = -1

  private readonly info = {
    id: -1,
    active: false,
    imgKey: '',

    pos: {
      x: 0,
      y: 0,
    },

    size: {
      width: 0,
      height: 0,
    },

    srcW: ['', '', ''],

    srcH: ['', '', ''],
  }

  public constructor(
    private readonly dispatch: Readonly<Dispatch>,
    private readonly renderer: Readonly<Renderer>
  ) {
    super()
    this.dispatch.on(
      'selectSizeStart',
      (
        a: Readonly<{
          entity: number
          msg: Readonly<MessagePosition>
          src: Readonly<MessageValue>
        }>
      ) => {
        if (this.info.active) return
        console.log(a)
        this.info.srcW = [
          a.src.localeName,
          a.msg.localeName,
          a.msg.val[0].localeName,
        ]
        this.info.srcH = [
          a.src.localeName,
          a.msg.localeName,
          a.msg.val[1].localeName,
        ]
        this.info.id = a.entity
        this.info.active = true
        const components = this.ecs.getComponents(this.info.id)
        const size = components.get(Size)
        const resizing = components.get(Resizing)
        if (size === undefined || resizing === undefined)
          throw new Error('Invalid entity!')
        resizing.key = true
        this.info.size.width = size.w
        this.info.size.height = size.h
      }
    )
    this.dispatch.on(
      'onMouseUpGeneral',
      (
        a: Readonly<{
          entity: number
        }>
      ) => {
        if (this.info.active) {
          const components = this.ecs.getComponents(this.info.id)
          const size = components.get(Size)
          if (size === undefined) throw new Error('Invalid entity!')
          const w = size.w
          const h = size.h
          size.set({
            width: this.info.size.width,
            height: this.info.size.height, 
          })
          this.dispatch.dispatch('onElementInfoApply', {
            src: this.info.srcW,
            val: w,
            entity: this.info.id,
          })
          this.dispatch.dispatch('onElementInfoApply', {
            src: this.info.srcH,
            val: h,
            entity: this.info.id,
          })
          this.info.active = false
          this.info.id = -1
        }
      }
    )
    this.dispatch.on(
      'onMouseInAir',
      (
        a: Readonly<{
          entity: number
        }>
      ) => {
        if (this.info.active) {
          const components = this.ecs.getComponents(this.info.id)
          const size = components.get(Size)
          if (size === undefined) throw new Error('Invalid entity!')
          const w = size.w
          const h = size.h
          size.set({
            width: this.info.size.width,
            height: this.info.size.height, 
          })
          this.dispatch.dispatch('onElementInfoApply', {
            src: this.info.srcW,
            val: w,
            entity: this.info.id,
          })
          this.dispatch.dispatch('onElementInfoApply', {
            src: this.info.srcH,
            val: h,
            entity: this.info.id,
          })
          this.info.active = false
          this.info.id = -1
        }
      }
    )
  }

  public update() {}
}

export { SelectSize }
