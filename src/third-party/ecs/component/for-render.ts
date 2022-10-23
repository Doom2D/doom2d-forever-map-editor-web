import { Component } from '../minimal-ecs'

class ForRender extends Component {
  public constructor(private key: boolean) {
    super()
  }

  public shouldRender() {
    return this.key
  }

  public setForRender(render: boolean) {
    this.key = render
  }
}

export default ForRender
