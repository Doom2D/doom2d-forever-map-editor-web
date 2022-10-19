import { RenderOrder } from '../../../render/order/order'

class PanelType {
  public constructor(public readonly src: string) {}

  public giveRenderOrder() {
    const x = this.src
    if (
      x === 'PANEL_FORE' ||
      x === 'PANEL_WATER' ||
      x === 'PANEL_ACID1' ||
      x === 'PANEL_ACID2'
    ) {
      return RenderOrder.FORE
    }
    if (
      x === 'PANEL_WALL' ||
      x === 'PANEL_OPENDOOR' ||
      x === 'PANEL_CLOSEDOOR' ||
      x === 'PANEL_LIFTLEFT' ||
      x === 'PANEL_LIFTRIGHT'
    ) {
      return RenderOrder.WALL
    }
    if (x === 'PANEL_BACK' || x === 'PANEL_STEP') {
      return RenderOrder.BACK
    }
    if (x === 'PANEL_NONE') {
      return RenderOrder.HIDDEN
    }
    throw new Error('Invalid panel type passed to PanelType!')
  }
}

export default PanelType
