/* eslint-disable max-lines */
import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { TilingSprite } from '@pixi/picture'

import ResourceManager from '../../resource-manager/resource-manager'
import { type Renderer, type RenderOptions } from '../interface'
import type Dispatch from '../../dispatch/dispatch'

class Pixi implements Renderer {
  private readonly renderer: PIXI.Renderer

  private readonly ticker = new PIXI.Ticker()

  private stage = new PIXI.Container()

  private readonly resourceManager: ResourceManager

  private dispatch: Readonly<Dispatch> | undefined

  private viewport: Viewport

  private readonly state: {
    entityStates: (
      | {
          arrows: (PIXI.Sprite | PIXI.TilingSprite)[]
          cleared: boolean
          imgKey: string
        }
      | undefined
    )[]
  } = {
    entityStates: [],
  }

  public constructor(private readonly src: Readonly<HTMLCanvasElement>) {
    this.renderer = new PIXI.Renderer({
      width: src.clientWidth,
      height: src.clientHeight,
      backgroundColor: 0,
      view: this.src,
      antialias: false,
    })
    this.renderer.state.blendModes[30] = [
      this.renderer.gl.ZERO,
      this.renderer.gl.SRC_COLOR,
    ]
    this.viewport = new Viewport({
      screenWidth: src.clientWidth,
      screenHeight: src.clientHeight,

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      interaction: this.renderer.plugins.interaction as PIXI.InteractionManager,
    })
    this.stage.addChild(this.viewport)
    this.viewport
      .drag({
        keyToPress: ['ShiftLeft'],
      })
      .wheel()
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
    this.resourceManager = new ResourceManager()
    this.viewport.addListener(
      'pointerup',
      (ev: Readonly<PIXI.InteractionEvent>) => {
        if (ev.data.originalEvent.shiftKey) return
        const s = this.renderer.plugins.interaction.hitTest(ev.data.global)
        const e = this.resourceManager.findCached(s)
        if (e === undefined) {
          this.dispatch?.dispatch('onMouseInAir', {
            entity: -1,
            renderer: this,
          })
        } else {
          this.dispatch?.dispatch('onMouseUpGeneral', {
            entity: e,
            renderer: this,
          })
        }
      }
    )
  }

