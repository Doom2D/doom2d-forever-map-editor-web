import { Component } from '../minimal-ecs'

class Selected extends Component {
  public constructor(public key: number, public never: boolean) {
    super()
  }
}

export { Selected }
