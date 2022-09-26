import { Component } from '../minimal-ecs'

class Size extends Component {
  public constructor(public w: number, public h: number) {
    super()
  }
}

export default Size