  public lastMousePosition(): { x: number; y: number } {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const interaction = this.renderer.plugins
      .interaction as PIXI.InteractionManager
    const a = this.viewport.toWorld(
      interaction.mouse.global.x,
      interaction.mouse.global.y
    )
    return {
      x: a.x,
      y: a.y,
    }
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
      ticker: this.ticker,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      interaction: this.renderer.plugins.interaction as PIXI.InteractionManager,
    })
    this.viewport
      .drag({
        keyToPress: ['ShiftLeft'],
      })
      .wheel()
    this.stage.addChild(this.viewport)
  }

  public addDispatch(dispatch: Readonly<Dispatch>): void {
    this.dispatch = dispatch
  }

  public resize(width: number, height: number): void {
    this.renderer.resize(width, height)
    this.viewport.resize(width, height)
  }

  public clearAllArrows() {
    for (const [, v] of Object.entries(this.state)) {
      for (const [, w] of Object.entries(v)) {
        if (w?.arrows !== undefined) {
          for (const [, a] of Object.entries(w.arrows)) {
            this.viewport.removeChild(a)
          }
        }
      }
    }
  }

  public clearArrows(n: number) {
    const a = this.state.entityStates[n]
    if (a === undefined) return
    for (const [, v] of Object.entries(a.arrows)) {
      this.viewport.removeChild(v)
    }
  }
  private clearSpriteHighlight(
    sprite: Readonly<PIXI.Sprite | PIXI.TilingSprite>
  ) {
    sprite.removeChildren()
  }

  private entityToString(n: number) {
    return String(n)
  }

  private addEvents(sprite: Readonly<PIXI.TilingSprite>, entity: number) {
    const d = this.dispatch
    if (d === undefined) throw new Error('Dispatch is not defined yet!')
    const x = sprite
    const onDragStart = (ev: Readonly<PIXI.InteractionEvent>) => {
      if (ev.data.originalEvent.shiftKey) return
      const point = this.viewport.toWorld(ev.data.global)
      const offset = {
        x: x.x - Math.round(point.x),
        y: x.y - Math.round(point.y),
      }
      console.log('dragStart')
      d.dispatch('onDragStart', {
        renderer: this,
        entity,
        offset,
      })
    }
    const onDragMove = (ev: Readonly<PIXI.InteractionEvent>) => {
      const point = this.viewport.toWorld(ev.data.global)
      d.dispatch('onDragMove', {
        renderer: this,
        entity,

        point: {
          x: point.x,
          y: point.y,
        },
      })
    }
    const onDragEnd = (ev: Readonly<PIXI.InteractionEvent>) => {
      if (ev.data.originalEvent.shiftKey) return
      const point = this.viewport.toWorld(ev.data.global)
      d.dispatch('onDragEnd', {
        renderer: this,
        entity,

        point: {
          x: point.x,
          y: point.y,
        },
      })
    }

    sprite.addListener('mousedown', onDragStart)
    sprite.addListener('touchdown', onDragStart)
    sprite.addListener('mousemove', onDragMove)
    sprite.addListener('mouseup', onDragEnd)
    sprite.addListener('mouseupoutside', onDragEnd)
    sprite.addListener('touchend', onDragEnd)
    sprite.addListener('touchendoutside', onDragEnd)
  }

  public async highlight(n: number) {
    const sprite = (await this.resourceManager.getItem(
      this.entityToString(n)
    )) as PIXI.TilingSprite
    const outline = new PIXI.Graphics()
    outline.beginFill(0xff_ff_00)
    outline.lineStyle(1, 0xff_00_00)
    outline.alpha = 0.5
    outline.drawRect(0, 0, sprite.width, sprite.height)
    this.clearSpriteHighlight(sprite)
    sprite.addChild(outline)
  }

  public async addResizeArrows(entity: number) {
    // this.clearArrows(entity)
    const sprite = (await this.resourceManager.getItem(
      this.entityToString(entity)
    )) as PIXI.TilingSprite

    const width = 4
    const height = 4
    const leftRect = new PIXI.Sprite(PIXI.Texture.WHITE)
    leftRect.width = width
    leftRect.height = height
    leftRect.tint = 0xff_ff_ff
    leftRect.x = sprite.x - leftRect.width
    leftRect.y = sprite.y + sprite.height / 2 - leftRect.height / 2
    leftRect.interactive = true
    this.viewport.addChild(leftRect)

    const addListeners = (name: string, direction: string, s: PIXI.Sprite) => {
      s.addListener('pointerdown', (ev: Readonly<PIXI.InteractionEvent>) => {
        if (ev.data.originalEvent.shiftKey) return
        this.dispatch?.dispatch('resizeStart', {
          direction,
          entity,

          base: {
            w: sprite.texture.baseTexture.realWidth,
            h: sprite.texture.baseTexture.realHeight,
          },

          canonical: {
            x: sprite.x,
            y: sprite.y,
            w: sprite.width,
            h: sprite.height,
          },
        })
      })

      s.addListener('pointermove', (ev: Readonly<PIXI.InteractionEvent>) => {
        const point = this.viewport.toWorld(ev.data.global)
        const w = {
          renderer: this,
          entity,

          arrow: {
            x: s.x,
            y: s.y,
            w: s.width,
            h: s.height,
          },

          sprite: {
            x: sprite.x,
            y: sprite.y,
            w: sprite.width,
            h: sprite.height,
          },

          point: {
            x: point.x,
            y: point.y,
          },
        }
        this.dispatch?.dispatch(name, w)
      })
    }

    addListeners('resizeLeft', 'left', leftRect)

    const rightRect = new PIXI.Sprite(PIXI.Texture.WHITE)
    rightRect.width = width
    rightRect.height = height
    rightRect.tint = 0xff_ff_ff
    rightRect.x = sprite.x + sprite.width
    rightRect.y = sprite.y + sprite.height / 2 - rightRect.height / 2
    rightRect.interactive = true
    this.viewport.addChild(rightRect)

    addListeners('resizeRight', 'right', rightRect)

    const topRect = new PIXI.Sprite(PIXI.Texture.WHITE)
    topRect.width = width
    topRect.height = height
    topRect.tint = 0xff_ff_ff
    topRect.x = sprite.x + sprite.width / 2 - width / 2
    topRect.y = sprite.y - topRect.height
    topRect.interactive = true
    this.viewport.addChild(topRect)

    addListeners('resizeTop', 'top', topRect)

    const bottomRect = new PIXI.Sprite(PIXI.Texture.WHITE)
    bottomRect.width = width
    bottomRect.height = height
    bottomRect.tint = 0xff_ff_ff
    bottomRect.x = sprite.x + sprite.width / 2 - width / 2
    bottomRect.y = sprite.y + sprite.height
    bottomRect.interactive = true
    this.viewport.addChild(bottomRect)

    addListeners('resizeBottom', 'bottom', bottomRect)

    const topLeftRect = new PIXI.Sprite(PIXI.Texture.WHITE)
    topLeftRect.width = width
    topLeftRect.height = height
    topLeftRect.tint = 0xff_ff_ff
    topLeftRect.x = sprite.x - topLeftRect.width
    topLeftRect.y = sprite.y - topLeftRect.height
    topLeftRect.interactive = true
    this.viewport.addChild(topLeftRect)

    addListeners('resizeTopLeft', 'topleft', topLeftRect)

    const bottomLeftRect = new PIXI.Sprite(PIXI.Texture.WHITE)
    bottomLeftRect.width = width
    bottomLeftRect.height = height
    bottomLeftRect.tint = 0xff_ff_ff
    bottomLeftRect.x = sprite.x - bottomLeftRect.width
    bottomLeftRect.y = sprite.y + sprite.height
    bottomLeftRect.interactive = true
    this.viewport.addChild(bottomLeftRect)

    addListeners('resizeBottomLeft', 'bottomleft', bottomLeftRect)

    const topRightRect = new PIXI.Sprite(PIXI.Texture.WHITE)
    topRightRect.width = width
    topRightRect.height = height
    topRightRect.tint = 0xff_ff_ff
    topRightRect.x = sprite.x + sprite.width
    topRightRect.y = sprite.y - topRightRect.height
    topRightRect.interactive = true
    this.viewport.addChild(topRightRect)

    addListeners('resizeTopRight', 'topright', topRightRect)

    const bottomRightRect = new PIXI.Sprite(PIXI.Texture.WHITE)
    bottomRightRect.width = width
    bottomRightRect.height = height
    bottomRightRect.tint = 0xff_ff_ff
    bottomRightRect.x = sprite.x + sprite.width
    bottomRightRect.y = sprite.y + sprite.height
    bottomRightRect.interactive = true
    this.viewport.addChild(bottomRightRect)
    this.clearAllArrows()
    const u = this.state.entityStates[entity]
    if (u === undefined) throw new Error('Invalid entity!')
    u.arrows = [
      leftRect,
      rightRect,
      topRect,
      bottomRect,
      topLeftRect,
      bottomLeftRect,
      topRightRect,
      bottomRightRect,
    ]

    addListeners('resizeBottomRight', 'bottomright', bottomRightRect)
  }

  public async clearHighlight(n: number) {
    try {
      const sprite = (await this.resourceManager.getItem(
        this.entityToString(n)
      )) as PIXI.TilingSprite
      sprite.removeChildren()
    } catch {}
  }
  private async updateSpriteTexture(
    sprite: PIXI.Sprite | PIXI.TilingSprite,
    imgKey: string
  ) {
    const texture = (await this.resourceManager.getItem(imgKey)) as PIXI.Texture
    sprite.texture = texture
  }

  public async registerEntity(n: number, imgKey: string): Promise<void> {
    const entityString = this.entityToString(n)
    if (this.state.entityStates[n] === undefined) {
      this.state.entityStates[n] = {
        arrows: [],
        cleared: false,
        imgKey,
      }
    }
    if (
      imgKey === '[]_water_0' ||
      imgKey === '[]_water_1' ||
      imgKey === '[]_water_2'
    ) {
      const sprite = new TilingSprite(PIXI.Texture.WHITE)
      switch (imgKey) {
        case '[]_water_0':
          sprite.tint = 0x00_00_ff
          break
        case '[]_water_1':
          sprite.tint = 0x00_e0_00
          break
        case '[]_water_2':
          sprite.tint = 0xe0_00_00
          break
        default:
          throw new Error('Unknown water special texture!')
      }
      sprite.blendMode = 30
      sprite.interactive = true
      await this.resourceManager.saveItem(entityString, sprite, true)
    } else {
      try {
        if (!this.resourceManager.cachedAtKey(entityString)) {
          const texture = (await this.resourceManager.getItem(
            imgKey
          )) as PIXI.Texture
          const sprite = new PIXI.TilingSprite(texture)
          this.addEvents(sprite, n)
          await this.resourceManager.saveItem(entityString, sprite, true)
          sprite.interactive = true
        }
      } catch {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(16_768_256)
        graphics.lineStyle(5, 16_768_256)
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

  public async removeEntity(n: number) {
    try {
      const entityString = this.entityToString(n)
      if (!this.resourceManager.cachedAtKey(entityString)) return
      const sprite = (await this.resourceManager.getItem(
        entityString
      )) as PIXI.TilingSprite
      this.clearSpriteHighlight(sprite)
      // sprite.removeAllListeners()
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      this.viewport.removeChild(sprite)
    } catch {

    }
    this.clearArrows(n)
  }

  public async deleteEntity(n: number) {
    await this.removeEntity(n)
    this.resourceManager.removeItem(this.entityToString(n), true, false)
  }

  public async render(options: Readonly<RenderOptions>) {
    if (options.sprite === undefined || options.sprite === true) {
      if (
        !this.resourceManager.cachedAtKey(this.entityToString(options.entity))
      ) {
        await this.registerEntity(options.entity, options.imgKey ?? '')
      }
      const sprite = (await this.resourceManager.getItem(
        this.entityToString(options.entity)
      )) as PIXI.TilingSprite
      if (
        options.imgKey !== undefined &&
        this.state.entityStates[options.entity] !== undefined &&
        this.state.entityStates[options.entity]?.imgKey !== options.imgKey
      ) {
        this.updateSpriteTexture(sprite, options.imgKey)
        this.state.entityStates[options.entity].imgKey = options.imgKey
      }
      sprite.position.set(options.x ?? sprite.x, options.y ?? sprite.y)
      sprite.width = options.w ?? sprite.width
      sprite.height = options.h ?? sprite.height
      if (options.alpha !== undefined) sprite.alpha = options.alpha
      if (options.tint !== undefined) sprite.tint = options.tint
      if (sprite.parent !== this.viewport) {
        this.viewport.addChild(sprite)
      }
    }
  }
}

export default Pixi
