/* eslint-disable max-depth */
import type { RenderOptions } from '../../../render/interface'
import { type Renderer } from '../../../render/interface'
import ForRender from '../component/for-render'
import Position from '../component/position'
import Size from '../component/size'
import Texture from '../component/texture'
import { Type } from '../component/type'
import PanelType from '../component/panel-type'
import { type Entity, System } from '../minimal-ecs'
import type Dispatch from '../../../dispatch/dispatch'
import IdComponent from '../component/id'
import { PanelTexture } from '../component/panel-texture'
import PathComponent from '../component/path'
import Alpha from '../component/alpha'
import { Highlighted } from '../component/highlighted'
import Resizeable from '../component/resizeable'
import { Selected } from '../component/selected'
import SupportUpdater from '../component/support-update'

class Render extends System {
  public readonly componentsRequired = new Set<Function>([ForRender])

  public entitiesLastSeenUpdate = -1

  private readonly state: {
    entityStates: (
      | {
          order: number
        }
      | undefined
    )[]
  } = {
    entityStates: [],
  }

  public constructor(
    private readonly rendererImplementation: Readonly<Renderer>,
    private readonly dispatch: Readonly<Dispatch>
  ) {
    super()
    this.dispatch.on(
      'updateRender',
      (a: { entities: (number | undefined)[] }) => {
        this.updateRender(
          this.ecs.getEntitiesWithComponent(new Set([ForRender]))
        )
        for (const [, v] of Object.entries(a.entities)) {
          if (v !== undefined) {
            this.rendererImplementation.render({
              entity: v,
            })
          }
        }
      }
    )
  }

  public init() {
    this.rendererImplementation.init()
  }

  public async update(entities: Readonly<Set<Entity>>) {
    await this.updateRender(entities)
  }

  public async saveImage(key: string, img: Readonly<HTMLImageElement>) {
    await (async () => {
      await this.rendererImplementation.saveImage(key, img)
    })()
    return true
  }

  private async updateRender(entities: Readonly<Set<Entity>>) {
    this.entitiesLastSeenUpdate = entities.size
    const renderArray: {
      entity: number
      highlight: boolean
      arrows: boolean
      selected: boolean
      opts: RenderOptions
    }[] = []
    const panelArr: {
      entity: number
      id: number
      typeOrder: number
      highlight: boolean
      arrows: boolean
      selected: boolean
      opts: RenderOptions
    }[] = []
    const supportArr: {
      opts: RenderOptions
    }[] = []
    for (const [, v] of Object.entries(Array.from(entities))) {
      this.rendererImplementation.removeEntity(v)
      const components = this.ecs.getComponents(v)
      const shouldRender = components.get(ForRender)
      if (shouldRender === undefined) throw new Error('Invalid entity!')
      const type = components.get(Type)
      if (type === undefined) throw new Error('Invalid entity!')
      if (shouldRender.shouldRender()) {
        if (type.key === 'panel') {
          const pos = components.get(Position)
          const size = components.get(Size)
          const id = components.get(IdComponent)
          const textureId = components.get(PanelTexture)
          const alpha = components.get(Alpha)
          const highlighted = components.get(Highlighted)
          const resizeable = components.get(Resizeable)
          const selected = components.get(Selected)
          const highlight = highlighted?.key ?? false
          const arrows = resizeable?.key ?? false
          const s = (selected?.key ?? 0) > 0
          if (
            pos === undefined ||
            size === undefined ||
            id === undefined ||
            textureId === undefined ||
            alpha === undefined
          ) {
            throw new Error('Invalid entity!')
          }
          const typeComponent = components.get(PanelType)
          if (typeComponent === undefined) throw new Error('Invalid entity!')
          const ordnung = typeComponent.key.giveRenderOrder()
          this.state.entityStates[v] = {
            order: ordnung,
          }
          const textureComponent = this.ecs.getComponents(textureId.key)
          const p = textureComponent.get(PathComponent)
          if (p === undefined)
            throw new Error('Invalid texture associated with the panel!')
          const imgKey = p.key.asThisEditorPath(true)
          const create = true
          let tint = 0xff_ff_ff
          let useImg = true
          let filter = false
          const b = p.key.getBaseName().toLocaleLowerCase()
          if (b === '_water_0' || b === '_water_1' || b === '_water_2') {
            useImg = false
            filter = true
            switch (b) {
              case '_water_0':
                tint = 0x00_00_ff
                break
              case '_water_1':
                tint = 0x00_e0_00
                break
              case '_water_2':
                tint = 0xe0_00_00
                break
              default:
                break
            }
          }
          panelArr.push({
            entity: v,

            id: id.key,

            typeOrder: ordnung,

            highlight,

            selected: s,

            arrows,

            opts: {
              x: pos.x,
              y: pos.y,
              w: size.w,
              h: size.h,
              entity: v,
              alpha: alpha.key,
              imgKey,
              tint,
              useImg,
              filter,
              create,
            },
          })
        } else if (type.key === 'support') {
          const pos = components.get(Position)
          const size = components.get(Size)
          const updater = components.get(SupportUpdater)
          if (updater === undefined) throw new Error('Invalid entity!')
          updater.key()
          supportArr.push({
            opts: {
              x: pos?.x ?? 0,
              y: pos?.y ?? 0,
              w: size?.w ?? 0,
              h: size?.h ?? 0,
              entity: v,
              imgKey: '',
              useImg: false,
            },
          })
        }
      }
    }
    renderArray.push(
      ...panelArr
        .slice()
        .sort((a, b) => b.id - a.id)
        .sort((a, b) => a.typeOrder - b.typeOrder)
        .map((x) => ({
          highlight: x.highlight,
          arrows: x.arrows,
          opts: x.opts,
          entity: x.entity,
          selected: x.selected,
        })),
      ...supportArr,
    )
    for (const [, v] of Object.entries(renderArray)) {
      this.rendererImplementation.render(v.opts)
    }
  }
}

export default Render
