const RenderOrder = {
  HIDDEN: 0,
  BACK: 1,
  WALL: 2,
  FORE: 3,
} as const

type RenderOrderKey = typeof RenderOrder[keyof typeof RenderOrder]

export { RenderOrder, type RenderOrderKey }
