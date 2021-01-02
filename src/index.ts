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

type GameConfig = {
  amount: number
  addNumberOnMisclick: boolean
  autoAddNumberInterval: number
  hideNumbersAfter: number
  hideAfterFirstClick: boolean
  symbolGenerator: SymbolGenerator
}

class Main {
  ui: UI
  constructor() {
    this.ui = new UI()
  }

  init() {
    this.ui.hide('inGameMenu')
    this.ui.elements.newButton1.addEventListener('click', () =>
      this.startGame(),
    )
  }

  startGame() {
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
    const board = new Board(this.ui, targets)
    const game = new Game(this.ui, board, targets, gameConfig)

    game.start()
  }
}
