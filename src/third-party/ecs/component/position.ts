import { Component } from '../minimal-ecs'

class Position extends Component {
  public constructor(public x: number, public y: number) {
    super()
  }

  public set(
    a: Readonly<{
      x?: number
      y?: number
    }>
  ) {
    this.x = a.x ?? this.x
    this.y = a.y ?? this.y
  }
}

export default Position
