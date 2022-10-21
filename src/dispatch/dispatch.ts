import DispatchEvent from './dispatch-event'

class Dispatch {
  private readonly events: Record<string, DispatchEvent> = {}

  public dispatch(eventName: string, data: unknown) {
    const event = this.events[eventName]
    if (event !== undefined) {
      event.fire(data)
    }
  }

  public on(eventName: string, callback: Readonly<Function>) {
    let event = this.events[eventName]
    if (event === undefined) {
      event = new DispatchEvent(eventName)
      this.events[eventName] = event
    }
    event.registerCallback(callback)
  }

  public off(eventName: string, callback: Function) {
    const event = this.events[eventName]
    if (event?.callbacks.includes(callback)) {
      event.unregisterCallback(callback)
      if (event.callbacks.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.events[eventName]
      }
    }
  }
}

export default Dispatch
