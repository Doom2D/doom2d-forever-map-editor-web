import { type panelFlagsKey, panelFlags } from './flags'

class PanelFlag {
  private readonly src: panelFlagsKey[]

  public constructor(src: unknown) {
    if (typeof src === 'string') {
      this.src = [this.mapFlag(src)]
    } else if (Array.isArray(src)) {
      this.src = src.map((v) => this.mapFlag(v))
    } else {
      this.src = [panelFlags.NONE]
    }
  }

  public giveFlags() {
    return this.src
  }

  private mapFlag(src: unknown) {
    if (typeof src !== 'string') throw new Error('Invalid panel flag!')
    switch (src) {
      case 'PANEL_FLAG_NONE':
        return panelFlags.NONE
      case 'PANEL_FLAG_BLENDING':
        return panelFlags.BLENDING
      case 'PANEL_FLAG_WATERTEXTURES':
        return panelFlags.WATERTEXTURES
      case 'PANEL_FLAG_HIDE':
        return panelFlags.HIDE
      default:
        throw new Error('Unknown panel flag!')
    }
  }
}

export default PanelFlag
