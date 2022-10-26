import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

import ResourceManager from '../../resource-manager/resource-manager'
import { type Renderer, type RenderOptions } from '../interface'

const darken = `B.r = min(Cb.r, Cs.r)
B.g = min(Cb.g, Cs.g)
B.r = min(Cb.r, Cs.r)`

class Pixi implements Renderer {
  private readonly renderer: PIXI.Renderer

  private readonly ticker = new PIXI.Ticker()

  private stage = new PIXI.Container()

  private readonly resourceManager: ResourceManager

  private viewport: Viewport

  private readonly coords = {
    screen: {
      x: -1,
      y: -1,
    },

    world: {
      x: -1,
      y: -1,
    }
  }

  public constructor(private readonly src: Readonly<HTMLCanvasElement>) {
    this.renderer = new PIXI.Renderer({
      width: src.clientWidth,
      height: src.clientHeight,
      backgroundColor: 0x00_57_b7,
      view: this.src,
      antialias: false,
    })
    this.viewport = new Viewport({
      screenWidth: src.clientWidth,
      screenHeight: src.clientHeight,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      interaction: this.renderer.plugins.interaction as PIXI.InteractionManager,
    })
    this.stage.addChild(this.viewport)
    this.viewport.drag().pinch().wheel().decelerate()
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
    this.resourceManager = new ResourceManager()
  }

  public lastMousePosition(): { x: number; y: number } {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const interaction = this.renderer.plugins
      .interaction as PIXI.InteractionManager
    const a = this.viewport.toWorld(
      interaction.mouse.global.x,
      interaction.mouse.global.y
    )
    return { x: a.x, y: a.y }
  }

  public init() {
    this.ticker.add(() => {
      this.renderer.render(this.stage)
    }, PIXI.UPDATE_PRIORITY.LOW)
    this.ticker.start()
  }

  public update(): void {
    this.renderer.render(this.stage)
  }

  public deregisterAll() {
    this.viewport.removeChildren()
  }

  public clear(): void {
    this.viewport.removeAllListeners()
    this.viewport.removeChildren()
    this.stage.removeAllListeners()
    this.stage.removeChildren()
    this.viewport.destroy()
    this.stage.destroy(true)
    this.stage = new PIXI.Container()
    this.viewport = new Viewport({
      screenWidth: this.src.clientWidth,
      screenHeight: this.src.clientHeight,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      interaction: this.renderer.plugins.interaction as PIXI.InteractionManager,
    })
    this.viewport.drag().pinch().wheel().decelerate()
    this.stage.addChild(this.viewport)
  }

  public resize(width: number, height: number): void {
    this.renderer.resize(width, height)
    this.viewport.resize(width, height)
  }

  private entityToString(n: number) {
    return `___${n}___`
  }

  public async registerEntity(n: number, imgKey: string): Promise<void> {
    const entityString = this.entityToString(n)
    if (imgKey === '[]_water_0' || imgKey === '[]_water_1' || imgKey === '[]_water_2') {
      const sprite =new PIXI.TilingSprite(PIXI.Texture.WHITE)
      if (imgKey === '[]_water_0') {
        sprite.tint = 0x00_00_ff
      } else if (imgKey === '[]_water_1') {
        sprite.tint = 0x00_e0_00
      } else if (imgKey === '[]_water_2') {
        sprite.tint = 0xe0_00_00
      }
      sprite.interactive = true
      // sprite.blendMode = PIXI.BLEND_MODES.SCREEN
      sprite.filters = [new PIXI.Filter(undefined, darken)]
      sprite.alpha = 0.93
      await this.resourceManager.saveItem(entityString, sprite, true)
    } else {
      try {
        if (!this.resourceManager.cachedAtKey(entityString)) {
          const texture = (await this.resourceManager.getItem(
            imgKey
          )) as PIXI.Texture
          const sprite = new PIXI.TilingSprite(texture)
          await this.resourceManager.saveItem(entityString, sprite, true)
          sprite.interactive = true
        }
      } catch {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(0xff_dd_00)
        graphics.lineStyle(5, 0xff_dd_00)
        graphics.drawRect(0, 0, 1, 1)
        graphics.endFill()
        const texture = this.renderer.generateTexture(graphics)
        const sprite = new PIXI.TilingSprite(texture)
        sprite.interactive = true
        await this.resourceManager.saveItem(entityString, sprite, true)
      }
    }
  }

  public async saveImage(
    key: string,
    src: Readonly<HTMLImageElement>
  ): Promise<void> {
    const baseTexture = new PIXI.BaseTexture(src)
    const texture = new PIXI.Texture(baseTexture)
    await this.resourceManager.saveItem(key, texture, true)
  }

  public async deleteEntity(n: number): void {
    const entityString = this.entityToString(n)
    if (!this.resourceManager.cachedAtKey(entityString)) return
    const sprite = (await this.resourceManager.getItem(
      entityString
    )) as PIXI.TilingSprite
    // eslint-disable-next-line unicorn/prefer-dom-node-remove
    this.viewport.removeChild(sprite)
  }

  public async render(options: Readonly<RenderOptions>): void {
    if (
      !this.resourceManager.cachedAtKey(this.entityToString(options.entity))
    ) {
      await this.registerEntity(options.entity, options.imgKey)
    }

    // sadly, we have to do this
    const sprite = (await this.resourceManager.getItem(
      this.entityToString(options.entity)
    )) as PIXI.TilingSprite
    sprite.position.set(options.x, options.y)
    sprite.width = options.w
    sprite.height = options.h
    if (sprite.parent !== this.viewport) {
      this.viewport.addChild(sprite)
    }
  }
}

export default Pixi
