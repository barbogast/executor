const FONTSIZE = 26
const RADIUS = 25
const DIST = RADIUS + RADIUS * 0.1

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

type GameConfig = {
  amount: number
  addNumberOnMisclick: boolean
  autoAddNumberInterval: number
  hideNumbersAfter: number
  hideAfterFirstClick: boolean
  symbolGenerator: SymbolGenerator
}

type Elements = {
  canvasWrapper: HTMLElement
  canvas: HTMLCanvasElement
  newGameMenu: HTMLElement
  finishGameMenu: HTMLElement
  finishGameCode: HTMLElement
  showButton: HTMLElement
  newButton1: HTMLElement
  header: HTMLElement
}

function main() {
  const ui = new UI()

  ui.hide('header')
  ui.elements.newButton1.addEventListener('click', () => {
    const gameConfig: GameConfig = {
      amount: 10,
      addNumberOnMisclick: true,
      autoAddNumberInterval: 5,
      hideNumbersAfter: 0,
      hideAfterFirstClick: true,
      symbolGenerator: new NumericAsc(),
    }

    timers.clearAll()
    const targets = new Targets()
    const board = new Board(ui, targets)
    const game = new Game(ui, board, targets, gameConfig)

    game.start()
  })
}
