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
        enableShowButton: 2,
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
