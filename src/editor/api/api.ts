import parseFalcon from '../../parser/falcon/typescript-falcon'
import parseKetmar from '../../parser/ketmar/typescript-ketmar'

function loadMap(src: string) {
  // return parseFalcon(src)
  return parseKetmar(src)
}

export { loadMap }
