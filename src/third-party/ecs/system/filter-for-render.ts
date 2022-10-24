import { type Entity, System } from '../minimal-ecs'
import Texture from '../component/texture'
import type { RenderRulesKey } from '../../../editor/render/rules/rules'
import ForRender from '../component/for-render'
import Type from '../component/type'
import PanelFlags from '../component/panel-flag'
import PanelType from '../component/panel-type'
import { RenderOrder } from '../../../editor/render/order/order'
import { panelFlags } from '../../../editor/map/panel/flag/flags'

class RenderFilter extends System {
  public readonly componentsRequired = new Set<Function>([
    Texture,
    ForRender,
    Type,
  ])

  public entitiesLastSeenUpdate = -1

  public constructor(private rules: Readonly<RenderRulesKey[]>) {
    super()
  }

  public newRules(rules: Readonly<RenderRulesKey[]>) {
    this.rules = rules
  }

  public update(entities: Readonly<Set<Entity>>) {
    this.entitiesLastSeenUpdate = entities.size
    for (const entity of entities) {
      const components = this.ecs.getComponents(entity)
      const shouldRender = components.get(ForRender)
      const type = components.get(Type)
      const k = type.key
      if (k === 'panel') {
        const flagComponent = components.get(PanelFlags)
        const typeComponent = components.get(PanelType)
        const y = flagComponent.key.giveFlags()
        const x = typeComponent.key.giveRenderOrder()
        if (
          this.rules.includes('HIDDEN') &&
          (x === RenderOrder.HIDDEN || y.includes(panelFlags.HIDE))
        ) {
          shouldRender.setForRender(false)
          continue
        }
        if (this.rules.includes('WALL') && x === RenderOrder.WALL) {
          shouldRender.setForRender(false)
          continue
        }
        if (this.rules.includes('FOREGROUND') && x === RenderOrder.FORE) {
          shouldRender.setForRender(false)
          continue
        }
        if (this.rules.includes('BACKGROUND') && x === RenderOrder.BACK) {
          shouldRender.setForRender(false)
          continue
        }
        if (
          this.rules.includes('DOOR') &&
          (x === RenderOrder.OPENDOOR || x === RenderOrder.CLOSEDOOR)
        ) {
          shouldRender.setForRender(false)
          continue
        }
        if (this.rules.includes('LIQUID') && x === RenderOrder.LIQUID) {
          shouldRender.setForRender(false)
          continue
        }
        if (this.rules.includes('STEP') && x === RenderOrder.STEP) {
          shouldRender.setForRender(false)
          continue
        }
        shouldRender.setForRender(true)
      }
    }
  }
}

export default RenderFilter
