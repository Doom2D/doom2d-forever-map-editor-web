import type ResourcePath from '../../../df/resource/path/path'
import { Component } from '../minimal-ecs'

class PathComponent extends Component {
  public constructor(public key: ResourcePath) {
    super()
  }
}

export default PathComponent
