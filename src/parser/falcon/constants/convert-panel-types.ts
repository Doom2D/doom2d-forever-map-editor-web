/* eslint-disable @typescript-eslint/naming-convention */
import bitFlagsToString from '../../../utility/bit-flags-to-string.js'

export default function bitFlagsString(x: number) {
  const flags = {
    PANEL_NONE: 0,
    PANEL_WALL: 1,
    PANEL_BACK: 2,
    PANEL_FORE: 4,
    PANEL_WATER: 8,
    PANEL_ACID1: 16,
    PANEL_ACID2: 32,
    PANEL_STEP: 64,
    PANEL_LIFTUP: 128,
    PANEL_LIFTDOWN: 256,
    PANEL_OPENDOOR: 512,
    PANEL_CLOSEDOOR: 1024,
    PANEL_BLOCKMON: 2048,
    PANEL_LIFTLEFT: 4096,
    PANEL_LIFTRIGHT: 8192,
  }
  return bitFlagsToString(x, flags).pop() ?? Object.keys(flags)[0]
}
