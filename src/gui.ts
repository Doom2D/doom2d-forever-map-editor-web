import type Dispatch from './dispatch/dispatch'
import type { RenderRulesKey } from './editor/render/rules/rules'
import ResourceManager from './resource-manager/resource-manager'

const guiStates = {
  INIT: 0,
  WAIT_FOR_LOAD: 1,
  LOADED: 2
} as const

type guiStatesKey = typeof guiStates[keyof typeof guiStates]

class HTMLInterface {
  public readonly mapdiv: HTMLDivElement

  public readonly leftMapButton: HTMLButtonElement

  public readonly rightMapButton: HTMLButtonElement

  public readonly mapSelect: HTMLSelectElement

  public readonly area: HTMLDivElement

  private readonly tools: HTMLDivElement

  private readonly manager: ResourceManager

  private readonly doomlogo: HTMLImageElement

  private readonly line: HTMLHRElement

  private readonly selectDiv: HTMLDivElement

  private readonly importButton: HTMLButtonElement

  private readonly exportButton: HTMLButtonElement

  private state: guiStatesKey = guiStates.INIT

  private activeCanvas: HTMLCanvasElement | undefined

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    const doomlogo = document.querySelector<HTMLImageElement>('#doomlogo')
    const line = document.querySelector<HTMLHRElement>('#line')
    const mapdiv = document.querySelector<HTMLDivElement>('#mapdiv')
    const leftbutton = document.querySelector<HTMLButtonElement>('#left-arrow')
    const rightbutton =
      document.querySelector<HTMLButtonElement>('#right-arrow')
    const tools = document.querySelector<HTMLDivElement>('#tools')
    const area = document.querySelector<HTMLDivElement>('#area')
    const mapselect = document.querySelector<HTMLSelectElement>('#map')
    const selectDiv = document.querySelector<HTMLDivElement>('#select-file')
    const importButton =
      document.querySelector<HTMLButtonElement>('#select-import')
    const exportButton =
      document.querySelector<HTMLButtonElement>('#select-export')
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
      exportButton === null
    ) {
      throw new Error('Incorrect DOM!')
    }
    this.mapdiv = mapdiv
    this.leftMapButton = leftbutton
    this.rightMapButton = rightbutton
    this.mapSelect = mapselect
    this.area = area
    this.tools = tools
    this.doomlogo = doomlogo
    this.line = line
    this.selectDiv = selectDiv
    this.importButton = importButton
    this.exportButton = exportButton
    this.addCallbacks()

    this.manager = new ResourceManager()
  }

  public tick() {
    if (this.state === guiStates.INIT) {
      this.tools.replaceChildren(this.doomlogo, this.line, this.selectDiv)
    }
  }

  public addOptionsToMapSelect(src: Readonly<string[]>) {
    for (const [, v] of Object.entries(src)) {
      const option = document.createElement('option')
      option.value = v
      option.innerHTML = v
      this.mapSelect.append(option)
    }
  }

  public changeImportExportNames(
    opts: Readonly<Record<string, 'export' | 'import'>>
  ) {
    for (const [k, v] of Object.entries(opts)) {
      if (v === 'export') {
        this.exportButton.textContent = k
      } else {
        this.importButton.textContent = k
      }
    }
  }

  public changeRenderFlagsNames(opts: Record<string, RenderRulesKey>) {
    for (const [k, v] of Object.entries(opts)) {
      const element = document.querySelector(`#${v}_LABEL`)
      if (element === null) throw new Error('Invalid DOM element!')
      element.textContent = k
    }
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
