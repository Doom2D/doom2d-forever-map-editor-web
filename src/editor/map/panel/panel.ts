import type Texture from '../texture/texture'

import PanelType from './type/type'

class Panel {
  private readonly position: { x: number; y: number }

  private readonly dimensions: { width: number; height: number }

  private readonly texture: Readonly<Texture>

  private readonly type: Readonly<PanelType>

  public constructor(
    a: Readonly<{
      position: Readonly<{ x: number; y: number }>
      dimensions: Readonly<{ width: number; height: number }>
      texture: Readonly<Texture>
      type: string
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

  public giveRenderOrder() {
    return this.type.giveRenderOrder()
  }
}

export default Panel
