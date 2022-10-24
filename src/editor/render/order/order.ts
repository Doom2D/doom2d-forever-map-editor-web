const RenderOrder = {
  HIDDEN: 0,
  SKY: 1,
  BACK: 1,
  STEP: 2,
  ITEM: 3,
  MONSTER: 4,
  WALL: 5,
  CLOSEDOOR: 6,
  AREA: 7,
  OPENDOOR: 8,
  LIQUID: 9,
  FORE: 10,
  TRIGGER: 11,
} as const

type RenderOrderKey = typeof RenderOrder[keyof typeof RenderOrder]

export { RenderOrder, type RenderOrderKey }
