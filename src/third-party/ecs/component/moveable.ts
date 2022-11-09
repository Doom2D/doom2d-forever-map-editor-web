import { Component } from '../minimal-ecs'

class Moveable extends Component {
  public constructor(public key: boolean) {
    super()
  }
}

export default Moveable
