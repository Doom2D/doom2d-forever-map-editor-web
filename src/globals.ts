import Pixi from './render/pixi/render'
import { ECS } from './third-party/ecs/minimal-ecs'
import Render from './third-party/ecs/system/render'

const render = new Pixi()
const renderSystem = new Render(render)
const ecs = new ECS()
ecs.addSystem(renderSystem)

export { render, ecs, renderSystem }
