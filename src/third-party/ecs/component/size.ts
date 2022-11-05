import { Component } from '../minimal-ecs'

class Size extends Component {
  public constructor(public w: number, public h: number) {
    super()
  }

  public set(a: Readonly<{ width?: number; height?: number }>) {
    this.w = a.width ?? this.w
    this.h = a.height ?? this.h
  }
}

export default Size
