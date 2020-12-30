const AMOUNT = 10

const canvasWrapper = document.getElementsByClassName('canvas-wrapper')[0]
if (!canvasWrapper) {
  throw new Error('canvasContainer not found')
}
const SIZE_X = canvasWrapper.clientWidth
const SIZE_Y = canvasWrapper.clientHeight

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

function clear(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, SIZE_X, SIZE_Y)
}

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

class Circle {
  _object: Path2D | void
  centerX: any
  centerY: any
  text: any
  color: any
  constructor(centerX: number, centerY: number, text: string, color: string) {
    this._object = undefined
    this.centerX = centerX
    this.centerY = centerY
    this.text = text
    this.color = color
  }

  draw(ctx: CanvasRenderingContext2D, hideNumbers: boolean) {
    this._object = new Path2D()
    ctx.beginPath()
    this._object.arc(this.centerX, this.centerY, RADIUS, 0, 2 * Math.PI, false)
    ctx.fillStyle = this.color
    ctx.fill(this._object)
    ctx.lineWidth = 2
    ctx.strokeStyle = '#003300'
    ctx.stroke(this._object)

    ctx.fillStyle = 'black'

    if (!hideNumbers) {
      ctx.font = `${FONTSIZE}px sans-serif`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillText(this.text, this.centerX, this.centerY)
    }
  }

  isInPath(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (!this._object) {
      throw new Error('path is undefined')
    }
    return ctx.isPointInPath(this._object, x, y)
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

function findFreeSpot(circles: Circle[]) {
  const dist = RADIUS + RADIUS * 0.1

  let counter = 0
  while (true) {
    counter += 1
    if (counter > 1000) {
      throw new Error('Couldnt find free spot')
    }

    const centerX = getRandomArbitrary(0, SIZE_X)
    const centerY = getRandomArbitrary(0, SIZE_Y)
    if (
      centerX - dist < 0 ||
      centerX + DIST > SIZE_X ||
      centerY - DIST < 0 ||
      centerY + dist > SIZE_Y
    ) {
      continue
    }

    if (doesCollide(circles, centerX, centerY)) {
      continue
    }

    return [centerX, centerY]
  }
}

function draw(
  ctx: CanvasRenderingContext2D,
  objects: Circle[],
  hideNumbers: boolean,
) {
  clear(ctx)
  for (const obj of objects) {
    obj.draw(ctx, hideNumbers)
  }
}

function main(
  gameType:
    | 'numbersAsc'
    | 'numbersDesc'
    | 'mixAsc'
    | 'lettersAsc'
    | 'lettersDesc',
) {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement | void
  if (!canvas) {
    throw new Error('canvas not found')
  }
  canvas.width = SIZE_X
  canvas.height = SIZE_Y

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('ctx is undefined')
  }

  COLORS.sort(() => 0.5 - Math.random())

  const now = new Date().getTime()
  const stats = new Stats()

  let hideNumbers = false

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

  let circles: Circle[] = []

  for (let i = 0; i < def.length; i++) {
    const [centerX, centerY] = findFreeSpot(circles)
    circles.push(new Circle(centerX, centerY, def[i], COLORS[i % 10]))
  }

  draw(ctx, circles, hideNumbers)

  if (HIDE_AFTER) {
    setTimeout(() => {
      hideNumbers = true
      draw(ctx, circles, hideNumbers)
    }, HIDE_AFTER * 1000)
  }

  canvas.addEventListener('click', (e) => {
    stats.click()
    const clickedCircle = circles.find((circle) =>
      circle.isInPath(ctx, e.offsetX, e.offsetY),
    )
    if (!clickedCircle) {
      return
    }

    if (circles.indexOf(clickedCircle) === 0) {
      stats.foundNumber(clickedCircle.text)
      circles = circles.filter((c) => c.text !== clickedCircle.text)
      if (!circles.length) {
        stats.finish()
        stats.print()
      }
      draw(ctx, circles, hideNumbers)
    }
  })

  canvas.addEventListener('mousemove', (e) => {
    for (const circle of Object.values(circles)) {
      if (circle.isInPath(ctx, e.offsetX, e.offsetY)) {
        canvas.classList.add('pointer')
        return
      }
    }
    canvas.classList.remove('pointer')
  })
}
