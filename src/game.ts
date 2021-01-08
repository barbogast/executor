type OnFinish = (stats: Stats, isFinished: boolean) => void

class Game {
  targets: Targets
  board: Board
  stats: Stats
  gameConfig: GameConfig
  _autoAddNumberTimer: () => void
  onFinish: OnFinish
  lives: number
  symbolGenerator: SymbolGenerator

  constructor(
    board: Board,
    targets: Targets,
    gameConfig: GameConfig,
    onFinish: OnFinish,
  ) {
    this.stats = new Stats(gameConfig)
    this.board = board
    this.targets = targets
    this.gameConfig = gameConfig
    this.symbolGenerator = initializeSymbolGenerator(
      this.gameConfig.symbolGenerator,
    )

    this._autoAddNumberTimer = () => {}
    this.lives = gameConfig.lives || 0
    this.onFinish = onFinish
  }

  start() {
    this.board.clear()

    COLORS.sort(() => 0.5 - Math.random())

    this.board.setup()

    for (let i = 0; i < this.gameConfig.amount; i++) {
      this.addNumber()
    }
    this.board.draw()

    const enableShowButton = this.gameConfig.enableShowButton
    if (enableShowButton) {
      ui.show('showButton')
    }

    if (this.gameConfig.hideNumbersAfter) {
      this.board.setNumberVisibility(false, this.gameConfig.hideNumbersAfter)
    }

    if (this.gameConfig.lives) {
      ui.show('lives')
      this.updateLives()
    }

    this.resetAutoAddNumberTimer()
  }

  addNumber() {
    const [centerX, centerY] = this.board.findFreeSpot()
    if (this.symbolGenerator.isLast()) {
      return
    }
    const nextNumber = this.symbolGenerator.next()
    this.targets.add(
      new Circle(
        this.board.getContext(),
        centerX,
        centerY,
        String(nextNumber),
        this.symbolGenerator.getColor(),
      ),
    )
  }

  resetAutoAddNumberTimer() {
    if (this.gameConfig.autoAddNumberInterval) {
      this._autoAddNumberTimer()
      this._autoAddNumberTimer = timers.setInterval(() => {
        this.addNumber()
        this.board.draw()
      }, this.gameConfig.autoAddNumberInterval * 1000)
    }
  }

  updateLives() {
    ui.elements.livesValue.innerHTML = String(this.lives)
  }

  endGame(isFinished: boolean) {
    this.stats.finish(ui.elements.store.checked)
    this.onFinish(this.stats, isFinished)
  }

  onClick(target: Circle | void) {
    if (this.gameConfig.hideAfterFirstClick) {
      this.board.setNumberVisibility(false, 0)
    }

    if (!target) {
      // Click missed the targets
      audioFiles.playKnock()
      return
    }

    this.stats.click()
    const targetIsCurrent = this.targets.tapTarget(target)
    if (targetIsCurrent) {
      // Click hit correct target
      this.stats.foundNumber(target.text as string)

      if (this.targets.allTargetsReached()) {
        this.endGame(true)
      } else if (this.gameConfig.addNumberOnTargetHit) {
        this.addNumber()
      }
      this.board.draw()
    } else {
      // Click hit wrong target
      this.resetAutoAddNumberTimer()
      audioFiles.playKnock()

      if (this.gameConfig.lives) {
        if (this.lives === 0) {
          this.endGame(true)
          return
        } else {
          this.lives -= 1
          this.updateLives()
        }
      }

      if (this.gameConfig.addNumberOnMisclick) {
        this.addNumber()
        this.board.draw()
      }

      if (this.gameConfig.showNumbersOnMisclick) {
        this.board.setNumberVisibility(true, 0)
        this.board.setNumberVisibility(
          false,
          this.gameConfig.showNumbersOnMisclick,
        )
      }
    }
  }

  onClickShow() {
    if (this.gameConfig.enableShowButton) {
      this.addNumber()
      this.board.setNumberVisibility(true, 0)
      this.board.setNumberVisibility(false, this.gameConfig.enableShowButton)
    }
  }
}
