import magickWasmImageManipulation from './backend/magick-wasm'

class imageResized {
  public constructor(private readonly src: ArrayBuffer, private readonly ext: string, private readonly width: number, private readonly height: number) {}

  public async getResized() {
    const a = new magickWasmImageManipulation(this.src, this.ext)
    return await a.resize(this.width, this.height)
  }
}

export default imageResized
