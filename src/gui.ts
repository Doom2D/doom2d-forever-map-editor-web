import type Dispatch from './dispatch/dispatch'
import type { RenderRulesKey } from './editor/render/rules/rules'
import Localization from './localization/interface'
import {
  valueIsBoolean,
  valueIsNumbers,
  valueIsPosition,
  valueIsSelect,
  valueIsSelectLocale,
  valueIsSize,
  valueIsString,
  type MessageValue,
} from './messager-types'
import ResourceManager from './resource-manager/resource-manager'
import { clamp } from './utility/clamp'
import { debounce } from './utility/debounce'

const guiStates = {
  INIT: 0,
  LOADED: 1,
  LAYERS: 2,
  CREATE_TEXTURE: 3,
} as const

type guiStatesKey = typeof guiStates[keyof typeof guiStates]

class HTMLInterface {
  private readonly mapdiv: HTMLDivElement

  private readonly leftMapButton: HTMLButtonElement

  private readonly rightMapButton: HTMLButtonElement

  private readonly mapSelect: HTMLSelectElement

  private readonly area: HTMLDivElement

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

  private readonly menuDiv: HTMLDivElement

  private readonly layersButton: HTMLButtonElement

  private readonly textureButton: HTMLButtonElement

  private readonly mainButton: HTMLButtonElement

  private readonly textureDiv: HTMLDivElement

  private readonly textureCreateButton: HTMLButtonElement

