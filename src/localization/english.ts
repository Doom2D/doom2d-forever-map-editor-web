import { RenderRules } from '../editor/render/rules/rules'

import type Localization from './interface'

class English implements Localization {
  public getRenderRules = () => ({
    'Hidden ': RenderRules.RENDER_HIDDEN,
    'Background ': RenderRules.RENDER_BACKGROUND,
    'Walls ': RenderRules.RENDER_WALL,
    'Foreground ': RenderRules.RENDER_FOREGROUND,
  })
}

export default English
