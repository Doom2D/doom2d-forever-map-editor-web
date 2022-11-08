import type Dispatch from './dispatch/dispatch'
import type { RenderRulesKey } from './editor/render/rules/rules'
import Localization from './localization/interface'
import {
  valueIsNumbers,
  valueIsSelect,
  valueIsSelectLocale,
  valueIsString,
  type MessageValue,
} from './messager-types'
import ResourceManager from './resource-manager/resource-manager'
import { clamp } from './utility/clamp'
import { debounce } from './utility/debounce'

const guiStates = {
  INIT: 0,
  WAIT_FOR_LOAD: 1,
  WAD_LOADED: 2,
  IMPORT: 3,
  EXPORT: 4,
} as const

type guiStatesKey = typeof guiStates[keyof typeof guiStates]

class HTMLInterface {
  public readonly mapdiv: HTMLDivElement

  public readonly leftMapButton: HTMLButtonElement

  public readonly rightMapButton: HTMLButtonElement

  public readonly mapSelect: HTMLSelectElement

  public readonly area: HTMLDivElement

  private readonly tools: HTMLDivElement

  private readonly layersDiv: HTMLDivElement

  private readonly emptyOption: HTMLOptionElement

  private readonly manager: ResourceManager

  private readonly doomlogo: HTMLImageElement

  private readonly line: HTMLHRElement

  private readonly selectDiv: HTMLDivElement

  private readonly importButton: HTMLButtonElement

  private readonly exportButton: HTMLButtonElement

  private readonly infoDiv: HTMLDivElement

  private state: guiStatesKey = guiStates.INIT

  private info: (() => {
    src: string[]
    val: unknown
    entity: number
})[] = []

  private activeCanvas: HTMLCanvasElement | undefined

  public constructor(private readonly dispatch: Readonly<Dispatch>, private readonly localization: Readonly<Localization>) {
    const doomlogo = document.querySelector<HTMLImageElement>('#doomlogo')
    const line = document.querySelector<HTMLHRElement>('#line')
    const mapdiv = document.querySelector<HTMLDivElement>('#mapdiv')
    const leftbutton = document.querySelector<HTMLButtonElement>('#left-arrow')
    const rightbutton =
      document.querySelector<HTMLButtonElement>('#right-arrow')
    const tools = document.querySelector<HTMLDivElement>('#tools')
    const area = document.querySelector<HTMLDivElement>('#area')
    const layersDiv = document.querySelector<HTMLDivElement>('#layersdiv')
    const mapselect = document.querySelector<HTMLSelectElement>('#map')
    const emptyOption =
      document.querySelector<HTMLOptionElement>('#emptyoption')
    const selectDiv = document.querySelector<HTMLDivElement>('#select-file')
    const importButton =
      document.querySelector<HTMLButtonElement>('#select-import')
    const exportButton =
      document.querySelector<HTMLButtonElement>('#select-export')
    const infoDiv = document.querySelector<HTMLDivElement>('#infodiv')
    if (
      mapdiv === null ||
      leftbutton === null ||
      rightbutton === null ||
      mapselect === null ||
      area === null ||
      tools === null ||
      doomlogo === null ||
      line === null ||
      selectDiv === null ||
      importButton === null ||
      exportButton === null ||
      layersDiv === null ||
      emptyOption === null ||
      infoDiv === null
    ) {
      throw new Error('Incorrect DOM!')
    }
    this.mapdiv = mapdiv
    this.leftMapButton = leftbutton
    this.rightMapButton = rightbutton
    this.mapSelect = mapselect
    this.emptyOption = emptyOption
    this.area = area
    this.tools = tools
    this.layersDiv = layersDiv
    this.doomlogo = doomlogo
    this.line = line
    this.selectDiv = selectDiv
    this.importButton = importButton
    this.exportButton = exportButton
    this.infoDiv = infoDiv
    this.addCallbacks()

    this.manager = new ResourceManager()
  }

  public applyInfo() {
    for (const [, v] of Object.entries(this.info)) {
      this.dispatch.dispatch('onElementInfoApply', v())
    }
  }

