const RenderRules = {
  RENDER_HIDDEN: 'HIDDEN',
  RENDER_BACKGROUND: 'BACKGROUND',
  RENDER_WALL: 'WALL',
  RENDER_FOREGROUND: 'FOREGROUND',
} as const

type RenderRulesKey = typeof RenderRules[keyof typeof RenderRules]

export { RenderRules, type RenderRulesKey }
