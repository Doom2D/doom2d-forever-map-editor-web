import { Component } from '../minimal-ecs'

class SupportUpdater extends Component {
  public constructor(public key: Readonly<Function>) {
    super()
  }
}

export default SupportUpdater
