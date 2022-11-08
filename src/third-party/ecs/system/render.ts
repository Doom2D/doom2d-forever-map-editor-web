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
    this.dispatch.on('updateRender', (a: {
      entities: number[]
    }) => {
      this.updateRender(this.ecs.getEntitiesWithComponent(new Set([ForRender])))
      for (const [, v] of Object.entries(a.entities)) {
        this.rendererImplementation.render({
          entity: v,
        })
      }
    })
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
      opts: RenderOptions
    }[] = []
    const panelArr: {
      entity: number
      id: number
      typeOrder: number
      opts: RenderOptions
    }[] = []
    for (const [, v] of Object.entries(Array.from(entities))) {
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
          this.rendererImplementation.deleteEntity(v)
          this.state.entityStates[v] = {
            order: ordnung,
          }
          const textureComponent = this.ecs.getComponents(textureId.key)
          const p = textureComponent.get(PathComponent)
          if (p === undefined)
            throw new Error('Invalid texture associated with the panel!')
          const imgKey = p.key.asThisEditorPath(false)
          panelArr.push({
            entity: v,

            id: id.key,

            typeOrder: ordnung,

            opts: {
              x: pos.x,
              y: pos.y,
              w: size.w,
              h: size.h,
              entity: v,
              alpha: alpha.key,
              imgKey,
            },
          })
        }
      } else {
        this.rendererImplementation.deleteEntity(v)
      }
    }
    renderArray.push(
      ...panelArr
        .slice()
        .sort((a, b) => a.id - b.id)
        .sort((a, b) => a.typeOrder - b.typeOrder)
        .map((x) => ({
          opts: x.opts,
          entity: x.entity,
        }))
    )
    for (const [, v] of Object.entries(renderArray)) {
      this.rendererImplementation.render(v.opts)
    }
  }
}

export default Render
