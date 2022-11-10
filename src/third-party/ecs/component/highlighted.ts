import { Component } from '../minimal-ecs'

class Highlighted extends Component {
  public constructor(public key: boolean, public never = false) {
    super()
  }
}

export { Highlighted }
