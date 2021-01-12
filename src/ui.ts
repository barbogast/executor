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
  back: HTMLElement
  customGame: HTMLElement
  startCustomGame: HTMLElement
  loadExistingConfig: HTMLSelectElement
}

type Screens = {
  newGame: HTMLElement
  finishGame: HTMLElement
  game: HTMLElement
  customGame: HTMLElement
}

function getElementByClass(className: string) {
  const el = document.getElementsByClassName(className)[0]
  if (!el) {
    throw new Error(`.${className} not found`)
  }
  return el as HTMLElement
}

function getElementByName(name: string) {
  const el = document.getElementsByName(name)[0] as HTMLInputElement | void
  if (!el) {
    throw new Error(`Element with name "${name} not found`)
  }
  return el
}

class UI {
  elements: Elements
  screens: Screens
  _display: { [key: string]: string }

  constructor() {
    this.elements = {
      canvasWrapper: getElementByClass('canvas-wrapper'),
      canvas: getElementByClass('canvas') as HTMLCanvasElement,
      finishGameCode: getElementByClass('finish-game-code'),
      showButton: getElementByClass('show'),
      abort: getElementByClass('abort'),
      lives: getElementByClass('lives') as HTMLElement,
      livesValue: getElementByClass('lives-value') as HTMLElement,
      newGame: getElementByClass('new-game') as HTMLElement,
      store: getElementByClass('store') as HTMLInputElement,
      clipboard: getElementByClass('clipboard') as HTMLElement,
      startGameContainer: getElementByClass(
        'start-game-container',
      ) as HTMLElement,
      back: getElementByClass('back') as HTMLElement,
      customGame: getElementByClass('custom-game') as HTMLElement,
      startCustomGame: getElementByClass('start-custom-game') as HTMLElement,
      loadExistingConfig: getElementByClass(
        'load-existing-config',
      ) as HTMLSelectElement,
    }

    this.screens = {
      newGame: getElementByClass('new-game-screen'),
      finishGame: getElementByClass('finish-game-screen'),
      game: getElementByClass('game-screen'),
      customGame: getElementByClass('custom-game-screen') as HTMLElement,
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

  readInput(name: string): string {
    const el = getElementByName(name)
    return el.value
  }

  writeInput(name: string, value: string | number | void) {
    const el = getElementByName(name)
    el.value = String(value !== undefined ? value : '')
  }

  readCheckbox(name: string): boolean {
    const el = getElementByName(name)
    return el.checked
  }

  writeCheckbox(name: string, value: boolean | void) {
    const el = getElementByName(name)
    el.checked = value || false
  }
}

const ui = new UI()
