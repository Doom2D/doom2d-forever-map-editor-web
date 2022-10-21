import type Dispatch from './dispatch/dispatch'

class HTMLInterface {
  public readonly mapdiv: HTMLDivElement

  public readonly leftMapButton: HTMLButtonElement

  public readonly rightMapButton: HTMLButtonElement

  public readonly mapSelect: HTMLSelectElement

  public constructor(private readonly dispatch: Readonly<Dispatch>) {
    const mapdiv = document.querySelector<HTMLDivElement>('#mapdiv')
    const leftbutton = document.querySelector<HTMLButtonElement>('#left-arrow')
    const rightbutton =
      document.querySelector<HTMLButtonElement>('#right-arrow')
    const mapselect = document.querySelector<HTMLSelectElement>('#map')
    if (
      mapdiv === null ||
      leftbutton === null ||
      rightbutton === null ||
      mapselect === null
    ) {
      throw new Error('Incorrect DOM!')
    }
    this.mapdiv = mapdiv
    this.leftMapButton = leftbutton
    this.rightMapButton = rightbutton
    this.mapSelect = mapselect

    this.addCallbacks()
  }

  public addOptionsToMapSelect(src: Readonly<string[]>) {
    for (const [, v] of Object.entries(src)) {
      const option = document.createElement('option')
      option.value = v
      option.innerHTML = v
      this.mapSelect.append(option)
    }
  }

  private addCallbacks() {
    this.mapSelect.addEventListener('change', () => {
      this.dispatch.dispatch('onmapselect', this.mapSelect.value)
    })
  }
}

export default HTMLInterface
