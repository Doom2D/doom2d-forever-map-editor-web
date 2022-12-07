import { Component } from '../minimal-ecs'

type DFElements = 'panel' | 'support' | 'texture'

class Type extends Component {
  public constructor(public key: DFElements) {
    super()
  }
}

export default Type

export { type DFElements, Type }
