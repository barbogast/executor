class Board {
  ctx: CanvasRenderingContext2D
  targets: Targets
  numbersAreHidden: boolean
  sizeX: number
  sizeY: number
  ui: UI

  constructor(ui: UI, targets: Targets) {
    this.targets = targets
    this.ui = ui
    this.numbersAreHidden = false

    this.sizeX = 0
    this.sizeY = 0

    const ctx = this.ui.elements.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('ctx is undefined')
    }
    this.ctx = ctx
  }

  getContext() {
    return this.ctx
  }

  registerOnClickHandler(callback: (circle: Circle | void) => void) {
    this.ui.elements.canvas.addEventListener('click', (e) =>
      callback(this.targets.findTarget(e.offsetX, e.offsetY)),
    )
  }

  mouseMove(x: number, y: number) {
    if (this.targets.findTarget(x, y)) {
      this.ui.elements.canvas.classList.add('pointer')
    } else {
      this.ui.elements.canvas.classList.remove('pointer')
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.sizeX, this.sizeY)
  }

  draw() {
    this.clear()
    this.targets.drawAll(this.numbersAreHidden)
  }

  findFreeSpot() {
    const dist = RADIUS + RADIUS * 0.1

    let counter = 0
    while (true) {
      counter += 1
      if (counter > 1000) {
        throw new Error('Couldnt find free spot')
      }

      const centerX = getRandomArbitrary(0, this.sizeX)
      const centerY = getRandomArbitrary(0, this.sizeY)
      if (
        centerX - dist < 0 ||
        centerX + DIST > this.sizeX ||
        centerY - DIST < 0 ||
        centerY + dist > this.sizeY
      ) {
        continue
      }

      if (this.targets.doesCollide(centerX, centerY)) {
        continue
      }

      return [centerX, centerY]
    }
  }

  setNumberVisibility(isVisible: boolean, delay: number) {
    timers.setTimeout(() => {
      this.numbersAreHidden = !isVisible
      this.draw()
    }, delay * 1000)
  }

  setup() {
    this.ui.hide('newGameMenu')
    this.ui.hide('finishGameMenu')
    this.ui.show('canvasWrapper')

    this.sizeX = this.ui.elements.canvasWrapper.clientWidth
    this.sizeY = this.ui.elements.canvasWrapper.clientHeight

    this.ui.elements.canvas.width = this.sizeX
    this.ui.elements.canvas.height = this.sizeY

    this.ui.elements.canvas.addEventListener('mousemove', (e) =>
      this.mouseMove(e.offsetX, e.offsetY),
    )
  }
}
