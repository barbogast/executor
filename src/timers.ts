class Timers {
  _timers: Set<number>

  constructor() {
    this._timers = new Set()
  }

  _clear(id: number) {
    clearTimeout(id)
    this._timers.delete(id)
  }

  setTimeout(callback: () => void, ms: number) {
    if (ms === 0) {
      callback()
      return
    }

    const timeoutId = setTimeout(() => {
      callback()
      this._timers.delete(timeoutId)
    }, ms)
    this._timers.add(timeoutId)
    return () => this._clear(timeoutId)
  }

  setInterval(callback: () => void, ms: number) {
    if (ms === 0) {
      callback()
      return
    }

    const intervalId = setInterval(callback, ms)
    this._timers.add(intervalId)
    return () => this._clear(intervalId)
  }

  clearAll() {
    this._timers.forEach(clearTimeout)
    this._timers = new Set()
    // clearTimeout can be used for both setTimeout and setInterval
  }
}
// Singleton, no need for separate instances
const timers = new Timers()
