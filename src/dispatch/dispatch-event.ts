class DispatchEvent {
  public readonly callbacks: Function[] = []

  public constructor(private readonly eventName: string) {}

  public registerCallback(callback: Readonly<Function>) {
    this.callbacks.push(callback)
  }

  public unregisterCallback(callback: Readonly<Function>) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  public fire(data: unknown) {
    const callbacks = this.callbacks.slice(0)
    callbacks.forEach((callback) => {
      callback(data)
    })
  }

  public getName() {
    return this.eventName
  }
}

export default DispatchEvent
