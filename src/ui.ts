type Elements = {
  canvasWrapper: HTMLElement
  canvas: HTMLCanvasElement
  finishGameCode: HTMLElement
  showButton: HTMLElement
  abort: HTMLElement
  lives: HTMLElement
  livesValue: HTMLElement
  newGame: HTMLElement
  store: HTMLInputElement
  clipboard: HTMLElement
  startGameContainer: HTMLElement
}

type Screens = {
  newGame: HTMLElement
  finishGame: HTMLElement
  game: HTMLElement
}

function getElement(className: string) {
  const el = document.getElementsByClassName(className)[0]
  if (!el) {
    throw new Error(`.${className} not found`)
  }
  return el as HTMLElement
}

class UI {
  elements: Elements
  screens: Screens
  _display: { [key: string]: string }

  constructor() {
    this.elements = {
      canvasWrapper: getElement('canvas-wrapper'),
      canvas: getElement('canvas') as HTMLCanvasElement,
      finishGameCode: getElement('finish-game-code'),
      showButton: getElement('show'),
      abort: getElement('abort'),
      lives: getElement('lives') as HTMLElement,
      livesValue: getElement('lives-value') as HTMLElement,
      newGame: getElement('new-game') as HTMLElement,
      store: getElement('store') as HTMLInputElement,
      clipboard: getElement('clipboard') as HTMLElement,
      startGameContainer: getElement('start-game-container') as HTMLElement,
    }

    this.screens = {
      newGame: getElement('new-game-screen'),
      finishGame: getElement('finish-game-screen'),
      game: getElement('game-screen'),
    }

    this._display = {}
  }

  setScreen(screenName: keyof Screens) {
    Object.entries(this.screens).forEach(([name, el]) => {
      el.style.display = name === screenName ? 'Flex' : 'none'
    })
  }

  show(key: keyof Elements) {
    this.elements[key].style.display = this._display[key] || 'block'
  }

  hide(key: keyof Elements) {
    this._display[key] = window.getComputedStyle(
      this.elements[key],
      null,
    ).display
    this.elements[key].style.display = 'none'
  }
}

const ui = new UI()
