import type Texture from '../texture/texture'

class Panel {
  public constructor(
    private readonly position: Readonly<{ x: number; y: number }>,
    private readonly dimesions: Readonly<{ width: number; height: number }>,
    private readonly texture: Texture
  ) {}

  public givePosition() {
    return { x: this.position.x, y: this.position.y }
  }

  public giveDimensions() {
    return { width: this.dimesions.width, height: this.dimesions.height }
  }

  public giveTexture() {
    return this.texture
  }
}

export default Panel
