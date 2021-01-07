function getCurrentTimestamp() {
  return new Date().getTime()
}

class Stats {
  start: number
  end: number
  startCurrent: number
  clicks: number
  correctClicks: number
  intervals: { number: string; duration: number }[]
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
    const columns = ['start', 'end', 'clicks', 'correctClicks']
    const s = localStorage.getItem('stats')
    if (!s) {
      return ''
    }

    const stats = JSON.parse(s)
    let output = ''
    for (const [gameType, games] of Object.entries(stats.games)) {
      for (const game of games as Array<{ stats: { [key: string]: string } }>) {
        for (const col of columns) {
          output += game.stats[col] + ';'
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
    const currentStats = s ? JSON.parse(s) : { games: {} }
    const gameType = this.gameConfig.gameType
    if (!currentStats.games[gameType]) {
      currentStats.games[gameType] = []
    }

    currentStats.games[gameType || 'unkownType'].push({
      gameConfig: this.gameConfig,
      stats: {
        start: this.start,
        end: this.end,
        clicks: this.clicks,
        correctClicks: this.correctClicks,
      },
      intervals: this.intervals,
    })
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
