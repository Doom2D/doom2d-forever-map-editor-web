import { Component } from '../minimal-ecs'

class Highlighted extends Component {
  public constructor(public key: boolean) {
    super()
  }
}

export { Highlighted }
