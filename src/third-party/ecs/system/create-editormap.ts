import { EditorMap } from '../../../editor/map/map'
import Texture from '../../../editor/map/texture/texture'
import Panel from '../../../editor/map/panel/panel'
import Position from '../component/position'
import Size from '../component/size'
import { Type } from '../component/type'
import PanelFlags from '../component/panel-flag'
import PanelTypeComponent from '../component/panel-type'
import { System } from '../minimal-ecs'
import { PanelTexture } from '../component/panel-texture'
import PathComponent from '../component/path'

class EditorMapFromECS extends System {
  public readonly componentsRequired = new Set<Function>([Type])

  public entitiesLastSeenUpdate = -1

  private shouldCreate = false

  private map: (Panel | Texture)[] = []

  public constructor() {
    super()
  }

  public createMap() {
    this.shouldCreate = true
  }

  public giveMap() {
    return this.map
  }

  public update(entities: Readonly<Set<number>>): void {
    this.entitiesLastSeenUpdate = entities.size
    const bindings: {
      texture: Texture
      entity: number
    }[] = []
    if (this.shouldCreate) {
      const iterable = Object.entries(Array.from(entities)).sort(
        ([, a], [, b]) => {
          const componentsA = this.ecs.getComponents(a)
          const componentsB = this.ecs.getComponents(b)
          const typeComponentA = componentsA.get(Type)
          const typeComponentB = componentsB.get(Type)
          if (typeComponentA === undefined || typeComponentB === undefined) {
            throw new Error('Invalid entity!')
          }
          if (typeComponentA.key === 'texture') return -1
          if (typeComponentB.key === 'texture') return 1
          return 0
        }
      )
      for (const [, v] of iterable) {
        const components = this.ecs.getComponents(v)
        const typeComponent = components.get(Type)
        if (typeComponent === undefined) throw new Error('Invalid entity!')
        if (typeComponent.key === 'panel') {
          const positionComponent = components.get(Position)
          const sizeComponent = components.get(Size)
          const panelType = components.get(PanelTypeComponent)
          const panelFlags = components.get(PanelFlags)
          const panelTexture = components.get(PanelTexture)
          if (
            positionComponent === undefined ||
            sizeComponent === undefined ||
            panelType === undefined ||
            panelFlags === undefined ||
            panelTexture === undefined
          )
            throw new Error('Invalid panel entity!')
          const [x, y] = [positionComponent.x, positionComponent.y]
          const [width, height] = [sizeComponent.w, sizeComponent.h]
          const s = bindings.find((q) => q.entity === panelTexture.key)
          if (s === undefined) throw new Error('Texture is not found!')
          const panel = new Panel({
            position: { x, y },
            dimensions: { width, height },
            texture: s.texture,
            type: panelType.key.giveSrcString(),
            flags: panelFlags.key.giveFlags(),
          })
          this.map.push(panel)
        } else if (typeComponent.key === 'texture') {
          const c = components.get(PathComponent)
          if (c === undefined) throw new Error('Invalid texture entity!')
          const path = c.key
          const texture = new Texture(path, false)
          bindings.push({
            texture,
            entity: v,
          })
          this.map.push(texture)
        }
      }
      this.shouldCreate = false
    }
  }
}

export { EditorMapFromECS }
