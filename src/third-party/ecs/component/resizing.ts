import { Component } from '../minimal-ecs'

class Resizing extends Component {
  public constructor(public key: boolean, public dir = 'none') {
    super()
  }
}

export { Resizing }