  public showInfo(a: MessageValue[]) {
    const funcs: (() => {
      src: string[]
      val: unknown
      entity: number,
  })[] = []
    const elements: (Element)[] = []
    for (const [, v] of Object.entries(a)) {
      if (valueIsNumbers(v, v.value)) {
        const str = this.localization.getLocaleNameTranslation(v.localeName)
        const label = document.createElement('label')
        label.textContent = str
        label.htmlFor = v.localeName
        for (const [, q] of Object.entries(v.value)) {
          const n = this.localization.getLocaleNameTranslation(q.localeName)
          const input = document.createElement('input')
          input.type = 'number'
          input.id = q.localeName
          input.value = String(q.val)
          input.min = String(q.min)
          input.max = String(q.max)
          const r = () => { return {
            src: [v.localeName, q.localeName],
            val: clamp(input.valueAsNumber, Number(input.min), Number(input.max)),
            entity: v.entity,
          } }
          funcs.push(r)
          input.addEventListener('input', debounce(() => {
            this.applyInfo()
          }, 200))
          const l = document.createElement('label')
          l.htmlFor = q.localeName
          l.textContent = n
          const d = document.createElement('div')
          d.className = 'info-entry'
          d.replaceChildren(l, input)
          elements.push(d)
        }
      } else if (valueIsSelectLocale(v, v.value)) {
        const str = this.localization.getLocaleNameTranslation(v.localeName)
        const select = document.createElement('select')
        select.id = v.localeName
        const l = document.createElement('label')
        l.htmlFor = v.localeName
        l.textContent = str
        for (const [, q] of Object.entries(v.value)) {
          const option = document.createElement('option')
          option.value = q.val
          option.text = this.localization.getLocaleNameTranslation(q.localeName)
          select.appendChild(option)
        }
        const r = () => { return {
          src: [v.localeName],
          val: select.value,
          entity: v.entity,
        } }
        funcs.push(r)
        select.addEventListener('change', () => {
          this.applyInfo()
        })
        const d = document.createElement('div')
        d.className = 'info-entry'
        d.replaceChildren(l, select)
        elements.push(d)
      } else if (valueIsSelect(v, v.value)) {
        const select = document.createElement('select')
        select.id = v.localeName
        const l = document.createElement('label')
        l.htmlFor = v.localeName
        l.textContent = this.localization.getLocaleNameTranslation(v.localeName)
        for (const [, q] of Object.entries(v.value)) {
          const option = document.createElement('option')
          option.value = q.val
          option.text = q.localeName
          select.appendChild(option)
        }
        const r = () => { return {
          src: [v.localeName],
          val: select.value,
          entity: v.entity,
        } }
        funcs.push(r)
        select.addEventListener('change', () => {
          this.applyInfo()
        })
        const d = document.createElement('div')
        d.className = 'info-entry'
        d.replaceChildren(l, select)
        elements.push(d)
      }
    }
    this.info = []
    this.info.push(...funcs)
    this.infoDiv.replaceChildren(...elements)
  }

  public tick() {
    if (this.state === guiStates.INIT) {
      this.tools.replaceChildren(this.doomlogo, this.selectDiv, this.line)
    } else if (this.state === guiStates.WAD_LOADED) {
      this.tools.replaceChildren(
        this.doomlogo,
        this.selectDiv,
        this.line,
        this.mapdiv,
        this.layersDiv,
        this.infoDiv
      )
    }
  }

  public addOptionsToMapSelect(src: Readonly<string[]>) {
    this.mapSelect.replaceChildren(this.emptyOption)
    for (const [, v] of Object.entries(src)) {
      const option = document.createElement('option')
      option.value = v
      option.innerHTML = v
      this.mapSelect.append(option)
    }
  }

  public changeImportExportNames() {
    const opts = this.localization.getImportExport()
    for (const [k, v] of Object.entries(opts)) {
      if (v === 'export') {
        this.exportButton.textContent = k
      } else {
        this.importButton.textContent = k
      }
    }
  }

  public changeRenderFlagsNames() {
    const opts = this.localization.getRenderRules()
    for (const [k, v] of Object.entries(opts)) {
      const element = document.querySelector(`#${v}_LABEL`)
      if (element === null) throw new Error('Invalid DOM element!')
      element.textContent = k
    }
  }

  public setState(state: guiStatesKey) {
    this.state = state
  }

  private addCallbacks() {
    this.mapSelect.addEventListener('change', () => {
      this.dispatch.dispatch('onmapselect', this.mapSelect.value)
    })

    const checkboxes = document.querySelectorAll<HTMLInputElement>('.rulebox')
    // eslint-disable-next-line @typescript-eslint/prefer-for-of, unicorn/no-for-loop
    for (let i = 0; i < checkboxes.length; i += 1) {
      const elem = checkboxes[i]
      elem.addEventListener('change', () => {
        this.dispatch.dispatch('onruleselect', {
          id: elem.id,
          value: elem.checked,
        })
      })
    }

    this.importButton.addEventListener('click', () => {
      this.dispatch.dispatch('onimportclick', {})
    })
  }

  public async setActiveCanvas(tab: number) {
    const canvas = (await this.manager.getItem(String(tab))) as
      | HTMLCanvasElement
      | null
      | undefined
    if (canvas === null || canvas === undefined) {
      throw new Error('Invalid tab number!')
    }
    if (this.activeCanvas !== undefined) {
      this.activeCanvas.remove()
    }
    this.activeCanvas = canvas
    this.area.append(canvas)
  }

  public async allocateCanvas(tab: number) {
    const canvas = document.createElement('canvas')
    canvas.width = this.area.clientWidth
    canvas.height = this.area.clientHeight
    await this.manager.saveItem(String(tab), canvas, true)
    return canvas
  }

  public async getTabCanvas(tab: number) {
    const canvas = (await this.manager.getItem(String(tab))) as
      | HTMLCanvasElement
      | null
      | undefined
    if (canvas === null || canvas === undefined) {
      throw new Error('Invalid tab number!')
    }
    return canvas
  }
}

export default HTMLInterface

export { HTMLInterface, guiStates, type guiStatesKey }
