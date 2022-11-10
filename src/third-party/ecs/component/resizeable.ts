import { Component } from '../minimal-ecs'

class Resizeable extends Component {
  public constructor(public key: boolean, public never = false) {
    super()
  }
}

export default Resizeable
