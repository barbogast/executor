type OnFinish = (stats: Stats) => void

class Game {
  targets: Targets
  board: Board
  stats: Stats
  gameConfig: GameConfig
  _autoAddNumberTimer: () => void
  onFinish: OnFinish
  lives: number

  constructor(
    board: Board,
    targets: Targets,
    gameConfig: GameConfig,
    onFinish: OnFinish,
  ) {
    this.stats = new Stats()
    this.board = board
    this.targets = targets
    this.gameConfig = gameConfig
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

    this.board.registerOnClickHandler((circle) => this.onClick(circle))

    if (this.gameConfig.enableShowButton) {
      ui.show('showButton')
    }

    ui.elements.showButton.addEventListener('click', () => {
      this.addNumber()
      this.board.setNumberVisibility(true, 0)
      this.board.setNumberVisibility(false, 2)
    })

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
    if (this.gameConfig.symbolGenerator.isLast()) {
      return
    }
    const nextNumber = this.gameConfig.symbolGenerator.next()
    this.targets.add(
      new Circle(
        this.board.getContext(),
        centerX,
        centerY,
        String(nextNumber),
        this.gameConfig.symbolGenerator.getColor(),
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

  finishGame() {
    this.stats.finish()
    this.onFinish(this.stats)
  }

  onClick(target: Circle | void) {
    if (this.gameConfig.hideAfterFirstClick) {
      this.board.setNumberVisibility(false, 0)
    }

    if (!target) {
      // Click missed the targets
      return
    }

    this.stats.click()
    const targetIsCurrent = this.targets.tapTarget(target)
    if (targetIsCurrent) {
      // Click hit correct target
      this.stats.foundNumber(target.text as string)

      if (this.targets.allTargetsReached()) {
        this.finishGame()
      } else if (this.gameConfig.addNumberOnTargetHit) {
        this.addNumber()
      }
      this.board.draw()
    } else {
      // Click hit wrong target
      this.resetAutoAddNumberTimer()

      if (this.gameConfig.lives) {
        if (this.lives === 0) {
          this.finishGame()
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
}
