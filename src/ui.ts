class UI {
  elements: Elements
  _display: { [key: string]: string }

  constructor() {
    this.elements = {
      canvasWrapper: getElement('canvas-wrapper'),
      canvas: getElement('canvas') as HTMLCanvasElement,
      newGameMenu: getElement('new-game-menu'),
      finishGameMenu: getElement('finish-game-menu'),
      finishGameCode: getElement('finish-game-code'),
      newButton1: getElement('new1'),
      showButton: getElement('show'),
      header: getElement('header'),
    }
    this._display = {}
  }

  show(key: keyof Elements) {
    console.log('hsow', this._display)

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
