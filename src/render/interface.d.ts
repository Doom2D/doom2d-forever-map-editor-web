interface RenderOptions {
  alpha?: string,
  tint?: number,
  x: number,
  y: number,
  w: number,
  h: number
}

interface Renderer {
  init(el: HTMLElement): void
  loadImage(src: HTMLCanvasElement)
  render(options: RenderOptions): void
  update(): void
  clear(): void
  resize(width: number, height: number): void
}

export { Renderer, RenderOptions }
