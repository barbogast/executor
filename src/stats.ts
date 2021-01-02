class Stats {
  start: number
  end: number
  startCurrent: number
  clicks: number
  correctClicks: number
  intervals: { number: string; duration: number }[]

  constructor() {
    const now = getCurrentTimestamp()
    this.start = now
    this.end = now
    this.startCurrent = now
    this.clicks = 0
    this.correctClicks = 0
    this.intervals = []
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

  finish() {
    this.end = getCurrentTimestamp()
  }

  print() {
    let res = ''

    res += `
  Total duraction: ${(this!.end - this.start) / 1000} sec
  Misclicks: ${this.clicks - this.correctClicks}
  
  `

    for (const int of this.intervals) {
      res += `${int.number}: ${int.duration / 1000} sec\n`
    }

    const opts = {
      height: 6,
      format: function (x: number, i: number) {
        return (x / 1000).toFixed(2)
      },
    }
    // console.log(
    //   asciichart.plot(
    //     this.intervals.map((x) => x.duration),
    //     opts,
    //   ),
    // )
    return res
  }
}
