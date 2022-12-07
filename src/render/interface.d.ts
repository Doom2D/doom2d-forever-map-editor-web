import type Dispatch from "../dispatch/dispatch"

interface RenderOptions {
  alpha?: number,
  tint?: number,
  x?: number,
  y?: number,
  w?: number,
  h?: number,
  entity: number,
  imgKey?: string,
  parent?: number,
  useImg?: boolean,
  color?: number,
  blending?: boolean,
  filter?: boolean, // for df liquids
  create?: boolean
}

interface Renderer {
  init(): unknown
  saveImage(key: string, src: HTMLImageElement): Promise<unknown>
  registerEntity(n: number, imgKey: string): Promise<unknown>
  deleteEntity(n: number): unknown
  removeEntity(n: number): unknown
  render(options: RenderOptions): unknown
  update(): unknown
  clear(): unknown
  resize(width: number, height: number): unknown
  lastMousePosition(): { x: number, y: number }
  deregisterAll(): unknown
  addDispatch(dispatch: Dispatch): unknown
  highlight(n: number): unknown
  clearHighlight(n: number): unknown
  selectStart(n: number): unknown
}

export { Renderer, RenderOptions }
