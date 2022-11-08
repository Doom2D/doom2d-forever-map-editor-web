import type Texture from '../texture/texture'

import { PanelAlpha } from './alpha/alpha'
import PanelFlag from './flag/flag'
import PanelType from './type/type'

class Panel {
  private readonly position: { x: number; y: number }

  private readonly dimensions: { width: number; height: number }

  private readonly texture: Readonly<Texture>

  private readonly type: Readonly<PanelType>

  private readonly flag: Readonly<PanelFlag>

  private readonly alpha: Readonly<PanelAlpha>

  public constructor(
    a: Readonly<{
      position: Readonly<{ x: number; y: number }>
      dimensions: Readonly<{ width: number; height: number }>
      texture: Readonly<Texture>
      type: string
      flags: unknown
      alpha: number
    }>
  ) {
    this.position = {
      x: a.position.x,
      y: a.position.y,
    }
    this.dimensions = {
      width: a.dimensions.width,
      height: a.dimensions.height,
    }
    this.texture = a.texture
    this.type = new PanelType(a.type)
    this.flag = new PanelFlag(a.flags)
    this.alpha = new PanelAlpha(a.alpha)
  }

  public givePosition() {
    return { x: this.position.x, y: this.position.y }
  }

  public giveDimensions() {
    return { width: this.dimensions.width, height: this.dimensions.height }
  }

  public giveTexture() {
    return this.texture
  }

  public giveFlags() {
    return this.flag.giveFlags()
  }

  public giveType() {
    return this.type
  }

  public giveFlag() {
    return this.flag
  }

  public giveRenderOrder() {
    return this.type.giveRenderOrder()
  }

  public giveAlpha() {
    return this.alpha
  }
}

export default Panel
