import type ResourcePath from '../../../df/resource/path/path'

class Texture {
  public constructor(private readonly path: ResourcePath, private readonly animated?: boolean) {}

  public givePath() {
    return this.path
  }

  public isAnimated() {
    return this.animated !== undefined && this.animated
  }
}

export default Texture
