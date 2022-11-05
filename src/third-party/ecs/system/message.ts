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

class Message extends System {
  public readonly componentsRequired = new Set<Function>([Position])

  public entitiesLastSeenUpdate = -1

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    super()
    this.dispatch.on(
      'onSelectEntity',
      (
        data: Readonly<{
          entity: number
        }>
      ) => {
        const e = data.entity
        const components = this.ecs.getComponents(e)
        const type = components.get(Type)
        if (type === undefined) throw new Error('Invalid entity highlighted!')
        if (type.key === 'panel') {
          const m = this.panelMessage(e)
          this.dispatch.dispatch('onElementSelected', m)
        }
      }
    )
  }

  private panelMessage(e: number) {
    const components = this.ecs.getComponents(e)
    const pos = components.get(Position)
    const size = components.get(Size)
    const ptype = components.get(PanelTypeComponent)
    const ptexture = components.get(PanelTexture)
    if (
      pos === undefined ||
      size === undefined ||
      ptype === undefined ||
      ptexture === undefined
    )
      throw new Error('Invalid entity highlighted!')
    const posInfo: MessageValue = {
      type: 'numbers',
      localeName: 'POSITION',

      value: [
        {
          localeName: 'X',
          val: pos.x,
        },
        {
          localeName: 'Y',
          val: pos.y,
        },
      ],
    }
    const dimensionsInfo: MessageValue = {
      type: 'numbers',
      localeName: 'DIMENSION',

      value: [
        {
          localeName: 'WIDTH',
          val: size.w,
        },
        {
          localeName: 'HEIGHT',
          val: size.h,
        },
      ],
    }
    const typeArr = [
      ptype.key.giveSrcString(),
      ...Array.from(
        Object.values(panelTypes).filter((v) => v !== ptype.key.giveSrcString())
      ),
    ]
    const typeInfo: MessageValue = {
      type: 'selectlocale',
      localeName: 'TYPE',
      // eslint-disable-next-line putout/putout
      value: typeArr,
    }
    const textureArr = Array.from(
      this.ecs.getEntitiesWithComponent(new Set([Type]))
    )
      .filter((v) => {
        const c = this.ecs.getComponents(v)
        const t = c.get(Type)
        return t?.key === 'texture'
      })
      .map((v) => {
        const c = this.ecs.getComponents(v)
        const t = c.get(PathComponent)
        return [v, t?.key.asRegularPath()]
      })
      .sort((v1, v2) => {
        if (v1[0] === ptexture.key) return -1
        if (v2[0] === ptexture.key) return 1
        return 0
      })
      .map((v) => v[1])
    const textureInfo: MessageValue = {
      type: 'select',
      localeName: 'TEXTURE',
      // eslint-disable-next-line putout/putout
      value: textureArr,
    }
    return [posInfo, dimensionsInfo, typeInfo, textureInfo]
  }

  public update() {}
}

export { Message }
