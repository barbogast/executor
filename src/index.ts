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

class Main {
  game!: Game
  targets!: Targets
  board!: Board

  init() {
    ui.setScreen('newGame')

    ui.elements.abort.addEventListener('click', () => {
      timers.clearAll()
      ui.setScreen('newGame')
      this.game.endGame(false)
    })

    ui.elements.startGameContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON') {
        const gameType = target.dataset.type as GameType
        const difficulty = target.dataset.difficulty as Difficulty
        this.startGame(getPredefinedGame(gameType, difficulty))
      }
    })

    ui.elements.canvas.addEventListener('mousedown', (e) => {
      const circle = this.targets.findTarget(e.offsetX, e.offsetY)
      this.game.onClick(circle)
    })

    ui.elements.showButton.addEventListener('click', () =>
      this.game.onClickShow(),
    )

    ui.elements.canvas.addEventListener('mousemove', (e) =>
      this.board.mouseMove(e.offsetX, e.offsetY),
    )

    ui.elements.back.addEventListener('click', () => {
      timers.clearAll()
      ui.setScreen('newGame')
    })

    ui.elements.startCustomGame.addEventListener('click', () => {
      ui.setScreen('newGame')
    })

    ui.elements.newGame.addEventListener('click', () => {
      this.startGame(this.game.gameConfig)
    })

    ui.elements.clipboard.addEventListener('click', () =>
      this.copyToClipboard(),
    )

    ui.elements.customGame.addEventListener('click', () => {
      ui.setScreen('customGame')
    })

    ui.elements.startCustomGame.addEventListener('click', () => {
      this.createCustomGame()
    })

    ui.elements.loadExistingConfig.addEventListener('change', (e) => {
      this.loadExistingConfig(e)
    })
  }

  endGame(stats: Stats, isFinished: boolean) {
    timers.clearAll()
    if (isFinished) {
      this.showResults(stats)
    }
  }

  showResults(stats: Stats) {
    ui.elements.finishGameCode.innerHTML = stats.print()
    ui.setScreen('finishGame')
  }

  startGame(gameConfig: GameConfig) {
    if (window.innerWidth < 1000) {
      document.documentElement.requestFullscreen()
    }
    timers.clearAll()
    ui.setScreen('game')
    this.targets = new Targets()
    this.board = new Board(this.targets)
    this.game = new Game(this.board, this.targets, gameConfig, (s, i) =>
      this.endGame(s, i),
    )

    this.game.start()
  }

  copyToClipboard() {
    const stats = Stats.statsToCsv()
    if (!stats) {
      alert('No stats present')
      return
    }

    navigator.clipboard
      .writeText(stats)
      .then(() => alert('Text copied to clipboard.'))
      .catch((e) => {
        console.error(e)
        alert('Stats could not be copied to clipboard')
      })
  }

  createCustomGame() {
    const gameConfig: GameConfig = {
      gameType: 'custom',
      difficulty: 'unknown',
      symbolGenerator: {
        type: 'AlphaAsc',
      },
      amount: parseInt(ui.readInput('amount')),
      addNumberOnMisclick: ui.readCheckbox('addNumberOnMisclick'),
      addNumberOnTargetHit: ui.readCheckbox('addNumberOnTargetHit'),
      autoAddNumberInterval: parseInt(ui.readInput('autoAddNumberInterval')),
      hideAfterFirstClick: ui.readCheckbox('hideAfterFirstClick'),
      hideNumbersAfter: parseInt(ui.readInput('hideNumbersAfter')),
      showNumbersOnMisclick: parseInt(ui.readInput('showNumbersOnMisclick')),
      enableShowButton: parseInt(ui.readInput('enableShowButton')),
      lives: parseInt(ui.readInput('lives')),
    }
    this.startGame(gameConfig)
  }

  loadExistingConfig(e: Event) {
    const target = e.target as HTMLSelectElement
    const option = target.options[target.selectedIndex]
    const gameType = option.dataset.type as GameType
    const difficulty = option.dataset.difficulty as Difficulty
    const config = getPredefinedGame(gameType, difficulty)

    ui.writeInput('amount', config.amount)
    ui.writeInput('autoAddNumberInterval', config.autoAddNumberInterval)
    ui.writeInput('hideNumbersAfter', config.hideNumbersAfter)
    ui.writeInput('showNumbersOnMisclick', config.showNumbersOnMisclick)
    ui.writeInput('enableShowButton', config.enableShowButton)
    ui.writeInput('lives', config.lives)
    ui.writeCheckbox('addNumberOnMisclick', config.addNumberOnMisclick)
    ui.writeCheckbox('addNumberOnTargetHit', config.addNumberOnTargetHit)
    ui.writeCheckbox('hideAfterFirstClick', config.hideAfterFirstClick)
  }
}
