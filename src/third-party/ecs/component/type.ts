import { Component } from '../minimal-ecs'

type DFElements = 'panel' | 'texture'

class Type extends Component {
  public constructor(public key: DFElements) {
    super()
  }
}

export default Type
