type GameConfig = {
  gameType: GameType
  difficulty: Difficulty
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
        gameType: 'clearTheBoard',
        difficulty: 'easy',
        amount: 5,
        autoAddNumberInterval: 5,
        hideNumbersAfter: 3,
        hideAfterFirstClick: true,
        enableShowButton: 3,
        symbolGenerator: new NumericAsc(),
      },
      middle: {
        gameType: 'clearTheBoard',
        difficulty: 'middle',
        amount: 10,
        addNumberOnMisclick: true,
        autoAddNumberInterval: 4,
        hideNumbersAfter: 4,
        hideAfterFirstClick: true,
        enableShowButton: 3,
        symbolGenerator: new NumericAsc(),
      },
      hard: {
        gameType: 'clearTheBoard',
        difficulty: 'hard',
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
        gameType: 'memory',
        difficulty: 'easy',
        amount: 5,
        hideNumbersAfter: 3,
        hideAfterFirstClick: true,
        symbolGenerator: new NumericAsc(),
      },
      middle: {
        gameType: 'memory',
        difficulty: 'middle',
        amount: 10,
        addNumberOnMisclick: false,
        hideAfterFirstClick: true,
        symbolGenerator: new NumericAsc(),
      },
      hard: {
        gameType: 'memory',
        difficulty: 'hard',
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
        gameType: 'invisibleNumbers',
        difficulty: 'easy',
        amount: 3,
        addNumberOnTargetHit: true,
        hideNumbersAfter: 3,
        showNumbersOnMisclick: 2,
        symbolGenerator: new NumericAsc(),
        lives: 5,
      },
      middle: {
        gameType: 'invisibleNumbers',
        difficulty: 'middle',
        amount: 4,
        addNumberOnTargetHit: true,
        hideNumbersAfter: 2,
        showNumbersOnMisclick: 1,
        symbolGenerator: new NumericAsc(),
        lives: 3,
      },
      hard: {
        gameType: 'invisibleNumbers',
        difficulty: 'hard',
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
        gameType: 'speed',
        difficulty: 'easy',
        amount: 10,
        symbolGenerator: new NumericAsc(),
      },
      middle: {
        gameType: 'speed',
        difficulty: 'middle',
        amount: 20,
        symbolGenerator: new NumericDesc(20),
      },
      hard: {
        gameType: 'speed',
        difficulty: 'hard',
        amount: 20,
        symbolGenerator: new MixAsc(),
      },
    },
  }

  return predefinedGames[type][difficulty]
}
