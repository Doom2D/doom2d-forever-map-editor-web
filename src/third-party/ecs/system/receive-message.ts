import type Dispatch from '../../../dispatch/dispatch'
import { panelTypes } from '../../../editor/map/panel/type/types'
import { type MessageValue } from '../../../messager-types'
import { PanelTexture } from '../component/panel-texture'
import PanelTypeComponent from '../component/panel-type'
import PathComponent from '../component/path'
import Position from '../component/position'
import Size from '../component/size'
import { Type } from '../component/type'
import { System } from '../minimal-ecs'

class ReceiveMessage extends System {
  public readonly componentsRequired = new Set<Function>([Position])

  public entitiesLastSeenUpdate = -1

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'onElementInfoApply',
      (data: Readonly<{ src: string[]; val: number; entity: number }>) => {
        console.log(data)
        const c = this.ecs.getComponents(data.entity)
        if (data.src[0] === 'POSITION') {
          const pos = c.get(Position)
          if (pos === undefined) throw new Error('Invalid entity!')
          if (data.src[1] === 'X') {
            pos.set({
              x: data.val
            })
          } else if (data.src[1] === 'Y') {
            pos.set({
              y: data.val
            })
          }
        } else if (data.src[0] === 'DIMENSION') {
          const size = c.get(Size)
          if (size === undefined) throw new Error('Invalid entity!')
          if (data.src[1] === 'WIDTH') {
            size.set({
              width: data.val,
            })
          } else if (data.src[1] === 'HEIGHT') {
            size.set({
              height: data.val,
            })
          }
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
