import loadImage from '../utility/load-image-async'
import convertedImageBuffer from './converted-image-buffer'
import imageCropped from './image-cropped'
import imageDimensions from './image-dimensions'
import imageResized from './image-resized'

class Bild {
  private readonly targetExtension = 'png'

  private readonly convertedImage: convertedImageBuffer

  private imageBuffer: ArrayBuffer = new ArrayBuffer(0)

  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private width = -1,
    private height = -1
  ) {
    this.convertedImage = new convertedImageBuffer(
      this.src,
      this.targetExtension
    )
  }

  public giveInfo() {
    return {
      width: this.width,
      height: this.height,
    }
  }

  public giveBuffer() {
    return this.imageBuffer
  }

  public async init() {
    this.imageBuffer = await this.convertedImage.giveConvertedBuffer()
    if (this.width >= 0 && this.height >= 0) {
      const resizedxy = new imageCropped(
        this.imageBuffer,
        this.targetExtension,
        0,
        0,
        this.width,
        this.height
      )
      this.imageBuffer = await resizedxy.getCropped()
    } else if (this.width <= -1 && this.height <= -1) {
      const b = new imageDimensions(this.imageBuffer, this.targetExtension)
      const n = await b.giveInfo()
      this.width = n.width
      this.height = n.height
    } else {
      const b = new imageDimensions(this.imageBuffer, this.targetExtension)
      const n = await b.giveInfo()
      if (this.width <= -1) this.width = n.width
      if (this.height <= -1) this.height = n.height
      const resizedxory = new imageCropped(
        this.imageBuffer,
        this.targetExtension,
        0,
        0,
        this.width,
        this.height
      )
      this.imageBuffer = await resizedxory.getCropped()
    }
  }
}

export default Bild
