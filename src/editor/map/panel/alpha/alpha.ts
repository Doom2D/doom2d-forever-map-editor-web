import { clamp } from "../../../../utility/clamp"

class PanelAlpha {
  public constructor(private readonly src: number) {
    this.src = clamp(src, 0, 255)
  }

  public getGame() {
    return this.src
  }

  public getFloat() {
    return (255 - this.src) / 255
  }
}

export { PanelAlpha }
