import magickWasmImageManipulation from './backend/magick-wasm'

class convertedImageBuffer {
  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly targetExtension: string
  ) {}

  public async giveConvertedBuffer() {
    const a = new magickWasmImageManipulation(this.src, this.targetExtension)
    return await a.convertToTarget()
  }
}

export default convertedImageBuffer
