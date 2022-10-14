import { parseFalcon } from '../../parser/falcon/typescript-falcon'
import { parseKetmar } from '../../parser/ketmar/typescript-ketmar'

class convertedMap {
  public constructor(private readonly src: Readonly<ArrayBuffer> | string) {}

  public getUnparsed() {
    const map =
      typeof this.src === 'string'
        ? parseKetmar(this.src)
        : parseFalcon(this.src)
    if (!map.isMapValid) throw new Error('Invalid map passed to convertedMap!')
    return map.mapObject
  }
}

export default convertedMap
