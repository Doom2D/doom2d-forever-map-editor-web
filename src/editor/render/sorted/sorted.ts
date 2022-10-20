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
      if (
        this.rules.includes('HIDDEN') &&
        (v.giveRenderOrder() === RenderOrder.HIDDEN ||
          v.giveFlags().includes(panelFlags.HIDE))
      ) {
        continue
      }
      arr.push(v)
    }
    return arr
  }
}

export default SortedMapElements
