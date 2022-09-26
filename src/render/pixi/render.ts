import * as PIXI from 'pixi.js'

import { type Renderer, type RenderOptions } from '../interface'

class Pixi implements Renderer {
  private readonly renderer = new PIXI.Renderer({
    width: 800,
    height: 600,
    backgroundColor: 0x10_99_bb,
  })

  private readonly ticker = new PIXI.Ticker()

  private stage = new PIXI.Container()

  public constructor() {
    this.ticker.add(() => {
      this.renderer.render(this.stage)
    }, PIXI.UPDATE_PRIORITY.LOW)
    this.ticker.start()
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public init(element: Readonly<HTMLElement>) {
    element.append(this.renderer.view)
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public loadImage(src: Readonly<HTMLCanvasElement>) {
    console.log(src)
    return 0
  }

  public render(options: RenderOptions): void {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(0xFFFF00)
    graphics.drawRect(options.x, options.y, options.w, options.h)
    this.stage.addChild(graphics)
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
}

export default Pixi
