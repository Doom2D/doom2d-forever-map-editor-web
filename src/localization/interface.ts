import { type RenderRulesKey } from '../editor/render/rules/rules'

interface Localization {
  getRenderRules: () => Record<string, RenderRulesKey>
  getImportExport: () => Record<string, 'export' | 'import'>
}

export default Localization
