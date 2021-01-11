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

    var sound = new Howl({
      src: ['knock.mp3'],
    })

    let audioCtx, audioElement, track, audioBuffer
    const AudioContext = window.AudioContext || window.webkitAudioContext

    ui.elements.startGameContainer.addEventListener('click', (e) => {
      audioCtx = new AudioContext()

      window
        .fetch('knock.mp3')
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioCtx.decodeAudioData(arrayBuffer))
        .then((buffer) => {
          // playButton.disabled = false;
          audioBuffer = buffer
        })

      // load some sound
      audioElement = document.querySelector('audio')
      track = audioCtx.createMediaElementSource(audioElement)

      if (audioCtx.state === 'suspended') {
        audioCtx.resume()
      }

      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON') {
        const gameType = target.dataset.type as GameType
        const difficulty = target.dataset.difficulty as Difficulty
        this.startGame(getPredefinedGame(gameType, difficulty))
      }
    })

    let x

    ui.elements.canvas.addEventListener('pointerdown', (e) => {
      if (x) {
        console.log('pointerdown', getCurrentTimestamp() - x)
      } else {
        console.log('pointerdown', 0)
      }
      x = getCurrentTimestamp()
    })

    ui.elements.canvas.addEventListener('touchstart', (e) => {
      // audioFiles.playKnock()
      // console.log('play')

      // audioElement.play()

      // const source = audioCtx.createBufferSource()
      // source.buffer = audioBuffer
      // source.connect(audioCtx.destination)
      // source.start()

      sound.play()
      setTimeout(() => {
        sound.play()
      }, 1000)

      if (x) {
        console.log('touchstart', getCurrentTimestamp() - x)
      } else {
        console.log('touchstart', 0)
      }
      x = getCurrentTimestamp()
    })

    ui.elements.canvas.addEventListener('mousedown', (e) => {
      console.log('XXX', audioElement)
      // if (audioCtx.state === 'suspended') {
      //   audioCtx.resume()
      // }
      // audioElement.play()

      // const source = audioCtx.createBufferSource()
      // source.buffer = audioBuffer
      // source.connect(audioCtx.destination)
      // source.start()

      if (x) {
        console.log('mousedown', getCurrentTimestamp() - x)
      } else {
        console.log('mousedown', 0)
      }
      x = getCurrentTimestamp()
    })

    ui.elements.canvas.addEventListener('click', (e) => {
      if (x) {
        console.log('click', getCurrentTimestamp() - x)
      } else {
        console.log('click', 0)
      }
      x = getCurrentTimestamp()
    })

    ui.elements.canvas.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0]
      const circle = this.targets.findTarget(touch.pageX, touch.pageY)
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

    ui.elements.newGame.addEventListener('click', () => {
      this.startGame(this.game.gameConfig)
    })

    ui.elements.clipboard.addEventListener('click', () => {
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
}
