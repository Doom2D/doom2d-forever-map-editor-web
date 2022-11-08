import { Component } from '../minimal-ecs'

class Alpha extends Component {
  public constructor(public key: number) {
    super()
  }

  public set(n: number) {
    this.key = n
  }
}

export default Alpha
