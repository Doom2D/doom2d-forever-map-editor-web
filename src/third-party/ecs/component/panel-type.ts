import { Component } from '../minimal-ecs'
import type PanelType from '../../../editor/map/panel/type/type'

class PanelTypeComponent extends Component {
  public constructor(public key: Readonly<PanelType>) {
    super()
  }
}

export default PanelTypeComponent
