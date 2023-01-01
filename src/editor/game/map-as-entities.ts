/* eslint-disable promise/avoid-new */
import Position from '../../third-party/ecs/component/position'
import Size from '../../third-party/ecs/component/size'
import { ECS } from '../../third-party/ecs/minimal-ecs'
import type EditorMap from '../map/map'
import Pixi from '../../render/pixi/render'
import RenderSystem from '../../third-party/ecs/system/render'
import type ResourceManager from '../../resource-manager/resource-manager'
import ForRender from '../../third-party/ecs/component/for-render'
import { Type } from '../../third-party/ecs/component/type'
import PanelTypeComponent from '../../third-party/ecs/component/panel-type'
import PanelFlags from '../../third-party/ecs/component/panel-flag'
import RenderFilter from '../../third-party/ecs/system/filter-for-render'
import { type RenderRulesKey } from '../render/rules/rules'
import { EditorMapFromECS } from '../../third-party/ecs/system/create-editormap'
import { PanelTexture } from '../../third-party/ecs/component/panel-texture'
import PathComponent from '../../third-party/ecs/component/path'
import type Texture from '../map/texture/texture'
import { Move } from '../../third-party/ecs/system/move'
import Dispatch from '../../dispatch/dispatch'
import { Select } from '../../third-party/ecs/system/select'
import { Selected } from '../../third-party/ecs/component/selected'
import { Resize } from '../../third-party/ecs/system/resize'
import { Message } from '../../third-party/ecs/system/send-message'
import { ReceiveMessage } from '../../third-party/ecs/system/receive-message'
import { UpdateRender } from '../../third-party/ecs/system/update-render'
import IdComponent from '../../third-party/ecs/component/id'
import Alpha from '../../third-party/ecs/component/alpha'
import Platform from '../../third-party/ecs/component/panel-platform'
import { SelectPosition } from '../../third-party/ecs/system/select-position'
import Moveable from '../../third-party/ecs/component/moveable'
import { Highlighted } from '../../third-party/ecs/component/highlighted'
import Resizeable from '../../third-party/ecs/component/resizeable'
import { Resizing } from '../../third-party/ecs/component/resizing'
import { StartResizing } from '../../third-party/ecs/system/start-resizing'
import { Highlight } from '../../third-party/ecs/system/highlight'
import { SelectSize } from '../../third-party/ecs/system/select-size'
import { TextureMessage } from '../../third-party/ecs/system/texture-message'
import Bild from '../../image/bild'
import loadImage from '../../utility/load-image-async'
import CanonicalSize from '../../third-party/ecs/component/canonical-size'
import { CreateEntity } from '../../third-party/ecs/system/create-entity'

// more like a Tab
class ECSFromMap {
  private readonly ECS: ECS

  private readonly pixi: Pixi

  private readonly renderSystem: RenderSystem

  private readonly filterSystem: RenderFilter

  private readonly mapCreatorSystem: EditorMapFromECS

  private readonly dispatch: Dispatch

  private readonly moveSystem: Move

  private readonly selectSystem: Select

  private readonly resizeSystem: Resize

  private readonly messageSystem: Message

  private readonly receiveMessageSystem: ReceiveMessage

  private readonly updataRenderSystem: UpdateRender

  private readonly selectPositionSystem: SelectPosition

  private readonly startResizingSystem: StartResizing

  private readonly highlightSystem: Highlight

  private readonly selectSizeSystem: SelectSize

  private readonly textureMessageSystem: TextureMessage

  private readonly createEntitySystem: CreateEntity

  private renderRules: RenderRulesKey[] = []

