import { RenderRules } from '../editor/render/rules/rules'

import type Localization from './interface'

class English implements Localization {
  private localeNames: Record<string, string> = {
    'POSITION': 'Position',
    'X': 'X',
    'Y': 'Y',
    'DIMENSION': 'Dimensions:',
    'WIDTH': 'Width',
    'HEIGHT': 'Height'
  }
  public getRenderRules = () => ({
    'Hidden ': RenderRules.RENDER_HIDDEN,
    'Background ': RenderRules.RENDER_BACKGROUND,
    'Walls ': RenderRules.RENDER_WALL,
    'Foreground ': RenderRules.RENDER_FOREGROUND,
    'Liquid ': RenderRules.RENDER_LIQUID,
    'Steps ': RenderRules.RENDER_STEP,
    'Doors ': RenderRules.RENDER_DOOR,
  })

  public getImportExport: () => Record<string, 'export' | 'import'> = () => {
    return {
      'Import ': 'import',
      'Export ': 'export'
    }
  }
  public getLocaleNameTranslation: (a: string) => string = (a: string) => {
    return this.localeNames[a] ?? a
  }
}

export default English
