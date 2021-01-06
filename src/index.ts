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
  addNumberOnMisclick?: boolean
  autoAddNumberInterval?: number
  hideNumbersAfter?: number
  hideAfterFirstClick?: boolean
  symbolGenerator: SymbolGenerator
}

type GameType = 'clearTheBoard' | 'memory' | 'speed'
type Difficulty = 'easy' | 'middle' | 'hard'

function getPredefinedGame(type: GameType, difficulty: Difficulty) {
  const predefinedGames: {
    [type in GameType]: { [difficulty in Difficulty]: GameConfig }
  } = {
    clearTheBoard: {
      easy: {
        amount: 5,
        autoAddNumberInterval: 5,
        hideNumbersAfter: 3,
        hideAfterFirstClick: true,
        symbolGenerator: new NumericAsc(),
      },
      middle: {
        amount: 10,
        addNumberOnMisclick: true,
        autoAddNumberInterval: 4,
        hideNumbersAfter: 4,
        hideAfterFirstClick: true,
        symbolGenerator: new NumericAsc(),
      },
      hard: {
        amount: 20,
        addNumberOnMisclick: true,
        autoAddNumberInterval: 3,
        hideNumbersAfter: 5,
        hideAfterFirstClick: true,
        symbolGenerator: new MixAsc(),
      },
    },

    memory: {
      easy: {
        amount: 5,
        hideNumbersAfter: 3,
        hideAfterFirstClick: true,
        symbolGenerator: new NumericAsc(),
      },
      middle: {
        amount: 10,
        addNumberOnMisclick: false,
        hideAfterFirstClick: true,
        symbolGenerator: new NumericAsc(),
      },
      hard: {
        amount: 10,
        addNumberOnMisclick: true,
        autoAddNumberInterval: 5,
        hideNumbersAfter: 5,
        hideAfterFirstClick: true,
        symbolGenerator: new NumericAsc(),
      },
    },

    speed: {
      easy: {
        amount: 10,
        hideAfterFirstClick: false,
        symbolGenerator: new NumericAsc(),
      },
      middle: {
        amount: 20,
        hideAfterFirstClick: true,
        symbolGenerator: new NumericDesc(20),
      },
      hard: {
        amount: 20,
        addNumberOnMisclick: true,
        autoAddNumberInterval: 5,
        hideNumbersAfter: 5,
        hideAfterFirstClick: true,
        symbolGenerator: new MixAsc(),
      },
    },
  }

  return predefinedGames[type][difficulty]
}

class Main {
  init() {
    ui.setScreen('newGame')
    ui.elements.newButton1.addEventListener('click', () =>
      this.startPredefinedGame(),
    )
    ui.elements.abort.addEventListener('click', () => {
      ui.setScreen('newGame')
    })
  }

  startPredefinedGame() {
    const gameType = ui.elements.gameType.value as GameType
    const difficulty = ui.elements.difficulty.value as Difficulty

    this.startGame(getPredefinedGame(gameType, difficulty))
  }

  startGame(gameConfig: GameConfig) {
    if (window.innerWidth < 1000) {
      document.documentElement.requestFullscreen()
    }
    timers.clearAll()
    ui.setScreen('game')
    const targets = new Targets()
    const board = new Board(targets)
    const game = new Game(board, targets, gameConfig)

    game.start()
  }
}
