import { Component } from '../minimal-ecs'

class Texture extends Component {
  public constructor(public key: string) {
    super()
  }
}

export default Texture
