import magickWasmImageManipulation from './backend/magick-wasm'

class imageCropped {
  public constructor(
    private readonly src: ArrayBuffer,
    private readonly ext: string,
    private readonly x: number,
    private readonly y: number,
    private readonly width: number,
    private readonly height: number
  ) {}

  public async getCropped() {
    const a = new magickWasmImageManipulation(this.src, this.ext)
    return await a.crop(this.x, this.y, this.width, this.height)
  }
}

export default imageCropped
