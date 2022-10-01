import parsedMapAsECS from './editor/game/parsed-to-entity'
import { ecs, render } from './globals'
import { loadMap } from './editor/api/api'
import { wadAsJson } from './df/resource/wad/wad-as-json'
import { DFWad } from './df/resource/wad/dfwad'
import pathSplit from './utility/split-path'
import DFWadFrom from './df/resource/wad/dfwad-from'
const n = 30

setInterval(() => {
  ecs.update()
}, 1000 / n)
render.init(document.body)

fetch('./CTF_TORMENT2.dfz')
  .then((x) => {
    x.arrayBuffer().then(async (b) => {
      const t3 = await DFWadFrom(b, pathSplit('./CTF_TORMENT2.dfz').fileName)
      // console.log(t3)
      // console.log(t3)
      const o = t3.loadFileAsString('MAP01.txt')
      // console.log(o)
      const q = loadMap(o)
      // console.log(q)
      const p = parsedMapAsECS(q, ecs)
      render.resize(q.size[0], q.size[1])
      ecs.update()
    })
  })
  .catch()
