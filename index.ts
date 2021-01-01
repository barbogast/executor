const AMOUNT = 10

const FONTSIZE = 26
const RADIUS = 25
const DIST = RADIUS + RADIUS * 0.1

const HIDE_AFTER = 3
const HIDE_AFTER_CLICK = false
const AUTO_ADD_INTERVAL = 5
const ADD_NUMBER_ON_MISCLICK = true

const COLORS = [
  // https://coolors.co/a86282-9a75a3-7998af-71afbb-6ac1c8-d3dcad-e9c6af-fab6ad-f6958e-f07270
  '#A86282',
  '#9A75A3',
  '#7998AF',
  '#71AFBB',
  '#6AC1C8',
  '#D3DCAD',
  '#E9C6AF',
  '#FAB6AD',
  '#F6958E',
  '#F07270',
]

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

function getCurrentTimestamp() {
  return new Date().getTime()
}

function getAlphabet(limit: number) {
  let a = ''
  for (let i = 9; ++i < 36; ) {
    a += i.toString(36)
  }
  return a.slice(0, limit).toUpperCase().split('')
}

function getElement(className: string) {
  const el = document.getElementsByClassName(className)[0]
  if (!el) {
    throw new Error('.${className} not found')
  }
  return el as HTMLElement
}

class Stats {
  start: number
  end: number
  startCurrent: number
  clicks: number
  correctClicks: number
  intervals: { number: string; duration: number }[]

  constructor() {
    const now = getCurrentTimestamp()
    this.start = now
    this.end = now
    this.startCurrent = now
    this.clicks = 0
    this.correctClicks = 0
    this.intervals = []
  }

  click() {
    this.clicks += 1
  }

  foundNumber(number: string) {
    this.correctClicks += 1
    const now = getCurrentTimestamp()
    this.intervals.push({ number, duration: now - this.startCurrent })
    this.startCurrent = now
  }

  finish() {
    this.end = getCurrentTimestamp()
  }

  print() {
    let res = ''

    res += `
Total duraction: ${(this!.end - this.start) / 1000} sec
Misclicks: ${this.clicks - this.correctClicks}

`

    for (const int of this.intervals) {
      res += `${int.number}: ${int.duration / 1000} sec\n`
    }

    const opts = {
      height: 6,
      format: function (x: number, i: number) {
        return (x / 1000).toFixed(2)
      },
    }
    // console.log(
    //   asciichart.plot(
    //     this.intervals.map((x) => x.duration),
    //     opts,
    //   ),
    // )
    return res
  }
}

type GameType =
  | 'numbersAsc'
  | 'numbersDesc'
  | 'mixAsc'
  | 'lettersAsc'
  | 'lettersDesc'

function getCircleDefinitions(gameType: GameType) {
  let def: string[] = []
  switch (gameType) {
    case 'numbersAsc': {
      for (let i = 0; i < AMOUNT; i++) {
        def.push(String(i + 1))
      }
      break
    }

    case 'numbersDesc': {
      for (let i = AMOUNT; i > 0; i--) {
        def.push(String(i))
      }
      break
    }

    case 'mixAsc': {
      const alpha = getAlphabet(AMOUNT)
      for (let i = 0; i < AMOUNT; i++) {
        def.push(String(i + 1))
        def.push(alpha[i])
      }
      def = def.slice(0, AMOUNT)
      break
    }

    case 'lettersAsc': {
      def = getAlphabet(AMOUNT)
      break
    }

    case 'lettersDesc': {
      def = getAlphabet(AMOUNT)
      def.reverse()
      break
    }
  }
  return def
}

class Circle {
  ctx: CanvasRenderingContext2D
  _object: Path2D | void
  centerX: number
  centerY: number
  text: string
  color: string

  constructor(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    text: string,
    color: string,
  ) {
    this.ctx = ctx
    this._object = undefined
    this.centerX = centerX
    this.centerY = centerY
    this.text = text
    this.color = color
  }

  draw(hideNumbers: boolean) {
    this._object = new Path2D()
    this.ctx.beginPath()
    this._object.arc(this.centerX, this.centerY, RADIUS, 0, 2 * Math.PI, false)
    this.ctx.fillStyle = this.color
    this.ctx.fill(this._object)
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = '#003300'
    this.ctx.stroke(this._object)

    this.ctx.fillStyle = 'black'

    if (!hideNumbers) {
      this.ctx.font = `${FONTSIZE}px sans-serif`
      this.ctx.textBaseline = 'middle'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(this.text, this.centerX, this.centerY)
    }
  }