  private readonly textureAddButton: HTMLButtonElement

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
    const menuDiv = document.querySelector<HTMLDivElement>('#menudiv')
    const layersButton = document.querySelector<HTMLButtonElement>('#layersbutton')
    const textureButton = document.querySelector<HTMLButtonElement>('#texturebutton')
    const mainButton = document.querySelector<HTMLButtonElement>('#mainbutton')
    const textureDiv = document.querySelector<HTMLDivElement>('#texturediv')
    const textureCreateButton = document.querySelector<HTMLButtonElement>('#texturecreatebutton')
    const textureAddButton = document.querySelector<HTMLButtonElement>('#textureaddbutton')
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
      infoDiv === null ||
      menuDiv === null ||
      layersButton === null ||
      textureButton === null ||
      mainButton === null ||
      textureDiv === null ||
      textureCreateButton === null ||
      textureAddButton === null
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
    this.menuDiv = menuDiv
    this.layersButton = layersButton
    this.textureButton = textureButton
    this.mainButton = mainButton
    this.textureDiv = textureDiv
    this.textureCreateButton = textureCreateButton
    this.textureAddButton = textureAddButton
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
      } else if (valueIsBoolean(v, v.value)) {
        const str = this.localization.getLocaleNameTranslation(v.localeName)
        const label = document.createElement('label')
        label.textContent = str
        label.htmlFor = v.localeName
        console.log(v)
        for (const [, q] of Object.entries(v.value)) {
          const n = this.localization.getLocaleNameTranslation(q.localeName)
          const input = document.createElement('input')
          input.type = 'checkbox'
          input.id = q.localeName
          if (q.val) input.checked = true
          else input.checked = false
          const r = () => { return {
            src: [v.localeName, q.localeName],
            val: Boolean(input.checked),
            entity: v.entity,
          } }
          funcs.push(r)
          input.addEventListener('click', () => {
            this.applyInfo()
          })
          const l = document.createElement('label')
          l.htmlFor = q.localeName
          l.textContent = n
          const d = document.createElement('div')
          d.className = 'info-entry'
          d.replaceChildren(l, input)
          elements.push(d)
        }
      } else if (valueIsPosition(v, v.value) || valueIsSize(v, v.value)) {
        for (const [, q] of Object.entries(v.value)) {
          const d = document.createElement('div')
          d.className = 'info-entry'
          const l = document.createElement('button')
          // l.htmlFor = q.localeName
          l.textContent = this.localization.getLocaleNameTranslation(q.localeName)
          const event = (valueIsPosition(v, v.value) ? 'onSelectPositionStart' : 'onSelectSizeStart')
          const y = () => {
            this.dispatch.dispatch(event, {
              entity: v.entity,
              src: v,
              msg: q,
            })
          }
          l.addEventListener('click', () => {
            y()
          })
          d.appendChild(l)
          for (const [, i] of Object.entries(q.val)) {
            const input = document.createElement('input')
            input.type = 'number'
            input.id = q.localeName
            input.value = String(i.val)
            input.min = String(i.min)
            input.max = String(i.max)
            const r = () => { return {
              src: [v.localeName, q.localeName, i.localeName],
              val: clamp(input.valueAsNumber, Number(input.min), Number(input.max)),
              entity: v.entity,
            } }
            funcs.push(r)
            input.addEventListener('input', debounce(() => {
              this.applyInfo()
            }, 200))
            const l = document.createElement('label')
            l.htmlFor = i.localeName
            l.textContent = this.localization.getLocaleNameTranslation(i.localeName)
            d.appendChild(l)
            d.appendChild(input)
          }
          elements.push(d)
        }
      }
    }
    this.info = []
    this.info.push(...funcs)
    this.infoDiv.replaceChildren(...elements)
  }

  public tick() {
    if (this.state === guiStates.INIT) {
      this.tools.replaceChildren(this.doomlogo, this.selectDiv, this.line)
    } else if (this.state === guiStates.LOADED) {
      this.tools.replaceChildren(this.doomlogo, this.selectDiv, this.mapdiv, this.line, this.menuDiv, this.infoDiv)
    } else if (this.state === guiStates.LAYERS) {
      this.tools.replaceChildren(
        this.doomlogo,
        this.selectDiv,
        this.mapdiv,
        this.line,
        this.menuDiv,
        this.layersDiv,
      )
    } else if (this.state === guiStates.CREATE_TEXTURE) {
      this.dispatch.dispatch('onTextureMenuCreate', {})
      this.tools.replaceChildren(this.doomlogo, this.selectDiv, this.mapdiv, this.line, this.menuDiv, this.textureCreateButton, this.textureDiv)
    }
  }

  public populateTextureMenu(data: Readonly<{
    val: Readonly<{
      entity: number;
      names: Readonly<string[]>;
    }[]>
    allNames: readonly string[];
}>) {
  this.textureCreateButton.textContent = this.localization.getLocaleNameTranslation('CREATETEXTUREENTITY')
  this.textureAddButton.textContent = this.localization.getLocaleNameTranslation('ADDTEXTURE')
  this.textureCreateButton.onclick = (ev) => {
    this.dispatch.dispatch('onRequestTextureCreate', {})
    this.dispatch.dispatch('onTextureMenuCreate', {})
  }
  this.textureDiv.replaceChildren(this.textureCreateButton)
  for (const [k, v] of Object.entries(data.val)) {
    const select = document.createElement('select')
    select.id = String(v.entity)
    const l = document.createElement('label')
    l.htmlFor = String(v.entity)
    l.textContent = `Texture ${Number(k)}.`
    const r = () => {
      return {
        val: select.value,
        entity: v.entity
      }
    }
    select.addEventListener('click', (ev) => {
      const result = r()
      const data = {
        entity: result.entity,
        newPath: result.val,
      }
      this.dispatch.dispatch('onRequestTextureChange', data)
    })
    for (const [, q] of Object.entries(v.names)) {
      const option = document.createElement('option')
      option.value = q
      option.text = q
      select.appendChild(option)
    }
    const d = document.createElement('div')
    d.className = 'texture-entry'
    d.replaceChildren(l, select)
    this.textureDiv.appendChild(d)
  }
  this.textureAddButton.onclick = () => {
    this.dispatch.dispatch('onSaveTexture', {
      val: tselect.value,
    })
  }
  this.textureDiv.appendChild(this.textureAddButton)
  const tselect = document.createElement('select')
  tselect.id = 'add-texture'
  for (const [, v] of Object.entries(data.allNames)) {
    const option = document.createElement('option')
    option.value = v
    option.text = v
    tselect.appendChild(option)
  }
  this.textureDiv.appendChild(tselect)
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

  public changeMenuButtonNames() {
    const opts = this.localization.getAllMenuButtonsTranslation()
    for (const [k, v] of Object.entries(opts)) {
      const element = document.querySelector(`#${k}`)
      if (element === null) throw new Error('Invalid DOM element!')
      element.textContent = v
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

    this.layersButton.addEventListener('click', () => {
      this.setState(guiStates.LAYERS)
      this.tick()
    })

    this.textureButton.addEventListener('click', () => {
      this.setState(guiStates.CREATE_TEXTURE)
      this.tick()
    })
    
    this.mainButton.addEventListener('click', () => {
      this.setState(guiStates.LOADED)
      this.tick()
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
