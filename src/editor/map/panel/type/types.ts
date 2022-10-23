const panelTypes = {
  NONE: 'PANEL_NONE',
  WALL: 'PANEL_WALL',
  BACK: 'PANEL_BACK',
  FORE: 'PANEL_FORE',
  WATER: 'PANEL_WATER',
  ACID1: 'PANEL_ACID1',
  ACID2: 'PANEL_ACID2',
  STEP: 'PANEL_STEP',
  LIFTUP: 'PANEL_LIFTUP',
  LIFTDOWN: 'PANEL_LIFTDOWN',
  OPENDOOR: 'PANEL_OPENDOOR',
  CLOSEDOOR: 'PANEL_CLOSEDOOR',
  BLOCKMON: 'PANEL_BLOCKMON',
  LIFTLEFT: 'PANEL_LIFTLEFT',
  LIFTRIGHT: 'PANEL_LIFTRIGHT',
} as const

type panelTypesKey = typeof panelTypes[keyof typeof panelTypes]

export { panelTypes, type panelTypesKey }
