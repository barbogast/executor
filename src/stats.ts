function getCurrentTimestamp() {
  return new Date().getTime()
}

type Interval = { duration: number; number: string }
type GameStats = {
  gameConfig: GameConfig
  intervals: Interval[]
  stats: {
    start: number
    end: number
    clicks: number
    correctClicks: number
  }
}

type LocalStorage = {
  games: {
    [key in GameType]: GameStats[]
  }
}

// https://stackoverflow.com/a/45309555
function median(values: number[]) {
  if (values.length === 0) return 0

  values = [...values].sort(function (a, b) {
    return a - b
  })

  const half = Math.floor(values.length / 2)

  if (values.length % 2) return values[half]

  return (values[half - 1] + values[half]) / 2.0
}

class Stats {
  start: number
  end: number
  startCurrent: number
  clicks: number
  correctClicks: number
  intervals: Interval[]
  gameConfig: GameConfig

  constructor(gameConfig: GameConfig) {
    const now = getCurrentTimestamp()
    this.start = now
    this.end = now
    this.startCurrent = now
    this.clicks = 0
    this.correctClicks = 0
    this.intervals = []
    this.gameConfig = gameConfig
  }

  static statsToCsv() {
    const columns = [
      'gameConfig.gameType',
      'gameConfig.difficulty',
      'stats.start',
      'stats.end',
      'stats.clicks',
      'stats.correctClicks',
      'intervals.average',
      'intervals.median',
      'intervals.min',
      'intervals.max',
    ]
    const s = localStorage.getItem('stats')
    if (!s) {
      return ''
    }

    const stats = JSON.parse(s) as LocalStorage
    let output = columns.map((s) => s.split('.')[1]).join(';') + '\n'
    for (const [gameType, games] of Object.entries(stats.games)) {
      for (const game of games) {
        for (const col of columns) {
          const [obj, prop] = col.split('.')

          let value
          if (obj === 'intervals') {
            if (prop === 'average') {
              value = (
                game.intervals.reduce((a, b) => a + b.duration, 0) /
                game.intervals.length
              ).toFixed(1)
            } else if (prop === 'max') {
              value = Math.max(...game.intervals.map((i) => i.duration))
            } else if (prop === 'min') {
              value = Math.min(...game.intervals.map((i) => i.duration))
            } else if (prop === 'median') {
              value = median(game.intervals.map((i) => i.duration))
            }
          } else {
            // @ts-ignore
            value = game[obj][prop]
          }

          output += value + ';'
        }
        output += '\n'
      }
    }

    return output.trim()
  }

  click() {
    this.clicks += 1
  }

  foundNumber(number: string) {
    this.correctClicks += 1
    const now = getCurrentTimestamp()
    this.intervals.push({ number, duration: now - this.startCurrent })
    this.startCurrent = now
  }

  store() {
    const s = localStorage.getItem('stats')
    const currentStats: LocalStorage = s ? JSON.parse(s) : { games: {} }
    const gameType = this.gameConfig.gameType
    if (!currentStats.games[gameType]) {
      currentStats.games[gameType] = []
    }

    const newEntry: GameStats = {
      gameConfig: this.gameConfig,
      stats: {
        start: this.start,
        end: this.end,
        clicks: this.clicks,
        correctClicks: this.correctClicks,
      },
      intervals: this.intervals,
    }

    currentStats.games[gameType || 'unkownType'].push(newEntry)
    localStorage.setItem('stats', JSON.stringify(currentStats))
  }

  finish(store: boolean) {
    this.end = getCurrentTimestamp()
    if (store) {
      this.store()
    }
  }

  print() {
    let res = ''

    res += `
Misclicks: ${this.clicks - this.correctClicks}
Numbers cleared: ${this.correctClicks}
Total duraction: ${((this!.end - this.start) / 1000).toFixed(1)} sec

`

    for (const int of this.intervals) {
      res += `${int.number}: ${(int.duration / 1000).toFixed(1)} sec\n`
    }

    const opts = {
      height: 6,
      format: function (x: number, i: number) {
        return (x / 1000).toFixed(2)
      },
    }

    return res
  }
}
