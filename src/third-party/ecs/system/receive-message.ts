import type Dispatch from '../../../dispatch/dispatch'
import PanelType from '../../../editor/map/panel/type/type'
import { isStringPanelType, panelTypes } from '../../../editor/map/panel/type/types'
import {
  messageValueIsNumbers,
  messageValueIsSelect,
  messageValueIsSelectLocale,
} from '../../../messager-types'
import PanelTypeComponent from '../component/panel-type'
import Position from '../component/position'
import Size from '../component/size'
import { System } from '../minimal-ecs'
import IdComponent from '../component/id'
import { PanelTexture } from '../component/panel-texture'

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
        } else if (data.src[0] === 'ID') {
          const val = data.val
          if (!messageValueIsNumbers(data.src, val)) throw new Error('Invalid message!')
          const id = c.get(IdComponent)
          if (id === undefined) throw new Error('Invalid entity!')
          const entities = this.ecs.getEntitiesWithComponent(new Set([IdComponent]))
          const sameId = Array.from(entities).find((v) => {
            const ec = this.ecs.getComponents(v)
            const ei = ec.get(IdComponent)
            if (ei === undefined) throw new Error('Invalid entity!')
            return ei.key === val
          })
          if (sameId !== undefined) {
            const ec = this.ecs.getComponents(sameId)
            const ei = ec.get(IdComponent)
            if (ei === undefined) throw new Error('Invalid entity!')
            ei.key = id.key
          }
          id.key = val
        } else if (data.src[0] === 'PANELTYPE') {
          const val = data.val
          if (!messageValueIsSelectLocale(data.src, val))
            throw new Error('Invalid message!')
          const type = c.get(PanelTypeComponent)
          if (type === undefined) throw new Error('Invalid message!')
          if (!isStringPanelType(val)) throw new Error('Invalid panel type!')
          type.key = new PanelType(val)
        } else if (data.src[0] === 'PANELTEXTURE') {
          const val = data.val
          if (!messageValueIsSelect(data.src, val)) throw new Error('Invalid message!')
          const ptexture = c.get(PanelTexture)
          if (ptexture === undefined) throw new Error('Invalid message!')
          ptexture.key = Number(val)
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
