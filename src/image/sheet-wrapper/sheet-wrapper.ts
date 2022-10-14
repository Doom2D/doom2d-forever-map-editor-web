import Bild from '../bild'

class AnimTextureWrapper extends Bild {
  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly framewidth?: number,
    private readonly frameheight?: number
  ) {
    super(src, framewidth, frameheight)
  }

  public giveInfo() {
    return super.giveInfo()
  }

  public giveBuffer() {
    return super.giveBuffer()
  }

  public giveBufferFull() {
    return this.src
  }

  public async init() {
    await super.init()
  }
}

export default AnimTextureWrapper
