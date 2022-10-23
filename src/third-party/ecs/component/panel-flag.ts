import { Component } from '../minimal-ecs'
import type PanelFlag from '../../../editor/map/panel/flag/flag'

class PanelFlags extends Component {
  public constructor(public key: Readonly<PanelFlag>) {
    super()
  }
}

export default PanelFlags
