import Application from './application'
import Dispatch from './dispatch/dispatch'
import HTMLInterface from './gui'
import English from './localization/english'
import isObject from './utility/is-object'
import pathSplit from './utility/split-path'

const app = new Application('store')
const dispatch = new Dispatch()
const gui = new HTMLInterface(dispatch)
const localization = new English()
gui.changeRenderFlagsNames(localization.getRenderRules())
gui.changeImportExportNames(localization.getImportExport())
gui.tick()
await app.init()

const tab = app.registerNewTab()
const test = './doom2d.wad'
const path = pathSplit(test)
const response = await fetch(test)
const buffer = await response.arrayBuffer()
await app.loadWad(tab, buffer, path.fileName)
await app.saveWadImages(tab, true)
gui.addOptionsToMapSelect(await app.getMaps(tab))
const canvas = await gui.allocateCanvas(tab)
await gui.setActiveCanvas(tab)

dispatch.on('onmapselect', async (name: unknown) => {
  if (typeof name !== 'string') throw new Error('Invalid return value!')
  await app.loadMap(tab, name, canvas)
})

dispatch.on('onruleselect', async (msg: unknown) => {
  if (
    !isObject(msg) ||
    msg.id === undefined ||
    msg.value === undefined ||
    typeof msg.value !== 'boolean'
  )
    throw new Error('Invalid message passed to dispatch!')
  await app.updateRenderRule(msg.id, !msg.value)
})

dispatch.on('onimportclick', () => {})