import WasmImagemagickImageManipulation from './backend/wasm-imagemagick'

class imageResized {
  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly ext: string,
    private readonly width: number,
    private readonly height: number
  ) {}

  public async getResized() {
    const a = new WasmImagemagickImageManipulation(this.src, this.ext)
    return await a.resize(this.width, this.height)
  }
}

export default imageResized
