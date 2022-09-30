import parsedMapAsECS from './editor/game/parsed-to-entity'
import { ecs, render } from './globals'
import { loadMap } from './editor/api/api'
import { wadAsJson } from './df/resource/wad/wad-as-json'
import { DFWad } from './df/resource/wad/dfwad'
import pathSplit from './utility/split-path'
const n = 30

setInterval(() => {
  ecs.update()
}, 1000 / n)
render.init(document.body)

fetch('./doom2d.wad')
  .then((x) => {
    x.arrayBuffer().then((b) => {
      const t3 = new DFWad(b, pathSplit('./doom2d.wad').fileName)
      //  const o = loadMap(b).mapObject
      // console.log(o)
      // const p = parsedMapAsECS(o, ecs)
      // render.resize(o.size[0], o.size[1])
      // ecs.update()
    })
  })
  .catch()
