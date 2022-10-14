import convertedImageBuffer from './converted-image-buffer'
import imageDimensions from './image-dimensions'
import imageResized from './image-resized'

class Bild {
  private readonly targetExtension = 'png'

  private readonly convertedImage: convertedImageBuffer

  private imageBuffer: ArrayBuffer = new ArrayBuffer(0)

  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private width: number | undefined,
    private height: number | undefined
  ) {
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
    this.imageBuffer = await this.convertedImage.giveConvertedBuffer()
    if (this.width !== undefined && this.height !== undefined) {
      const resizedxy = new imageResized(
        this.imageBuffer,
        this.targetExtension,
        this.width,
        this.height
      )
      this.imageBuffer = await resizedxy.getResized()
    } else if (this.width === undefined && this.height === undefined) {
      const b = new imageDimensions(this.imageBuffer, this.targetExtension)
      const n = await b.giveInfo()
      this.width = n.width
      this.height = n.height
    } else {
      const b = new imageDimensions(this.imageBuffer, this.targetExtension)
      const n = await b.giveInfo()
      const resizedxory = new imageResized(
        this.imageBuffer,
        this.targetExtension,
        this.width ?? n.width,
        this.height ?? n.height
      )
      this.imageBuffer = await resizedxory.getResized()
      this.width = this.width ?? n.width
      this.height = this.height ?? n.height
    }
  }
}

export default Bild
