import Position from '../../third-party/ecs/component/position'
import Size from '../../third-party/ecs/component/size'
import { type ECS } from '../../third-party/ecs/minimal-ecs'
import isObject from '../../utility/is-object'

export default function parsedMapAsECS(map: Record<string, unknown>, ecs: ECS) {
  if (isObject(map)) {
    for (const [, value] of Object.entries(map)) {
      if (
        value._type === 'panel' &&
        value.position !== undefined &&
        value.size !== undefined
      ) {
        const entity = ecs.addEntity()
        const position = new Position(value.position[0], value.position[1])
        const size = new Size(value.size[0], value.size[1])
        ecs.addComponent(entity, position)
        ecs.addComponent(entity, size)
      }
    }
  }
}
