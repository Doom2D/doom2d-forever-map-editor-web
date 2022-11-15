import { System } from '../minimal-ecs'
import ForRender from '../component/for-render'
import Position from '../component/position'
import { Type } from '../component/type'
import type Dispatch from '../../../dispatch/dispatch'
import { Selected } from '../component/selected'
import { type Renderer } from '../../../render/interface'
import { Resizing } from '../component/resizing'
import PathComponent from '../component/path'
import type ResourceManager from '../../../resource-manager/resource-manager'
import ResourcePath from '../../../df/resource/path/path'
import {
  isResourcePathFromEditorPath,
  ResourcePathFromEditorPath,
} from '../../../df/resource/path/path-from'

class TextureMessage extends System {
  public readonly componentsRequired = new Set<Function>([
    Position,
    ForRender,
    Type,
  ])

  public entitiesLastSeenUpdate = -1

  private readonly clicksToHighlight = 1

  public constructor(
    private readonly dispatch: Readonly<Dispatch>,
    private readonly resourceManager: Readonly<ResourceManager>
  ) {
    super()
    this.dispatch.on(
      'onRequestTextureChange',
      (
        data: Readonly<{
          entity: number
          newPath: string
        }>
      ) => {
        const c = this.ecs.getComponents(data.entity)
        const type = c.get(Type)
        const path = c.get(PathComponent)
        if (type === undefined || path === undefined)
          throw new Error('Invalid entity!')
        if (type.key !== 'texture') throw new Error('Entity is not a texture!')
        const newPath = ResourcePathFromEditorPath(data.newPath)
        path.key = newPath
        dispatch.dispatch('shouldUpdateRender', {})
      }
    )
  }

  public createNewTexture(src: string) {
    const e = this.ecs.addEntity()
    const type = new Type('texture')
    const p = new ResourcePath([], '', src)
    const path = new PathComponent(p)
    this.ecs.addComponent(e, type)
    this.ecs.addComponent(e, path)
  }

  public giveTextures() {
    const l = this.ecs.getEntitiesWithComponent(new Set([Type, PathComponent]))
    const elements: Readonly<{
      val: number
      name: ResourcePath
    }>[] = []
    const returnArr: Readonly<{
      entity: number
      names: string[]
    }>[] = []
    for (const [, v] of Object.entries(Array.from(l))) {
      const c = this.ecs.getComponents(v)
      const type = c.get(Type)
      const path = c.get(PathComponent)
      if (type === undefined || path === undefined)
        throw new Error('Invalid entity!')
      if (type.key === 'texture') {
        elements.push({
          val: v,
          name: path.key,
        })
      }
    }
    for (const [, v] of Object.entries(elements)) {
      returnArr.push({
        entity: v.val,

        names: [
          v.name.asThisEditorPath(true),
          ...this.resourceManager
            .getAllCached()
            .filter((o) => isResourcePathFromEditorPath(o))
            .filter((o) => o !== v.name.asThisEditorPath(true)),
          '_water_0',
          '_water_1',
          '_water_2',
        ],
      })
    }
    return returnArr
  }

  public update() {}
}

export { TextureMessage }
