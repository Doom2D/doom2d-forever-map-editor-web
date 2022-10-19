import * as PIXI from 'pixi.js'

import ResourceManager from '../../resource-manager/resource-manager'
import { type Renderer, type RenderOptions } from '../interface'

class Pixi implements Renderer {
  private readonly renderer: PIXI.Renderer

  private readonly ticker = new PIXI.Ticker()

  private stage = new PIXI.Container()

  private readonly resourceManager: ResourceManager

  public constructor(private readonly src: Readonly<HTMLCanvasElement>) {
    this.renderer = new PIXI.Renderer({
      width: 800,
      height: 600,
      backgroundColor: 0x00_57_b7,
      view: this.src,
    })
    this.resourceManager = new ResourceManager()
  }

  public init() {
    this.ticker.add(() => {
      this.renderer.render(this.stage)
    }, PIXI.UPDATE_PRIORITY.LOW)
    this.ticker.start()
  }

  public deleteEntity(n: number): void {
    throw new Error('This method is not defined!')
  }

  public update(): void {
    this.renderer.render(this.stage)
  }

  public clear(): void {
    this.stage.destroy(true)
    this.stage = new PIXI.Container()
  }

  public resize(width: number, height: number): void {
    this.renderer.resize(width, height)
  }

  private entityToString(n: number) {
    return `___${n}___`
  }

  public async registerEntity(n: number, imgKey: string): Promise<void> {
    const entityString = this.entityToString(n)
    try {
      if (!this.resourceManager.cachedAtKey(entityString)) {
        const texture = (await this.resourceManager.getItem(
          imgKey
        )) as PIXI.Texture
        const sprite = new PIXI.TilingSprite(texture)
        await this.resourceManager.saveItem(entityString, sprite)
      }
    } catch {
      const graphics = new PIXI.Graphics()
      graphics.beginFill(0xff_dd_00)
      graphics.lineStyle(5, 0xff_dd_00)
      graphics.drawRect(0, 0, 1, 1)
      graphics.endFill()
      const texture = this.renderer.generateTexture(graphics)
      const sprite = new PIXI.TilingSprite(texture)
      await this.resourceManager.saveItem(entityString, sprite)
    }
  }

  public async saveImage(
    key: string,
    src: Readonly<HTMLImageElement>
  ): Promise<void> {
    const baseTexture = new PIXI.BaseTexture(src)
    const texture = new PIXI.Texture(baseTexture)
    await this.resourceManager.saveItem(key, texture)
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
    sprite.position.x = options.x
    sprite.position.y = options.y
    sprite.width = options.w
    sprite.height = options.h
    if (sprite.parent !== this.stage) {
      this.stage.addChild(sprite)
    }
  }
}

export default Pixi
