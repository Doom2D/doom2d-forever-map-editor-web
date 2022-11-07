import type Dispatch from '../../../dispatch/dispatch'
import PanelType from '../../../editor/map/panel/type/type'
import { isStringPanelType, panelTypes } from '../../../editor/map/panel/type/types'
import {
  messageValueIsNumbers,
  messageValueIsSelectLocale,
} from '../../../messager-types'
import PanelTypeComponent from '../component/panel-type'
import Position from '../component/position'
import Size from '../component/size'
import { System } from '../minimal-ecs'

class ReceiveMessage extends System {
  public readonly componentsRequired = new Set<Function>([Position])

  public entitiesLastSeenUpdate = -1

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'onElementInfoApply',
      (data: Readonly<{ src: string[]; val: unknown; entity: number }>) => {
        console.log(data)
        const c = this.ecs.getComponents(data.entity)
        if (data.src[0] === 'POSITION') {
          const val = data.val
          if (!messageValueIsNumbers(data.src, val))
            throw new Error('Invalid message!')
          const pos = c.get(Position)
          if (pos === undefined) throw new Error('Invalid entity!')
          if (data.src[1] === 'X') {
            pos.set({
              x: val,
            })
          } else if (data.src[1] === 'Y') {
            pos.set({
              y: val,
            })
          }
        } else if (data.src[0] === 'DIMENSION') {
          const val = data.val
          if (!messageValueIsNumbers(data.src, val))
            throw new Error('Invalid message!')
          const size = c.get(Size)
          if (size === undefined) throw new Error('Invalid entity!')
          if (data.src[1] === 'WIDTH') {
            size.set({
              width: val,
            })
          } else if (data.src[1] === 'HEIGHT') {
            size.set({
              height: val,
            })
          }
        } else if (data.src[0] === 'PANELTYPE') {
          const val = data.val
          if (!messageValueIsSelectLocale(data.src, val))
            throw new Error('Invalid message!')
          const type = c.get(PanelTypeComponent)
          if (type === undefined) throw new Error('Invalid message!')
          if (!isStringPanelType(val)) throw new Error('Invalid panel type!')
          type.key = new PanelType(val)
        }
        this.dispatch.dispatch('shouldUpdateRender', {
          entity: data.entity,
        })
      }
    )
  }

  public update() {}
}

export { ReceiveMessage }