  public constructor(
    private readonly map: Readonly<EditorMap>,
    private readonly drawSrc: Readonly<HTMLCanvasElement>,
    private readonly manager: Readonly<ResourceManager>
  ) {
    this.ECS = new ECS()
    this.pixi = new Pixi(this.drawSrc)
    this.filterSystem = new RenderFilter(this.renderRules)
    this.mapCreatorSystem = new EditorMapFromECS()
    this.dispatch = new Dispatch()
    this.moveSystem = new Move(this.dispatch)
    this.selectSystem = new Select(this.dispatch)
    this.renderSystem = new RenderSystem(this.pixi, this.dispatch)
    this.resizeSystem = new Resize(this.dispatch)
    this.messageSystem = new Message(this.dispatch)
    this.receiveMessageSystem = new ReceiveMessage(this.dispatch)
    this.updataRenderSystem = new UpdateRender(this.dispatch, this.pixi)
    this.selectPositionSystem = new SelectPosition(this.dispatch, this.pixi)
    this.startResizingSystem = new StartResizing(this.dispatch)
    this.highlightSystem = new Highlight(this.dispatch)
    this.selectSizeSystem = new SelectSize(this.dispatch, this.pixi)
    this.textureMessageSystem = new TextureMessage(this.dispatch, this.manager)
    this.createEntitySystem = new CreateEntity(this.dispatch)
  }

  public giveDispatch() {
    return this.dispatch
  }

  public giveECS() {
    return this.ECS
  }

  public resizeRender(w: number, h: number) {
    this.pixi.resize(w, h)
  }

  public clearRender() {
    this.pixi.clear()
  }

  public addRule(x: RenderRulesKey) {
    this.renderRules.push(x)
    this.filterSystem.newRules(this.renderRules)
  }

  public removeRule(x: RenderRulesKey) {
    this.renderRules = this.renderRules.filter((i) => i !== x)
    this.filterSystem.newRules(this.renderRules)
  }

  public removeChildren() {
    this.pixi.deregisterAll()
  }

  public reload() {
    this.ECS.update()
  }

  public giveTextures() {
    return this.textureMessageSystem.giveTextures()
  }


  public giveMap() {
    this.mapCreatorSystem.createMap()
    this.ECS.update()
    return this.mapCreatorSystem.giveMap()
  }

  private async registerEntitiesFromMap() {
    const bindings: {
      texture: Texture
      entity: number
    }[] = []
    const promises: Promise<unknown>[] = []
    for (const [, v] of Object.entries(this.map.giveTextures())) {
      const func = (async () => {
        const x = v
        const entity = this.ECS.addEntity()
        const path = x.givePath()
        const c = new PathComponent(path)
        const type = new Type('texture')
        this.ECS.addComponent(entity, type)
        this.ECS.addComponent(entity, c)
        const image = await this.getTextureImage(x)
        if (image === null) {
          const s = new CanonicalSize({
            w: 1,
            h: 1,
          })
          this.ECS.addComponent(entity, s)
        } else {
          const s = new CanonicalSize({
            w: image.naturalWidth,
            h: image.naturalHeight,
          })
          this.ECS.addComponent(entity, s)
        }
        bindings.push({
          texture: x,
          entity,
        })
      })()
      promises.push(func)
    }
    await Promise.allSettled(promises)
    let i = 0
    for (const [, v] of Object.entries(this.map.givePanels())) {
      const entity = this.ECS.addEntity()
      const pos = v.givePosition()
      const dimensions = v.giveDimensions()
      const id = new IdComponent(i)
      const position = new Position(pos.x, pos.y)
      const size = new Size(dimensions.width, dimensions.height)
      const shouldRender = new ForRender(false)
      const typeComponent = new PanelTypeComponent(v.giveType())
      const flagComponent = new PanelFlags(v.giveFlag())
      const type = new Type('panel')
      const alpha = new Alpha(v.giveAlpha().getFloat())
      const t = v.giveTexture()
      const s = bindings.find((q) => q.texture === t)
      if (s === undefined) throw new Error('Texture is not found!')
      const textureComponent = new PanelTexture(s.entity)
      const selected = new Selected(0, false)
      const highlighted = new Highlighted(false)
      const moveable = new Moveable(false)
      const resizeable = new Resizeable(false)
      const resizing = new Resizing(false)
      const applyPlatform = (
        p: Readonly<{
          x: number
          y: number
        }>
      ) => new Position(p.x, p.y)
      const platform = v.givePlatform()
      const platformComponent = new Platform(platform.getMoveActive())
      platformComponent.moveActive = platform.getMoveActive()
      platformComponent.moveOnce = platform.getMoveOnce()
      platformComponent.movespeed = applyPlatform(platform.getMoveSpeed())
      platformComponent.sizespeed = applyPlatform(platform.getSizeSpeed())
      platformComponent.movestart = applyPlatform(platform.getMoveStart())
      platformComponent.moveEnd = applyPlatform(platform.getMoveEnd())
      platformComponent.sizeEnd = applyPlatform(platform.getSizeEnd())
      this.ECS.addComponent(entity, position)
      this.ECS.addComponent(entity, size)
      this.ECS.addComponent(entity, shouldRender)
      this.ECS.addComponent(entity, type)
      this.ECS.addComponent(entity, typeComponent)
      this.ECS.addComponent(entity, flagComponent)
      this.ECS.addComponent(entity, textureComponent)
      this.ECS.addComponent(entity, selected)
      this.ECS.addComponent(entity, id)
      this.ECS.addComponent(entity, alpha)
      this.ECS.addComponent(entity, platformComponent)
      this.ECS.addComponent(entity, moveable)
      this.ECS.addComponent(entity, highlighted)
      this.ECS.addComponent(entity, resizeable)
      this.ECS.addComponent(entity, resizing)
      i += 1
    }
  }

