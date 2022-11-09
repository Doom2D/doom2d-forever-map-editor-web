class PanelPlatform {
  private moveSpeed: number[] = []

  private sizeSpeed: number[] = []

  private moveStart: number[] = []

  private moveEnd: number[] = []

  private sizeEnd: number[] = []

  private moveActive = false

  private moveOnce = false

  public setMoveSpeed(x: number, y: number) {
    this.moveSpeed[0] = x
    this.moveSpeed[1] = y
  }

  public setSizeSpeed(x: number, y: number) {
    this.sizeSpeed[0] = x
    this.sizeSpeed[1] = y
  }

  public setMoveStart(x: number, y: number) {
    this.moveStart[0] = x
    this.moveStart[1] = y
  }

  public setMoveEnd(x: number, y: number) {
    this.moveEnd[0] = x
    this.moveEnd[1] = y
  }

  public setSizeEnd(x: number, y: number) {
    this.sizeEnd[0] = x
    this.sizeEnd[1] = y
  }

  public setMoveActive(k: boolean) {
    this.moveActive = k
  }

  public setMoveOnce(k: boolean) {
    this.moveOnce = k
  }

  public getMoveSpeed() {
    return {
      x: this.moveSpeed[0],
      y: this.moveSpeed[1],
    }
  }

  public getSizeSpeed() {
    return {
      x: this.sizeSpeed[0],
      y: this.sizeSpeed[1],
    }
  }

  public getMoveStart() {
    return {
      x: this.moveStart[0],
      y: this.moveStart[1],
    }
  }

  public getMoveEnd() {
    return {
      x: this.moveEnd[0],
      y: this.moveEnd[1],
    }
  }

  public getSizeEnd() {
    return {
      x: this.sizeEnd[0],
      y: this.sizeEnd[1],
    }
  }

  public getMoveActive() {
    return this.moveActive
  }

  public getMoveOnce() {
    return this.moveOnce
  }
}

export { PanelPlatform }
