import type Texture from '../texture/texture'

import { PanelAlpha } from './alpha/alpha'
import PanelFlag from './flag/flag'
import { PanelPlatform } from './platform/platform'
import PanelType from './type/type'

class Panel {
  private readonly position: { x: number; y: number }

  private readonly dimensions: { width: number; height: number }

  private readonly texture: Readonly<Texture>

  private readonly type: Readonly<PanelType>

  private readonly flag: Readonly<PanelFlag>

  private readonly alpha: Readonly<PanelAlpha>

  private readonly platform: Readonly<PanelPlatform>

  public constructor(
    a: Readonly<{
      position: Readonly<{ x: number; y: number }>
      dimensions: Readonly<{ width: number; height: number }>
      texture: Readonly<Texture>
      type: string
      flags: unknown
      alpha: number
      moveSpeed: Readonly<number[]>
      sizeSpeed: Readonly<number[]>
      moveStart: Readonly<number[]>
      moveEnd: Readonly<number[]>
      sizeEnd: Readonly<number[]>
      moveActive: boolean
      moveOnce: boolean
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
    this.platform = new PanelPlatform()
    this.platform.setMoveSpeed(a.moveSpeed[0], a.moveSpeed[1])
    this.platform.setSizeSpeed(a.sizeSpeed[0], a.sizeSpeed[1])
    this.platform.setMoveStart(a.moveStart[0], a.moveStart[1])
    this.platform.setMoveEnd(a.moveEnd[0], a.moveEnd[1])
    this.platform.setSizeEnd(a.sizeEnd[0], a.sizeEnd[1])
    this.platform.setMoveActive(a.moveActive)
    this.platform.setMoveOnce(a.moveOnce)
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

  public givePlatform() {
    return this.platform
  }
}

export default Panel
