class Targets {
  private _targets: Circle[]
  constructor() {
    this._targets = []
  }

  add(circle: Circle) {
    this._targets.push(circle)
  }

  forEach(callback: (x: number, y: number, text: string) => boolean | void) {
    for (const target of this._targets) {
      const abort = callback(target.centerX, target.centerY, target.text)
      if (abort) {
        return
      }
    }
  }

  findTarget(x: number, y: number) {
    return this._targets.find((target) => target.isInPath(x, y))
  }

  tapTarget(target: Circle) {
    const targetisCurrent = this._targets[0].text === target.text
    if (targetisCurrent) {
      this._targets.shift()
    }
    return targetisCurrent
  }

  isCurrentTarget(target: Circle) {
    return this._targets.indexOf(target) === 0
  }

  allTargetsReached() {
    return this._targets.length === 0
  }

  drawAll(numbersAreHidden: boolean) {
    for (const target of this._targets) {
      target.draw(numbersAreHidden)
    }
  }

  doesCollide(centerX: number, centerY: number) {
    let doesCollide = false
    this.forEach((x, y) => {
      if (
        !(centerX < x - DIST * 2 || centerX > x + DIST * 2) &&
        !(centerY < y - DIST * 2 || centerY > y + DIST * 2)
      ) {
        doesCollide = true
        return true
      }
    })

    return doesCollide
  }
}
