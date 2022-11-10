import { Component } from '../minimal-ecs'

class Moveable extends Component {
  public constructor(public key: boolean, public never = false) {
    super()
  }
}

export default Moveable
