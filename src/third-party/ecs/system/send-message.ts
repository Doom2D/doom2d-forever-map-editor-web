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
import IdComponent from '../component/id'
import Alpha from '../component/alpha'

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
    const id = components.get(IdComponent)
    const alpha = components.get(Alpha)
    if (
      pos === undefined ||
      size === undefined ||
      ptype === undefined ||
      ptexture === undefined ||
      id === undefined ||
      alpha === undefined
    )
      throw new Error('Invalid entity highlighted!')
    const posInfo: MessageValue = {
      type: 'numbers',
      localeName: 'POSITION',

      value: [
        {
          localeName: 'X',
          val: pos.x,
          min: Number.MIN_SAFE_INTEGER,
          max: Number.MAX_SAFE_INTEGER,
        },
        {
          localeName: 'Y',
          val: pos.y,
          min: Number.MIN_SAFE_INTEGER,
          max: Number.MAX_SAFE_INTEGER,
        },
      ],

      entity: e,
    }
    const dimensionsInfo: MessageValue = {
      type: 'numbers',
      localeName: 'DIMENSION',

      value: [
        {
          localeName: 'WIDTH',
          val: size.w,
          min: 1,
          max: Number.MAX_SAFE_INTEGER,
        },
        {
          localeName: 'HEIGHT',
          val: size.h,
          min: 1,
          max: Number.MAX_SAFE_INTEGER,
        },
      ],

      entity: e,
    }
    const typeArr = [
      {
        val: ptype.key.giveSrcString(),
        localeName: ptype.key.giveSrcString(),
      },
      ...Array.from(
        Object.values(panelTypes)
          .filter((v) => v !== ptype.key.giveSrcString())
          .map((v) => ({
            val: v,
            localeName: v,
          }))
      ),
    ]
    const typeInfo: MessageValue = {
      type: 'selectlocale',
      localeName: 'PANELTYPE',
      // eslint-disable-next-line putout/putout
      value: typeArr,
      entity: e,
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
      .map((v) => ({
        val: v[0],
        localeName: v[1],
      }))
    const textureInfo: MessageValue = {
      type: 'select',
      localeName: 'PANELTEXTURE',
      // eslint-disable-next-line putout/putout
      value: textureArr,

      entity: e,
    }
    const idInfo: MessageValue = {
      type: 'numbers',
      localeName: 'ID',

      value: [
        {
          localeName: 'IDVALUE',
          val: id.key,
          min: 0,
          max: Number.MAX_SAFE_INTEGER,
        },
      ],

      entity: e,
    }
    const alphaInfo: MessageValue = {
      type: 'numbers',
      localeName: 'ALPHA',

      value: [
        {
          localeName: 'ALPHAVALUE',
          val: alpha.key,
          min: 0,
          max: 1,
        },
      ],

      entity: e,
    }
    return [posInfo, dimensionsInfo, typeInfo, textureInfo, idInfo, alphaInfo]
  }

  public update() {}
}

export { Message }
