import Application from './application'
import Dispatch from './dispatch/dispatch'
import { HTMLInterface, guiStates } from './gui'
import English from './localization/english'
import { type MessageValue } from './messager-types'
import isObject from './utility/is-object'
import pathSplit from './utility/split-path'

let activeTab = -1
// eslint-disable-next-line @typescript-eslint/init-declarations
let activeCanvas: HTMLCanvasElement | undefined

const app = new Application('store')
const dispatch = new Dispatch()
const localization = new English()
const gui = new HTMLInterface(dispatch, localization)
gui.changeRenderFlagsNames()
gui.changeImportExportNames()
gui.tick()
await app.init()
let activeTabDispatch: Dispatch | undefined

dispatch.on('onmapselect', async (name: unknown) => {
  if (typeof name !== 'string') throw new Error('Invalid return value!')
  if (activeCanvas === undefined) throw new Error('Canvas is undefined!')
  await app.loadMap(activeTab, name, activeCanvas)
  activeTabDispatch = app.mapDispatch()
  activeTabDispatch.on('onElementSelected', (data: MessageValue[]) => {
    gui.showInfo(data)
  })
})

dispatch.on('onruleselect', async (msg: unknown) => {
  if (
    !isObject(msg) ||
    msg.id === undefined ||
    msg.value === undefined ||
    typeof msg.value !== 'boolean'
  )
    throw new Error('Invalid message passed to dispatch!')
  app.updateRenderRule(msg.id, !msg.value)
})

dispatch.on('onimportclick', async () => {
  const [fileHandle] = await window.showOpenFilePicker()
  const file = await fileHandle.getFile()
  const content = await file.arrayBuffer()
  const tab = app.registerNewTab()
  activeTab = tab
  const name = pathSplit(file.name)
  await app.loadWad(activeTab, content, name.fileName)
  await app.saveWadImages(tab, true)
  gui.setState(guiStates.WAD_LOADED)
  gui.addOptionsToMapSelect(await app.getMaps(activeTab))
  activeCanvas = await gui.allocateCanvas(activeTab)
  await gui.setActiveCanvas(activeTab)
  gui.tick()
})
