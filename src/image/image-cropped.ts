import WasmImagemagickImageManipulation from './backend/wasm-imagemagick'

class imageCropped {
  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly ext: string,
    private readonly x: number,
    private readonly y: number,
    private readonly width: number,
    private readonly height: number
  ) {}

  public async getCropped() {
    const a = new WasmImagemagickImageManipulation(this.src, this.ext)
    return await a.crop(this.width, this.height, this.x, this.y)
  }
}

export default imageCropped
