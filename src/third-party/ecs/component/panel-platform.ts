import { Component } from '../minimal-ecs'

import Position from './position'

class Platform extends Component {
  public on: boolean

  public movespeed: Position

  public sizespeed: Position

  public movestart: Position

  public moveEnd: Position

  public sizeEnd: Position

  public moveActive = false

  public moveOnce = false

  public constructor(key: boolean) {
    super()
    this.on = key
    this.movespeed = new Position(0, 0)
    this.sizespeed = new Position(0, 0)
    this.movestart = new Position(0, 0)
    this.moveEnd = new Position(0, 0)
    this.sizeEnd = new Position(0, 0)
  }
}

export default Platform