  private async getTextureImage(el: Texture) {
    const pathStr = el.givePath().asThisEditorPath(true)
    try {
      const i = (await this.manager.getItem(pathStr)) as HTMLImageElement | null
      return i
    } catch {
      return null
    }
  }

  public async start() {
    await this.registerEntitiesFromMap()
    await this.init()
  }

  public async saveTexture(data: Readonly<{ val: string }>) {
    const img = await this.manager.getItem(`${data.val}[FULL]`)
    if (img === null) throw new Error('Invalid texture path!')
    const b = new Bild(img)
    await b.init()
    const image = await loadImage(b.giveBuffer())
    await this.manager.saveItem(data.val, image, true, false)
    await this.renderSystem.saveImage(data.val, image)
    console.log(this.manager)
  }

  public async init() {
    this.renderSystem.init()
    this.ECS.addSystem(this.selectSystem)
    this.ECS.addSystem(this.highlightSystem)
    this.ECS.addSystem(this.filterSystem)
    this.ECS.addSystem(this.renderSystem)
    this.ECS.addSystem(this.mapCreatorSystem)
    this.ECS.addSystem(this.moveSystem)
    this.ECS.addSystem(this.resizeSystem)
    this.ECS.addSystem(this.messageSystem)
    this.ECS.addSystem(this.receiveMessageSystem)
    this.ECS.addSystem(this.updataRenderSystem)
    this.ECS.addSystem(this.selectPositionSystem)
    this.ECS.addSystem(this.startResizingSystem)
    this.ECS.addSystem(this.selectSizeSystem)
    this.ECS.addSystem(this.textureMessageSystem)
    this.ECS.addSystem(this.createEntitySystem)
    console.log(this.textureMessageSystem, this.createEntitySystem)
    this.pixi.addDispatch(this.dispatch)
    const info = this.map.giveMetaInfo()
    this.resizeRender(this.drawSrc.width, this.drawSrc.height)
    await this.cacheImagesForRender()
    this.ECS.update()
  }

  public async cacheImagesForRender() {
    const promises: Promise<void>[] = []
    console.log(this.manager)
    for (const [, v] of Object.entries(this.map.giveTextures())) {
      const cacheImage = (async () => {
        const x = v
        const element = await this.getTextureImage(x)
        if (element === null) return
        console.log(element)
        await this.renderSystem.saveImage(
          x.givePath().asThisEditorPath(),
          element
        )
      })()
      promises.push(cacheImage)
    }
    await Promise.allSettled(promises)
  }

  public async addImage(key: string, img: Readonly<HTMLImageElement>) {
    await this.renderSystem.saveImage(key, img)
  }
}

export default ECSFromMap
