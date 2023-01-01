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
          useImg: boolean
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
      backgroundColor: 0x40_60_7f,
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
      'mousemove',
      (ev: Readonly<PIXI.InteractionEvent>) => {
        const point = this.viewport.toWorld(ev.data.global)
        this.dispatch?.dispatch('onMouseMove', {
          renderer: this,

          point: {
            x: point.x,
            y: point.y,
          },
        })
      }
    )
    this.viewport.addListener(
      'pointerup',
      (ev: Readonly<PIXI.InteractionEvent>) => {
        if (ev.data.originalEvent.shiftKey) return
        const s = this.renderer.plugins.interaction.hitTest(ev.data.global)
        const e = this.resourceManager.findCached(s)
        if (ev.data.button === 0) {
          // left click
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
        } else if (ev.data.button === 2) {
          // right click
          if (e === undefined) {
            this.dispatch?.dispatch('onRightMouseUpInAir', {
              entity: -1,
              renderer: this,
            })
          } else {
            this.dispatch?.dispatch('onRightMouseUpGeneral', {
              entity: e,
              renderer: this,
            })
          }
        }
      }
    )
    this.viewport.addListener(
      'pointerdown',
      (ev: Readonly<PIXI.InteractionEvent>) => {
        if (ev.data.button !== 2) return
        const s = this.renderer.plugins.interaction.hitTest(ev.data.global)
        const e = this.resourceManager.findCached(s)
        const point = this.viewport.toWorld(ev.data.global)
        if (e === undefined) {
          this.dispatch?.dispatch('onRightMouseDownInAir', {
            entity: -1,
            renderer: this,

            point: {
              x: point.x,
              y: point.y,
            },
          })
        } else {
          this.dispatch?.dispatch('onRightMouseDownGeneral', {
            entity: e,
            renderer: this,

            point: {
              x: point.x,
              y: point.y,
            },
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

  private clearSpriteHighlight(
    sprite: Readonly<PIXI.Sprite | PIXI.TilingSprite>
  ) {
    sprite.removeChildren()
  }

  public applyRenderOptionsToSprite(
    sprite: PIXI.Sprite | PIXI.TilingSprite,
    options: Readonly<RenderOptions>
  ) {
    sprite.position.set(options.x ?? sprite.x, options.y ?? sprite.y)
    sprite.width = options.w ?? sprite.width
    sprite.height = options.h ?? sprite.height
    if (options.create === true) {
      sprite.blendMode = options.filter === true ? 30 : PIXI.BLEND_MODES.NORMAL
      sprite.alpha = options.alpha ?? 1
      sprite.tint = options.tint ?? 0xff_ff_ff
    } else {
      if (options.filter === true) sprite.blendMode = 30
      else if (options.filter === false)
        sprite.blendMode = PIXI.BLEND_MODES.NORMAL
      if (options.alpha !== undefined) sprite.alpha = options.alpha
      if (options.tint !== undefined) sprite.tint = options.tint
    }
  }

  public addSpriteToView(sprite: PIXI.Sprite | PIXI.TilingSprite) {
    if (sprite.parent !== this.viewport) {
      this.viewport.addChild(sprite)
    }
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
      d.dispatch('onDragStart', {
        renderer: this,
        entity,
        offset,

        point: {
          x: point.x,
          y: point.y,
        },
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

  public async registerEntity(options: Readonly<RenderOptions>): Promise<void> {
    const entityString = this.entityToString(options.entity)
    if (this.state.entityStates[options.entity] === undefined) {
      this.state.entityStates[options.entity] = {
        arrows: [],
        cleared: false,
        imgKey: options.imgKey ?? '',
        useImg: true,
      }
    }
    if (options.useImg === false) {
      this.state.entityStates[options.entity].useImg = false
      const sprite = new TilingSprite(PIXI.Texture.WHITE)
      sprite.interactive = true
      this.addEvents(sprite, options.entity)
      await this.resourceManager.saveItem(entityString, sprite, true)
    } else {
      this.state.entityStates[options.entity].useImg = true
      try {
        const texture = (await this.resourceManager.getItem(
          options.imgKey ?? ''
        )) as PIXI.Texture
        const sprite = new PIXI.TilingSprite(texture)
        this.addEvents(sprite, options.entity)
        await this.resourceManager.saveItem(entityString, sprite, true)
        sprite.interactive = true
      } catch {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(0x00_ff_00)
        graphics.lineStyle(5, 0x00_ff_00)
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
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      this.viewport.removeChild(sprite)
    } catch {}
  }

  public async deleteEntity(n: number) {
    await this.removeEntity(n)
    this.resourceManager.removeItem(this.entityToString(n), true, false)
  }

  public async render(options: RenderOptions) {
    if (options.useImg === undefined || options.useImg === true) {
      if (
        !this.resourceManager.cachedAtKey(this.entityToString(options.entity))
      ) {
        await this.registerEntity(options)
      }
      const sprite = (await this.resourceManager.getItem(
        this.entityToString(options.entity)
      )) as PIXI.TilingSprite
      if (
        options.imgKey !== undefined &&
        this.state.entityStates[options.entity] !== undefined &&
        (this.state.entityStates[options.entity]?.imgKey !== options.imgKey ||
          this.state.entityStates[options.entity]?.useImg === false)
      ) {
        this.updateSpriteTexture(sprite, options.imgKey)
        this.state.entityStates[options.entity].imgKey = options.imgKey
        this.state.entityStates[options.entity].useImg = true
      }
      this.state.entityStates[options.entity].useImg = true
      this.applyRenderOptionsToSprite(sprite, options)
      this.addSpriteToView(sprite)
    } else {
      if (
        !this.resourceManager.cachedAtKey(this.entityToString(options.entity))
      ) {
        await this.registerEntity(options)
      }
      const sprite = (await this.resourceManager.getItem(
        this.entityToString(options.entity)
      )) as PIXI.TilingSprite
      if (this.state.entityStates[options.entity]?.useImg ?? false) {
        sprite.texture = PIXI.Texture.WHITE
        options.create = true
        this.state.entityStates[options.entity].useImg = false
      }
      this.applyRenderOptionsToSprite(sprite, options)
      this.addSpriteToView(sprite)
    }
  }
}

export default Pixi
