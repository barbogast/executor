const AMOUNT = 10

const FONTSIZE = 26
const RADIUS = 25
const DIST = RADIUS + RADIUS * 0.1

const HIDE_AFTER = 5

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
    console.log(`
            Total duraction: ${(this!.end - this.start) / 1000} sec
            Misclicks: ${this.clicks - this.correctClicks}
        `)

    for (const int of this.intervals) {
      console.log(`${int.number}: ${int.duration / 1000} sec`)
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

function doesCollide(circles: Circle[], centerX: number, centerY: number) {
  for (const circle of circles) {
    if (
      !(
        centerX < circle.centerX - DIST * 2 ||
        centerX > circle.centerX + DIST * 2
      ) &&
      !(
        centerY < circle.centerY - DIST * 2 ||
        centerY > circle.centerY + DIST * 2
      )
    ) {
      return true
    }
  }
  return false
}

class Board {
  canvasWrapper: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  circles: Circle[]
  stats: Stats
  hideNumbers: boolean
  sizeX: number
  sizeY: number

  constructor() {
    this.circles = []
    this.stats = new Stats()
    this.hideNumbers = false

    this.canvasWrapper = getElement('canvas-wrapper')

    this.sizeX = 0
    this.sizeY = 0

    this.canvas = getElement('canvas') as HTMLCanvasElement

    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('ctx is undefined')
    }
    this.ctx = ctx
  }

  click(x: number, y: number) {
    this.stats.click()
    const clickedCircle = this.circles.find((circle) => circle.isInPath(x, y))
    if (!clickedCircle) {
      return
    }

    if (this.circles.indexOf(clickedCircle) === 0) {
      this.stats.foundNumber(clickedCircle.text)
      this.circles = this.circles.filter((c) => c.text !== clickedCircle.text)
      if (!this.circles.length) {
        this.stats.finish()
        this.stats.print()
      }
      this.draw()
    }
  }

  mouseMove(x: number, y: number) {
    for (const circle of Object.values(this.circles)) {
      if (circle.isInPath(x, y)) {
        this.canvas.classList.add('pointer')
        return
      }
    }
    this.canvas.classList.remove('pointer')
  }

  clear() {
    this.ctx.clearRect(0, 0, this.sizeX, this.sizeY)
  }

  draw() {
    this.clear()
    for (const obj of this.circles) {
      obj.draw(this.hideNumbers)
    }
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

      if (doesCollide(this.circles, centerX, centerY)) {
        continue
      }

      return [centerX, centerY]
    }
  }

  setup(gameType: GameType) {
    const newGameMenu = getElement('new-game-menu')
    newGameMenu.style.display = 'none'

    this.canvasWrapper.style.display = 'block'

    this.sizeX = this.canvasWrapper.clientWidth
    this.sizeY = this.canvasWrapper.clientHeight

    this.canvas.width = this.sizeX
    this.canvas.height = this.sizeY

    COLORS.sort(() => 0.5 - Math.random())

    const definitions = getCircleDefinitions(gameType)
    for (let i = 0; i < definitions.length; i++) {
      const [centerX, centerY] = this.findFreeSpot()
      this.circles.push(
        new Circle(this.ctx, centerX, centerY, definitions[i], COLORS[i % 10]),
      )
    }

    this.draw()

    if (HIDE_AFTER) {
      setTimeout(() => {
        this.hideNumbers = true
        this.draw()
      }, HIDE_AFTER * 1000)
    }

    this.canvas.addEventListener('click', (e) =>
      this.click(e.offsetX, e.offsetY),
    )

    this.canvas.addEventListener('mousemove', (e) =>
      this.mouseMove(e.offsetX, e.offsetY),
    )
  }
}

function main(gameType: GameType) {
  const board = new Board()
  board.setup(gameType)
}
