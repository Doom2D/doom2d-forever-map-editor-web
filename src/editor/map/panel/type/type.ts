import { RenderOrder } from '../../../render/order/order'
import { panelTypes, panelTypesKey } from './types'

class PanelType {
  public readonly src: panelTypesKey

  public constructor(src: string) {
    // @ts-expect-error It's a string bro
    const q = Object.keys(panelTypes).find((x) => panelTypes[x] === src)
    if (q === undefined)
      throw new Error('Invalid panel type passed to PanelType!')
    this.src = src as panelTypesKey
  }

  public giveSrcString() {
    return this.src
  }

  public giveRenderOrder() {
    const x = this.src
    if (x === 'PANEL_BACK') {
      return RenderOrder.BACK
    }
    if (x === 'PANEL_WALL') {
      return RenderOrder.WALL
    }
    if (x === 'PANEL_CLOSEDOOR') {
      return RenderOrder.CLOSEDOOR
    }
    if (x === 'PANEL_STEP') {
      return RenderOrder.STEP
    }
    if (x === 'PANEL_FORE') {
      return RenderOrder.FORE
    }
    if (x === 'PANEL_OPENDOOR') {
      return RenderOrder.OPENDOOR
    }
    if (x === 'PANEL_WATER' || x === 'PANEL_ACID1' || x === 'PANEL_ACID2') {
      return RenderOrder.LIQUID
    }
    if (
      x === 'PANEL_NONE' ||
      x === 'PANEL_LIFTUP' ||
      x === 'PANEL_LIFTDOWN' ||
      x === 'PANEL_BLOCKMON' ||
      x === 'PANEL_LIFTLEFT' ||
      x === 'PANEL_LIFTRIGHT'
    ) {
      return RenderOrder.HIDDEN
    }
    throw new Error('Unhandled panel type!')
  }
}

export default PanelType
