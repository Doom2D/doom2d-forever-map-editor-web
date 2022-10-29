import { Component } from '../minimal-ecs'

class Selected extends Component {
  public constructor(public key: boolean) {
    super()
  }
}

export { Selected }
