import { type RenderRulesKey } from '../editor/render/rules/rules'

interface Localization {
  getRenderRules: () => Record<string, RenderRulesKey>
}

export default Localization
