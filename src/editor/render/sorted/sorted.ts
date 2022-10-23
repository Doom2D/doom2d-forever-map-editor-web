import type EditorMap from '../../map/map'
import { panelFlags } from '../../map/panel/flag/flags'
import type Panel from '../../map/panel/panel'
import { RenderOrder } from '../order/order'
import { type RenderRulesKey } from '../rules/rules'

class SortedMapElements {
  public constructor(
    public readonly src: Readonly<EditorMap>,
    public readonly rules: Readonly<RenderRulesKey[]>
  ) {}

  public givePanels() {
    const arr: Panel[] = []
    for (const [, v] of Object.entries(this.src.givePanels())) {
      const x = v.giveRenderOrder()
      if (v.giveFlags().includes(panelFlags.HIDE)) continue
      if (
        this.rules.includes('HIDDEN') &&
        (x === RenderOrder.HIDDEN || v.giveFlags().includes(panelFlags.HIDE))
      ) {
        continue
      }
      if (this.rules.includes('WALL') && x === RenderOrder.WALL) {
        continue
      }
      if (this.rules.includes('FOREGROUND') && x === RenderOrder.FORE) {
        continue
      }
      if (this.rules.includes('BACKGROUND') && x === RenderOrder.BACK) {
        continue
      }
      arr.push(v)
    }
    return arr.slice().sort((a, b) => a.giveRenderOrder() - b.giveRenderOrder())
  }
}

export default SortedMapElements
