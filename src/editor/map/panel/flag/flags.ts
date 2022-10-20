const panelFlags = {
  NONE: 'PANEL_FLAG_NONE',
  BLENDING: 'PANEL_FLAG_BLENDING',
  HIDE: 'PANEL_FLAG_HIDE',
  WATERTEXTURES: 'PANEL_FLAG_WATERTEXTURES',
} as const

type panelFlagsKey = typeof panelFlags[keyof typeof panelFlags]

export { panelFlags, type panelFlagsKey }
