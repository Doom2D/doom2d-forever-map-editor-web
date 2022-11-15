import { type RenderRulesKey } from '../editor/render/rules/rules'

interface Localization {
  getRenderRules: () => Record<string, RenderRulesKey>
  getImportExport: () => Record<string, 'export' | 'import'>
  getLocaleNameTranslation: (a: string) => string
  getMenuButtonTranslation: (a: string) => string
  getAllMenuButtonsTranslation: () => Record<string, string>
}

export default Localization
