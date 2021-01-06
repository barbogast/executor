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
  symbolGenerator: SymbolGenerator
  amount: number
  addNumberOnMisclick?: boolean
  addNumberOnTargetHit?: boolean
  autoAddNumberInterval?: number
  hideNumbersAfter?: number
  hideAfterFirstClick?: boolean
  showNumbersOnMisclick?: number
  enableShowButton?: number
  lives?: number
}

type GameType = 'clearTheBoard' | 'memory' | 'speed' | 'invisibleNumbers'
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
        enableShowButton: 3,
        symbolGenerator: new NumericAsc(),
      },
      middle: {
        amount: 10,
        addNumberOnMisclick: true,
        autoAddNumberInterval: 4,
        hideNumbersAfter: 4,
        hideAfterFirstClick: true,
        enableShowButton: 3,
        symbolGenerator: new NumericAsc(),
      },
      hard: {
        amount: 20,
        addNumberOnMisclick: true,
        autoAddNumberInterval: 3,
        hideNumbersAfter: 5,
        hideAfterFirstClick: true,
        enableShowButton: 3,
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

    invisibleNumbers: {
      easy: {
        amount: 3,
        addNumberOnTargetHit: true,
        hideNumbersAfter: 3,
        showNumbersOnMisclick: 2,
        symbolGenerator: new NumericAsc(),
        lives: 5,
      },
      middle: {
        amount: 4,
        addNumberOnTargetHit: true,
        hideNumbersAfter: 2,
        showNumbersOnMisclick: 1,
        symbolGenerator: new NumericAsc(),
        lives: 3,
      },
      hard: {
        amount: 3,
        addNumberOnTargetHit: true,
        hideNumbersAfter: 1,
        enableShowButton: true,
        autoAddNumberInterval: 10,
        lives: 2,
        symbolGenerator: new NumericAsc(),
      },
    },

    speed: {
      easy: {
        amount: 10,
        symbolGenerator: new NumericAsc(),
      },
      middle: {
        amount: 20,
        symbolGenerator: new NumericDesc(20),
      },
      hard: {
        amount: 20,
        symbolGenerator: new MixAsc(),
      },
    },
  }

  return predefinedGames[type][difficulty]
}

class Main {
  init() {
    ui.setScreen('newGame')

    ui.elements.abort.addEventListener('click', () => {
      timers.clearAll()
      ui.setScreen('newGame')
    })

    ui.screens.newGame.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON') {
        const gameType = target.dataset.type as GameType
        const difficulty = target.dataset.difficulty as Difficulty
        this.startGame(getPredefinedGame(gameType, difficulty))
      }
    })
  }

  endGame(stats: Stats) {
    ui.elements.finishGameCode.innerHTML = stats.print()
    timers.clearAll()
    ui.setScreen('finishGame')
    ui.elements.newGame.addEventListener('click', () => {
      timers.clearAll()
      ui.setScreen('newGame')
    })
  }

  startGame(gameConfig: GameConfig) {
    if (window.innerWidth < 1000) {
      document.documentElement.requestFullscreen()
    }
    timers.clearAll()
    ui.setScreen('game')
    const targets = new Targets()
    const board = new Board(targets)
    const game = new Game(board, targets, gameConfig, (stats) =>
      this.endGame(stats),
    )

    game.start()
  }
}