  isInPath(x: number, y: number) {
    if (!this._object) {
      throw new Error('path is undefined')
    }
    return this.ctx.isPointInPath(this._object, x, y)
  }
}

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

  drawAll(ctx: CanvasRenderingContext2D, numbersAreHidden: boolean) {
    for (const target of this._targets) {
      target.draw(numbersAreHidden)
    }
  }

  getNextNumber() {
    return parseInt(this._targets[this._targets.length - 1].text) + 1
  }
}

function doesCollide(targets: Targets, centerX: number, centerY: number) {
  let doesCollide = false
  targets.forEach((x, y) => {
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

type Elements = {
  canvasWrapper: HTMLElement
  canvas: HTMLCanvasElement
  newGameMenu: HTMLElement
  finishGameMenu: HTMLElement
  finishGameCode: HTMLElement
  showButton: HTMLElement
}

class UI {
  elements: Elements

  constructor() {
    this.elements = {
      canvasWrapper: getElement('canvas-wrapper'),
      canvas: getElement('canvas') as HTMLCanvasElement,
      newGameMenu: getElement('new-game-menu'),
      finishGameMenu: getElement('finish-game-menu'),
      finishGameCode: getElement('finish-game-code'),
      showButton: getElement('show'),
    }
  }

  show(key: keyof Elements) {
    this.elements[key].style.display = 'block'
  }

  hide(key: keyof Elements) {
    this.elements[key].style.display = 'none'
  }
}

class Board {
  ctx: CanvasRenderingContext2D
  targets: Targets
  numbersAreHidden: boolean
  sizeX: number
  sizeY: number
  ui: UI

  constructor(targets: Targets, ui: UI) {
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
    this.targets.drawAll(this.ctx, this.numbersAreHidden)
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

      if (doesCollide(this.targets, centerX, centerY)) {
        continue
      }

      return [centerX, centerY]
    }
  }

  setNumberVisibility(isVisible: boolean, delay: number) {
    setTimeout(() => {
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

class Game {
  targets: Targets
  board: Board
  stats: Stats
  ui: UI

  constructor() {
    this.targets = new Targets()
    this.ui = new UI()
    this.board = new Board(this.targets, this.ui)
    this.stats = new Stats()
  }

  start(gameType: GameType) {
    COLORS.sort(() => 0.5 - Math.random())

    const definitions = getCircleDefinitions(gameType)

    this.board.setup()

    for (let i = 0; i < definitions.length; i++) {
      const [centerX, centerY] = this.board.findFreeSpot()
      this.targets.add(
        new Circle(
          this.board.getContext(),
          centerX,
          centerY,
          definitions[i],
          COLORS[i % 10],
        ),
      )
    }
    this.board.draw()

    this.board.registerOnClickHandler((circle) => this.onClick(circle))

    this.ui.elements.showButton.addEventListener('click', () => {
      this.addNumber()
      this.board.setNumberVisibility(true, 0)
      this.board.setNumberVisibility(false, 2)
    })

    if (HIDE_AFTER) {
      this.board.setNumberVisibility(false, HIDE_AFTER)
    }

    if (AUTO_ADD_INTERVAL) {
      setInterval(() => {
        this.addNumber()
        this.board.draw()
      }, AUTO_ADD_INTERVAL * 1000)
    }
  }

  addNumber() {
    const [centerX, centerY] = this.board.findFreeSpot()
    const nextNumber = this.targets.getNextNumber()
    this.targets.add(
      new Circle(
        this.board.getContext(),
        centerX,
        centerY,
        String(nextNumber),
        COLORS[nextNumber % 10],
      ),
    )
  }

  onClick(target: Circle | void) {
    this.stats.click()
    if (HIDE_AFTER_CLICK) {
      this.board.setNumberVisibility(false, 0)
    }
    if (!target) {
      if (ADD_NUMBER_ON_MISCLICK) {
        this.addNumber()
        this.board.draw()
      }
      return
    }

    const targetIsCurrent = this.targets.tapTarget(target)
    if (targetIsCurrent) {
      this.stats.foundNumber(target.text as string)
      if (this.targets.allTargetsReached()) {
        this.stats.finish()
        this.ui.hide('canvasWrapper')
        this.ui.show('finishGameMenu')
        this.ui.elements.finishGameCode.innerHTML = this.stats.print()
      }
      this.board.draw()
    }
  }
}

function main(gameType: GameType) {
  new Game().start(gameType)
}
