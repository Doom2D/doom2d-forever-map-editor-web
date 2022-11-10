import { RenderRules } from '../editor/render/rules/rules'

import type Localization from './interface'

class English implements Localization {
  private localeNames: Record<string, string> = {
    'POSITION': 'Position',
    'X': 'X',
    'Y': 'Y',
    'DIMENSION': 'Dimensions:',
    'WIDTH': 'Width',
    'HEIGHT': 'Height',
    'PANEL_NONE': 'None',
    'PANEL_FORE': 'Foreground',
    'PANEL_BACK': 'Background',
    'PANEL_WALL': 'Wall',
    'PANEL_WATER': 'Water',
    'PANEL_ACID1': 'Acid1',
    'PANEL_ACID2': 'Acid2',
    'PANEL_STEP': 'Step',
    'PANEL_LIFTUP': 'Lift Up',
    'PANEL_LIFTDOWN': 'Lift Down',
    'PANEL_OPENDOOR': 'Open door',
    'PANEL_CLOSEDOOR': 'Closed door',
    'PANEL_BLOCKMON': 'Monster block',
    'PANEL_LIFTLEFT': 'Lift Left',
    'PANEL_LIFTRIGHT': 'Lift Right',
    'PANELTYPE': 'Panel type',
    'IDVALUE': 'ID',
    'PANELTEXTURE': 'Texture',
    'ALPHAVALUE': 'Alpha',
    'PLATFORMACTIVEINFOVALUE': 'Platform active',
    'PLATFORMONCEINFOVALUE': 'Move once',
    'PLATFORMMOVESPEEDVALUE': 'Move speed',
    'PLATFORMSIZEENDVALUE': 'Size end'
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
