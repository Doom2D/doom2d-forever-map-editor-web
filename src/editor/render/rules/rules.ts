const RenderRules = {
  RENDER_HIDDEN: 'HIDDEN',
  RENDER_BACKGROUND: 'BACKGROUND',
  RENDER_WALL: 'WALL',
  RENDER_STEP: 'STEP',
  RENDER_DOOR: 'DOOR',
  RENDER_LIQUID: 'LIQUID',
  RENDER_FOREGROUND: 'FOREGROUND',
  RENDER_OPENDOOR: 'OPENDOOR',
} as const

type RenderRulesKey = typeof RenderRules[keyof typeof RenderRules]

export { RenderRules, type RenderRulesKey }
