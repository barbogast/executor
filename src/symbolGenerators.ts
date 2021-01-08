function getAlphabet(limit: number) {
  let a = ''
  for (let i = 9; ++i < 36; ) {
    a += i.toString(36)
  }
  return a.slice(0, limit).toUpperCase().split('')
}

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

interface SymbolGenerator {
  isLast(): boolean
  next(): string
  getColor(): string
}

type NumberAscConfig = { type: 'NumericAsc' }
class NumericAsc implements SymbolGenerator {
  _current: number
  constructor() {
    this._current = 0
  }

  isLast() {
    return false
  }

  next() {
    if (!this.isLast()) {
      this._current += 1
    }
    return String(this._current)
  }

  getColor() {
    return COLORS[this._current % 10]
  }
}

type NumericDescConfig = { type: 'NumericDesc'; start: number }
class NumericDesc implements SymbolGenerator {
  _current: number
  constructor(config: NumericDescConfig) {
    this._current = config.start + 1
  }

  isLast() {
    return this._current === 1
  }

  next() {
    if (!this.isLast()) {
      this._current -= 1
    }
    return String(this._current)
  }

  getColor() {
    return COLORS[this._current % 10]
  }
}

type AlphaAscConfig = { type: 'AlphaAsc' }
class AlphaAsc implements SymbolGenerator {
  _current: number
  constructor() {
    this._current = -1 // 0 'equals 'a'
  }

  isLast() {
    return this._current === 25
  }

  next() {
    if (!this.isLast()) {
      this._current += 1
    }
    return (this._current + 10).toString(36).toUpperCase()
  }

  getColor() {
    return COLORS[this._current % 10]
  }
}

type AlphaDescConfig = { type: 'AlphaDesc'; startLetter: string }
class AlphaDesc implements SymbolGenerator {
  _current: number
  constructor(config: AlphaDescConfig) {
    this._current = config.startLetter.toLowerCase().charCodeAt(0) - 96
  }

  isLast() {
    return this._current === 0
  }

  next() {
    if (!this.isLast()) {
      this._current -= 1
    }
    return (this._current + 10).toString(36).toUpperCase()
  }

  getColor() {
    return COLORS[this._current % 10]
  }
}

type MixAscConfig = { type: 'MixAsc' }
class MixAsc {
  _series: string[]
  _current: number
  constructor() {
    this._series = []
    const alpha = getAlphabet(36)
    alpha.forEach((letter, i) => {
      this._series.push(String(i))
      this._series.push(letter)
    })
    this._current = 0
  }

  isLast() {
    return this._current + 1 === this._series.length
  }

  next() {
    if (!this.isLast()) {
      this._current += 1
    }
    return this._series[this._current]
  }

  getColor() {
    return COLORS[this._current % 10]
  }
}

type SymbolGeneratorConfig =
  | NumberAscConfig
  | NumericDescConfig
  | AlphaAscConfig
  | AlphaDescConfig
  | MixAscConfig

function initializeSymbolGenerator(
  cfg: SymbolGeneratorConfig,
): SymbolGenerator {
  switch (cfg.type) {
    case 'NumericAsc':
      return new NumericAsc()
    case 'NumericDesc':
      return new NumericDesc(cfg)
    case 'AlphaAsc':
      return new AlphaAsc()
    case 'AlphaDesc':
      return new AlphaDesc(cfg)
    case 'MixAsc':
      return new MixAsc()
  }
}
