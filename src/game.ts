class Game {
  targets: Targets
  board: Board
  stats: Stats
  gameConfig: GameConfig

  constructor(board: Board, targets: Targets, gameConfig: GameConfig) {
    this.stats = new Stats()
    this.board = board
    this.targets = targets
    this.gameConfig = gameConfig
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

    if (this.gameConfig.autoAddNumberInterval) {
      timers.setInterval(() => {
        this.addNumber()
        this.board.draw()
      }, this.gameConfig.autoAddNumberInterval * 1000)
    }
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

  onClick(target: Circle | void) {
    this.stats.click()
    if (this.gameConfig.hideAfterFirstClick) {
      this.board.setNumberVisibility(false, 0)
    }

    if (!target) {
      // Click missed the targets
      if (this.gameConfig.addNumberOnMisclick) {
        this.addNumber()
        this.board.draw()
      }
      return
    }

    const targetIsCurrent = this.targets.tapTarget(target)
    if (targetIsCurrent) {
      // Click hit correct target
      this.stats.foundNumber(target.text as string)

      if (this.targets.allTargetsReached()) {
        this.stats.finish()
        ui.elements.finishGameCode.innerHTML = this.stats.print()
        timers.clearAll()
        ui.setScreen('finishGame')
      } else if (this.gameConfig.addNumberOnTargetHit) {
        this.addNumber()
      }
      this.board.draw()
    } else {
      // Click hit wrong target
      if (this.gameConfig.addNumberOnMisclick) {
        this.addNumber()
        this.board.draw()
      }
    }
  }
}
