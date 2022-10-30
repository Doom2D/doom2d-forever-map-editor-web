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
import ImageKey from '../../third-party/ecs/component/texture'
import { PanelTexture } from '../../third-party/ecs/component/panel-texture'
import PathComponent from '../../third-party/ecs/component/path'
import type Texture from '../map/texture/texture'
import { Move } from '../../third-party/ecs/system/move'
import Dispatch from '../../dispatch/dispatch'
import { Highlight } from '../../third-party/ecs/system/highlight'
import { Selected } from '../../third-party/ecs/component/selected'
import { Resize } from '../../third-party/ecs/system/resize'

// more like a Tab
class ECSFromMap {
  private readonly ECS: ECS

  private readonly pixi: Pixi

  private readonly renderSystem: RenderSystem

  private readonly filterSystem: RenderFilter

  private readonly mapCreatorSystem: EditorMapFromECS

  private readonly dispatch: Dispatch

  private readonly moveSystem: Move

  private readonly highlightSystem: Highlight

  private readonly resizeSystem: Resize

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
    this.highlightSystem = new Highlight(this.dispatch)
    this.renderSystem = new RenderSystem(this.pixi)
    this.resizeSystem = new Resize(this.dispatch)
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

  private registerEntitiesFromMap() {
    const bindings: {
      texture: Texture
      entity: number
    }[] = []
    for (const [, v] of Object.entries(this.map.giveTextures())) {
      const entity = this.ECS.addEntity()
      const path = v.givePath()
      const c = new PathComponent(path)
      const type = new Type('texture')
      this.ECS.addComponent(entity, type)
      this.ECS.addComponent(entity, c)
      bindings.push({
        texture: v,
        entity,
      })
    }
    for (const [, v] of Object.entries(this.map.givePanels())) {
      const entity = this.ECS.addEntity()
      const pos = v.givePosition()
      const dimensions = v.giveDimensions()
      const position = new Position(pos.x, pos.y)
      const size = new Size(dimensions.width, dimensions.height)
      const pathStr = v.giveTexture().givePath().asThisEditorPath(false)
      const texture = new ImageKey(pathStr)
      const shouldRender = new ForRender(false)
      const typeComponent = new PanelTypeComponent(v.giveType())
      const flagComponent = new PanelFlags(v.giveFlag())
      const type = new Type('panel')
      const t = v.giveTexture()
      const s = bindings.find((q) => q.texture === t)
      if (s === undefined) throw new Error('Texture is not found!')
      const textureComponent = new PanelTexture(s.entity)
      const selected = new Selected(false)
      this.ECS.addComponent(entity, position)
      this.ECS.addComponent(entity, size)
      this.ECS.addComponent(entity, texture)
      this.ECS.addComponent(entity, shouldRender)
      this.ECS.addComponent(entity, type)
      this.ECS.addComponent(entity, typeComponent)
      this.ECS.addComponent(entity, flagComponent)
      this.ECS.addComponent(entity, textureComponent)
      this.ECS.addComponent(entity, selected)
    }
  }

  public giveMap() {
    this.mapCreatorSystem.createMap()
    this.ECS.update()
    return this.mapCreatorSystem.giveMap()
  }

  public async start() {
    this.registerEntitiesFromMap()
    await this.init()
  }

  public async init() {
    this.renderSystem.init()
    this.ECS.addSystem(this.filterSystem)
    this.ECS.addSystem(this.renderSystem)
    this.ECS.addSystem(this.mapCreatorSystem)
    this.ECS.addSystem(this.moveSystem)
    this.ECS.addSystem(this.highlightSystem)
    this.ECS.addSystem(this.resizeSystem)
    this.pixi.addDispatch(this.dispatch)
    const info = this.map.giveMetaInfo()
    this.resizeRender(this.drawSrc.width, this.drawSrc.height)
    await this.cacheImagesForRender()
    this.ECS.update()
  }

  public async cacheImagesForRender() {
    const promises: Promise<void>[] = []
    for (const [, v] of Object.entries(this.map.giveTextures())) {
      const pathStr = v.givePath().asThisEditorPath(false)
      const cacheImage = (async () => {
        const x = pathStr
        const element = (await this.manager.getItem(
          x
        )) as HTMLImageElement | null
        if (element === null) return
        await this.renderSystem.saveImage(x, element)
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
