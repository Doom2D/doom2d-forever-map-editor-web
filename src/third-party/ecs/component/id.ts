import { Component } from '../minimal-ecs'

class Id extends Component {
  public constructor(public key: number) {
    super()
  }
}

export default Id
