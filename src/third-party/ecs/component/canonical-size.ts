import { Component } from '../minimal-ecs'

class CanonicalSize extends Component {
  public constructor(public info: { w: number; h: number }) {
    super()
  }
}

export default CanonicalSize
