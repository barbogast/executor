type GameConfig = {
  gameType: GameType
  difficulty: Difficulty
  symbolGenerator: SymbolGeneratorConfig
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

type GameType =
  | 'clearTheBoard'
  | 'memory'
  | 'speed'
  | 'invisibleNumbers'
  | 'custom'

type Difficulty = 'easy' | 'medium' | 'hard' | 'unknown'

function getPredefinedGame(type: GameType, difficulty: Difficulty): GameConfig {
  const predefinedGames: {
    [type in GameType]?: { [difficulty in Difficulty]?: GameConfig }
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
        symbolGenerator: { type: 'NumericAsc' },
      },
      medium: {
        gameType: 'clearTheBoard',
        difficulty: 'medium',
        amount: 10,
        addNumberOnMisclick: true,
        autoAddNumberInterval: 4,
        hideNumbersAfter: 4,
        hideAfterFirstClick: true,
        enableShowButton: 3,
        symbolGenerator: { type: 'NumericAsc' },
      },
      hard: {
        gameType: 'clearTheBoard',
        difficulty: 'hard',
        amount: 10,
        addNumberOnMisclick: true,
        autoAddNumberInterval: 3,
        hideNumbersAfter: 3,
        hideAfterFirstClick: true,
        enableShowButton: 2,
        symbolGenerator: { type: 'NumericAsc' },
      },
    },

    memory: {
      easy: {
        gameType: 'memory',
        difficulty: 'easy',
        amount: 5,
        hideAfterFirstClick: true,
        symbolGenerator: { type: 'NumericAsc' },
      },
      medium: {
        gameType: 'memory',
        difficulty: 'medium',
        amount: 7,
        hideAfterFirstClick: true,
        symbolGenerator: { type: 'NumericAsc' },
      },
      hard: {
        gameType: 'memory',
        difficulty: 'hard',
        amount: 10,
        hideAfterFirstClick: true,
        symbolGenerator: { type: 'NumericAsc' },
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
        symbolGenerator: { type: 'NumericAsc' },
        lives: 5,
      },
      medium: {
        gameType: 'invisibleNumbers',
        difficulty: 'medium',
        amount: 4,
        addNumberOnTargetHit: true,
        hideNumbersAfter: 2,
        showNumbersOnMisclick: 1,
        symbolGenerator: { type: 'NumericAsc' },
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
        symbolGenerator: { type: 'NumericAsc' },
      },
    },

    speed: {
      easy: {
        gameType: 'speed',
        difficulty: 'easy',
        amount: 10,
        symbolGenerator: { type: 'NumericAsc' },
      },
      medium: {
        gameType: 'speed',
        difficulty: 'medium',
        amount: 20,
        symbolGenerator: { type: 'NumericDesc', start: 20 },
      },
      hard: {
        gameType: 'speed',
        difficulty: 'hard',
        amount: 20,
        symbolGenerator: { type: 'MixAsc' },
      },
    },
  }

  const gameTypes = predefinedGames[type]
  if (!gameTypes) {
    throw new Error(`Config with gameType "${type}" not found`)
  }

  const gameConfig = gameTypes[difficulty]
  if (!gameConfig) {
    throw new Error(`Config with difficulty "${difficulty}" not found`)
  }

  return gameConfig
}
