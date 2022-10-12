import {
  compareResourceBasename,
  compareResourceDirectory,
} from '../../df/compare-names'
import { DFWad } from '../../df/resource/wad/dfwad'
import parseAnim from '../../parser/anim/typescript-anim'

class AnimTexture {
  private readonly wad: DFWad

  private initialised = false

  private readonly backanimation = 0

  private readonly framecount = 0

  private frameheight = 64

  private framewidth = 64

  private resource = ''

  private readonly waitcount = 0

  private resourceBuffer = new ArrayBuffer(0)

  public constructor(private readonly src: Readonly<ArrayBuffer>) {
    this.wad = new DFWad(src)
  }

  public giveInfo() {
    return {
      width: this.framewidth,
      height: this.frameheight,
      res: this.resource,
    }
  }

  public giveFullImage() {
    return this.resourceBuffer
  }

public async init() {
    await this.wad.init()
    if (!this.wad.isSupported) {
      throw new Error('Unsupported DFWad passed to AnimTexture!')
    }
    const description = this.wad.loadFileAsString(
      (p) =>
        compareResourceDirectory(p, ['text']) &&
        compareResourceBasename(p, 'anim')
    )
    if (description === undefined) {
      throw new Error(
        "Animated texture (?) doesn't have the TEXT/ANIM description file!"
      )
    }
    const anim = parseAnim(description)
    if (
      typeof anim.frameheight !== 'number' ||
      typeof anim.framewidth !== 'number' ||
      typeof anim.resource !== 'string'
    ) {
      throw new TypeError(
        'Invalid animtexture config value type in AnimTexture!'
      )
    }
    this.resource = anim.resource
    this.frameheight = anim.frameheight
    this.framewidth = anim.framewidth
    const p = this.wad.loadFileAsArrayBuffer(
      (x) =>
        compareResourceBasename(x, this.resource) &&
        compareResourceDirectory(x, ['TEXTURES'])
    )
    if (p === undefined) {
      throw new Error('Missing resource in AnimTexture!')
    }
    this.resourceBuffer = p
    this.initialised = true
  }
}

export default AnimTexture
