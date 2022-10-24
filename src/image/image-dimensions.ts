import WasmImagemagickImageManipulation from './backend/wasm-imagemagick'

class imageDimensions {
  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly ext: string
  ) {}

  public async giveInfo() {
    return await this.getImageDimensions()
  }

  private async getImageDimensions() {
    const a = new WasmImagemagickImageManipulation(this.src, this.ext)
    return await a.getImageDimensions()
  }
}

export default imageDimensions
