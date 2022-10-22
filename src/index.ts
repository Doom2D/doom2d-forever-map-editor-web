import Application from './application'
import Dispatch from './dispatch/dispatch'
import HTMLInterface from './gui'
import pathSplit from './utility/split-path'

const app = new Application('store')
const dispatch = new Dispatch()
const gui = new HTMLInterface(dispatch)
await app.init()

const tab = app.registerNewTab()
const test = './CTF_TORMENT2.dfz'
const path = pathSplit(test)
const response = await fetch(test)
const buffer = await response.arrayBuffer()
await app.loadWad(tab, buffer, path.fileName)
gui.addOptionsToMapSelect(await app.getMaps(tab))
const canvas = await gui.allocateCanvas(tab)
await gui.setActiveCanvas(tab)

dispatch.on('onmapselect', async (name: unknown) => {
  if (typeof name !== 'string') throw new Error('Invalid return value!')
  await app.loadMap(tab, name, canvas)
})
