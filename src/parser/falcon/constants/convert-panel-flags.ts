/* eslint-disable @typescript-eslint/naming-convention */
import bitFlagsToString from '../../../utility/bit-flags-to-string.js'

export default function bitFlagsString(x: number) {
  const flags = {
    PANEL_FLAG_NONE: 0,
    PANEL_FLAG_BLENDING: 1,
    PANEL_FLAG_HIDE: 2,
    PANEL_FLAG_WATERTEXTURES: 4,
  }
  return bitFlagsToString(x, flags)
}
