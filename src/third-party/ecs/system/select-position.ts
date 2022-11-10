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

class SelectPosition extends System {
  public readonly componentsRequired = new Set<Function>([Position])

  public entitiesLastSeenUpdate = -1

  private readonly info = {
    id: -1,
    ecsId: -1,
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

    srcX: ['', '', ''],

    srcY: ['', '', '']
  }

  public constructor(
    private readonly dispatch: Readonly<Dispatch>,
    private readonly renderer: Readonly<Renderer>
  ) {
    super()
    this.dispatch.on(
      'selectPositionStart',
      (
        a: Readonly<{
          entity: number
          msg: Readonly<MessagePosition>
          src: Readonly<MessageValue>
        }>
      ) => {
        if (this.shadowIsActive()) {
          return
        }
        console.log(a)
        this.info.srcX = [a.src.localeName, a.msg.localeName, a.msg.val[0].localeName]
        this.info.srcY = [a.src.localeName, a.msg.localeName, a.msg.val[1].localeName]
        this.info.id = a.entity
        this.info.active = true
        const components = this.ecs.getComponents(this.info.id)
        const size = components.get(Size)
        const texture = components.get(PanelTexture)
        const typec = components.get(PanelTypeComponent)
        const flagc = components.get(PanelFlags)
        if (
          size === undefined ||
          texture === undefined ||
          typec === undefined ||
          flagc === undefined
        )
          throw new Error('Invalid entity!')
        const textureComponents = this.ecs.getComponents(texture.key)
        const texturePath = textureComponents.get(PathComponent)
        if (texturePath === undefined) throw new Error('Invalid entity!')
        this.info.ecsId = this.ecs.addEntity()
        this.info.imgKey = texturePath.key.asThisEditorPath(false)
        this.info.size.width = size.w
        this.info.size.height = size.h
        const position = new Position(0, 0)
        const sizet = new Size(this.info.size.width, this.info.size.height)
        const shouldRender = new ForRender(true)
        const typeComponent = new PanelTypeComponent(typec.key)
        const flagComponent = new PanelFlags(flagc.key)
        const type = new Type('panel')
        const alpha = new Alpha(1)
        const textureComponent = new PanelTexture(texture.key)
        const selected = new Selected(4)
        const highlighted = new Highlighted(false, true)
        const moveable = new Moveable(false)
        const resizeable = new Resizeable(false, true)
        const resizing = new Resizing(false)
        const platform = new Platform(false)
        const id = new Id(Number.MAX_SAFE_INTEGER)
        console.log(texturePath, textureComponent)
        this.ecs.addComponent(this.info.ecsId, position)
        this.ecs.addComponent(this.info.ecsId, sizet)
        this.ecs.addComponent(this.info.ecsId, shouldRender)
        this.ecs.addComponent(this.info.ecsId, type)
        this.ecs.addComponent(this.info.ecsId, typeComponent)
        this.ecs.addComponent(this.info.ecsId, flagComponent)
        this.ecs.addComponent(this.info.ecsId, textureComponent)
        this.ecs.addComponent(this.info.ecsId, selected)
        this.ecs.addComponent(this.info.ecsId, id)
        this.ecs.addComponent(this.info.ecsId, alpha)
        this.ecs.addComponent(this.info.ecsId, platform)
        this.ecs.addComponent(this.info.ecsId, moveable)
        this.ecs.addComponent(this.info.ecsId, highlighted)
        this.ecs.addComponent(this.info.ecsId, resizeable)
        this.ecs.addComponent(this.info.ecsId, resizing)
        moveable.key = true
        this.renderer.render({
          entity: this.info.ecsId,
          x: position.x,
          y: position.y,
          w: size.w,
          h: size.h,
          alpha: alpha.key,
          imgKey: texturePath.key.asThisEditorPath(false),
          tint: 0x80_80_80,
        })
        this.dispatch.dispatch('onDragStart', {
          entity: this.info.ecsId,
          renderer: this.renderer,

          offset: {
            x: -(this.info.size.width / 2),
            y: -(this.info.size.height / 2),
          },
        })
      }
    )
    this.dispatch.on(
      'onMouseUpGeneral',
      (
        a: Readonly<{
          entity: number
        }>
      ) => {
        if (this.shadowIsActive()) {
          const components = this.ecs.getComponents(this.info.ecsId)
          const pos = components.get(Position)
          if (pos === undefined) throw new Error('Invalid entity!')
          this.dispatch.dispatch('onElementInfoApply', {
            src: this.info.srcX,
            val: pos.x,
            entity: this.info.id,
          })
          this.dispatch.dispatch('onElementInfoApply', {
            src: this.info.srcY,
            val: pos.y,
            entity: this.info.id,
          })
          this.clearShadow()
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
        if (this.shadowIsActive()) {
          const components = this.ecs.getComponents(this.info.ecsId)
          const pos = components.get(Position)
          if (pos === undefined) throw new Error('Invalid entity!')
          this.dispatch.dispatch('onElementInfoApply', {
            src: this.info.srcX,
            val: pos.x,
            entity: this.info.id,
          })
          this.dispatch.dispatch('onElementInfoApply', {
            src: this.info.srcY,
            val: pos.y,
            entity: this.info.id,
          })
          this.clearShadow()
        }
      }
    )
  }

  private shadowIsActive() {
    return this.info.active
  }

  private clearShadow() {
    const components = this.ecs.getComponents(this.info.ecsId)
    const shouldRender = components.get(ForRender)
    if (shouldRender !== undefined) shouldRender.setForRender(false)
    this.renderer.deleteEntity(this.info.ecsId)
    this.ecs.removeEntity(this.info.ecsId)
    this.info.id = -1
    this.info.ecsId = -1
    this.info.active = false
  }

  public update() {}
}

export { SelectPosition }
