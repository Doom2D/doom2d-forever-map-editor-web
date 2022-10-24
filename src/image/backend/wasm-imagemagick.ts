import { call } from 'wasm-imagemagick'
import { getExtension } from 'mime' 

import getFileType from '../../utility/get-file-type'

class WasmImagemagickImageManipulation {
  public constructor(
    private readonly src: Readonly<ArrayBuffer>,
    private readonly target: string
  ) {}

  private getSrcOpt() {
    const type = getFileType(this.src)
    const response = getExtension(type)
    return response ?? this.target
  }

  private async process(args: Readonly<string[]>, solo = false) {
    const content = new Uint8Array(this.src)
    const name = `input.${this.getSrcOpt()}`
    const image = {
      name,
      content,
    }
    let command = Array.from(args)
    if (solo) {
      command = [...command, name]
    }
    if (!solo) {
      command = [name, ...command, `out.${this.target}`]
    }
    const result = await call([image], command)
    if (result.exitCode !== 0)
      throw new Error(`Error converting image: ${result.stderr.join('\n')}`)
    const [resultImage] = result.outputFiles
    const [output] = result.stdout
    if (solo) {
      return {
        output,
        img: new ArrayBuffer(0),
      }
    }
    const img = await resultImage.blob.arrayBuffer()
    return {
      img,
      output,
    }
  }

  public async getImageDimensions() {
    const response = await this.process(['identify'], true)
    const str = response.output
    // eslint-disable-next-line require-unicode-regexp, regexp/require-unicode-regexp
    const dimensions = str.split(/\W+/)[3].split('x').map(Number)
    return {
      width: dimensions[0],
      height: dimensions[1],
    }
  }

  public async convertToTarget() {
    const response = await this.process([])
    return response.img
  }

  public async resize(width: number, height: number) {
    const response = await this.process(['-resize', `${width}x${height}`])
    return response.img
  }

  public async crop(width: number, height: number, x = 0, y = 0) {
    const response = await this.process([
      '-crop',
      `${width}x${height}+${x}+${y}`,
      '+repage',
    ])
    return response.img
  }
}

export default WasmImagemagickImageManipulation
