import type Dispatch from '../../../dispatch/dispatch'
import PanelType from '../../../editor/map/panel/type/type'
import {
  isStringPanelType,
  panelTypes,
} from '../../../editor/map/panel/type/types'
import {
  messageValueIsBoolean,
  messageValueIsNumbers,
  messageValueIsPosition,
  messageValueIsSelect,
  messageValueIsSelectLocale,
  messageValueIsSize,
} from '../../../messager-types'
import PanelTypeComponent from '../component/panel-type'
import Position from '../component/position'
import Size from '../component/size'
import { System } from '../minimal-ecs'
import IdComponent from '../component/id'
import { PanelTexture } from '../component/panel-texture'
import Alpha from '../component/alpha'
import Platform from '../component/panel-platform'

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
          if (!messageValueIsNumbers(data.src, val))
            throw new Error('Invalid message!')
          const id = c.get(IdComponent)
          if (id === undefined) throw new Error('Invalid entity!')
          const entities = this.ecs.getEntitiesWithComponent(
            new Set([IdComponent])
          )
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
        } else if (data.src[0] === 'ALPHA') {
          const val = data.val
          if (!messageValueIsNumbers(data.src, val))
            throw new Error('Invalid message!')
          const alpha = c.get(Alpha)
          if (alpha === undefined) throw new Error('Invalid entity!')
          alpha.set(val)
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
          if (!messageValueIsSelect(data.src, val))
            throw new Error('Invalid message!')
          const ptexture = c.get(PanelTexture)
          if (ptexture === undefined) throw new Error('Invalid message!')
          ptexture.key = Number(val)
        } else if (data.src[0] === 'PLATFORMINFO') {
          const val = data.val
          const platform = c.get(Platform)
          console.log(data)
          if (platform === undefined) throw new Error('Invalid entity!')
          if (messageValueIsBoolean(data.src, val)) {
            if (data.src[1] === 'PLATFORMACTIVEINFOVALUE') {
              platform.moveActive = val
            } else if (data.src[1] === 'PLATFORMONCEINFOVALUE') {
              platform.moveOnce = val
            } else {
              throw new Error('Invalid message!')
            }
          } else if (messageValueIsPosition(data.src, val)) {
            if (data.src[1] === 'PLATFORMMOVESTARTVALUE') {
              if (data.src[2] === 'X') {
                platform.movestart.set({
                  x: val,
                })
              } else if (data.src[2] === 'Y') {
                platform.movestart.set({
                  y: val,
                })
              }
            }
            if (data.src[1] === 'PLATFORMMOVEENDVALUE') {
              if (data.src[2] === 'X') {
                platform.moveEnd.set({
                  x: val,
                })
              } else if (data.src[2] === 'Y') {
                platform.moveEnd.set({
                  y: val,
                })
              }
            }
          } else if (messageValueIsSize(data.src, val)) {
            if (data.src[1] === 'PLATFORMSIZEENDVALUE') {
              if (data.src[2] === 'X') {
                platform.sizeEnd.set({
                  x: val,
                })
              } else if (data.src[2] === 'Y') {
                platform.sizeEnd.set({
                  y: val,
                })
              }
            }
          } else {
            console.log(data, val)
            throw new Error('Invalid message!')
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
