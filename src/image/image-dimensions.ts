import magickWasmImageManipulation from './backend/magick-wasm'

class imageDimensions {
  public constructor(private readonly src: ArrayBuffer, private readonly ext: string) {}

  public async giveInfo() {
    return await this.getImageDimensions()
  }

  private async getImageDimensions() {
    const a = new magickWasmImageManipulation(this.src, this.ext)
    return await a.getImageDimensions()
  }
}

export default imageDimensions
