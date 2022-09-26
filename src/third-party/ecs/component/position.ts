import { Component } from '../minimal-ecs'

class Position extends Component {
  public constructor(public x: number, public y: number) {
    super()
  }
}

export default Position
