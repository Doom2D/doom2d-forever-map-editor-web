const RenderOrder = {
  HIDDEN: 0,
  SKY: 1,
  BACK: 1,
  STEP: 2,
  ITEM: 3,
  MONSTER: 4,
  WALL: 5,
  AREA: 6,
  OPENDOOR: 7,
  LIQUID: 8,
  FORE: 9,
  TRIGGER: 10,
} as const

type RenderOrderKey = typeof RenderOrder[keyof typeof RenderOrder]

export { RenderOrder, type RenderOrderKey }
