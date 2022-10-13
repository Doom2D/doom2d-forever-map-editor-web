import convertedImageBuffer from './converted-image-buffer'
import imageDimensions from './image-dimensions'

class Bild {
  private readonly targetExtension = 'png'

  private readonly convertedImage: convertedImageBuffer

  private imageBuffer: ArrayBuffer = new ArrayBuffer(0)

  private width = -1

  private height = -1

  public constructor(private readonly src: Readonly<ArrayBuffer>) {
    this.convertedImage = new convertedImageBuffer(
      this.src,
      this.targetExtension
    )
  }

  public giveInfo() {
    return { width: this.width, height: this.height }
  }

  public giveBuffer() {
    return this.imageBuffer
  }

  public async init() {
    const w = await this.convertedImage.giveConvertedBuffer()
    const x = new imageDimensions(w)
    const y = await x.giveInfo()
    this.width = y.width
    this.height = y.height
    this.imageBuffer = w
  }
}

export default Bild
