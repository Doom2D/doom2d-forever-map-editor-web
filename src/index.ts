import { DFWad } from './df/resource/wad/dfwad'
import convertedMap from './editor/game/converted-map'
import ECSFromMap from './editor/game/map-as-entities'
import EditorMap from './editor/map/map'
import FileCategories from './file-category/file-categories'
import pathSplit from './utility/split-path'
const n = 30


fetch('./CTF_TORMENT2.dfz')
  .then((x) => {
    x.arrayBuffer().then(async (b) => {
      const t3 = new DFWad(b, pathSplit('./CTF_TORMENT2.dfz').fileName)
      await t3.init()
      // console.log(t3)
      const files = t3.filesForCategorising()
      const categories = new FileCategories(files)
      const c = await categories.getCategories()
      const map = c.filter((x) => x.type === 'map').pop()
      const content = t3.loadFileWithoutConverting((x) => x === map?.path)
      if (map === undefined) throw new Error('Shit WAD!')
      const mapObj = new convertedMap(content)
      const mapParsed = new EditorMap(mapObj.getUnparsed())
      console.log(mapParsed)
      const canvas = document.createElement('canvas')
      document.body.append(canvas)
      const ecs = new ECSFromMap(mapParsed, canvas)
      await ecs.init()
    })
  })
  .catch()
