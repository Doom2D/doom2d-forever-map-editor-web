import WasmImagemagickImageManipulation from './backend/wasm-imagemagick'

class convertedImageBuffer {
  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly targetExtension: string
  ) {}

  public async giveConvertedBuffer() {
    const a = new WasmImagemagickImageManipulation(
      this.src,
      this.targetExtension
    )
    return await a.convertToTarget()
  }
}

export default convertedImageBuffer
