import { Renderer } from 'pixi.js'
import Dispatch from '../../../dispatch/dispatch'
import PanelFlag from '../../../editor/map/panel/flag/flag'
import PanelType from '../../../editor/map/panel/type/type'
import Alpha from '../component/alpha'
import ForRender from '../component/for-render'
import { Highlighted } from '../component/highlighted'
import Id from '../component/id'
import Moveable from '../component/moveable'
import PanelFlags from '../component/panel-flag'
import Platform from '../component/panel-platform'
import { PanelTexture } from '../component/panel-texture'
import PanelTypeComponent from '../component/panel-type'
import Position from '../component/position'
import Resizeable from '../component/resizeable'
import { Resizing } from '../component/resizing'
import { Selected } from '../component/selected'
import Size from '../component/size'
import texture from '../component/texture'
import Type from '../component/type'
import { System } from '../minimal-ecs'

class CreateEntity extends System {
  public componentsRequired: Set<Function> = new Set<Function>([Position])

  public entitiesLastSeenUpdate = -1

  private readonly entities: Readonly<Set<number>> = new Set()

  private readonly createEntity = (
    a: Readonly<{
      entity: number
      renderer: Readonly<Renderer>
      point: Readonly<{
        x: number
        y: number
      }>
    }>
  ) => {
    const e = this.ecs.addEntity()
    this.entities.add(e)
    const position = new Position(0, 0)
    const sizet = new Size(64, 64)
    const shouldRender = new ForRender(true)
    const typeComponent = new PanelTypeComponent(new PanelType('PANEL_WALL'))
    const flagComponent = new PanelFlags(new PanelFlag('PANEL_FLAG_NONE'))
    const type = new Type('panel')
    const alpha = new Alpha(1)
    const textureComponent = new PanelTexture(0)
    const selected = new Selected(0, false)
    const highlighted = new Highlighted(false, false)
    const moveable = new Moveable(false, false)
    const resizeable = new Resizeable(false, false)
    const resizing = new Resizing(false)
    const platform = new Platform(false)
    const other = this.ecs.getEntitiesWithComponent(new Set([Id]))
    const id = new Id(
      other.size === 0
        ? 0
        : Math.max(
            ...Array.from(other, (v) => {
              const c = this.ecs.getComponents(v)
              const i = c.get(Id)
              if (i === undefined) {
                throw new Error('id is undefined')
              }
              return i.key
            })
          ) + 1
    )
    this.ecs.addComponent(e, position)
    this.ecs.addComponent(e, sizet)
    this.ecs.addComponent(e, shouldRender)
    this.ecs.addComponent(e, type)
    this.ecs.addComponent(e, typeComponent)
    this.ecs.addComponent(e, flagComponent)
    this.ecs.addComponent(e, textureComponent)
    this.ecs.addComponent(e, selected)
    this.ecs.addComponent(e, id)
    this.ecs.addComponent(e, alpha)
    this.ecs.addComponent(e, platform)
    this.ecs.addComponent(e, moveable)
    this.ecs.addComponent(e, highlighted)
    this.ecs.addComponent(e, resizeable)
    this.ecs.addComponent(e, resizing)
    position.set({
      x: a.point.x,
      y: a.point.y,
    })
    a.renderer.render({
      entity: e,
      x: position.x,
      y: position.y,
      w: sizet.w,
      h: sizet.h,
      alpha: alpha.key,
      // imgKey: texturePath.key.asThisEditorPath(true),
      useImg: false,
    })
  }

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    console.log(this)
    this.dispatch.on(
      'onRightMouseDownInAir',
      (
        a: Readonly<{
          entity: number
          renderer: Readonly<Renderer>
          point: Readonly<{
            x: number
            y: number
          }>
        }>
      ) => {
        this.createEntity(a)
      }
    )
    this.dispatch.on(
      'onRightMouseDownGeneral',
      (
        a: Readonly<{
          entity: number
          renderer: Readonly<Renderer>
          point: Readonly<{
            x: number
            y: number
          }>
        }>
      ) => {
        this.createEntity(a)
      }
    )
  }

  public update(ignore: Readonly<Set<number>>) {}
}

export { CreateEntity }
