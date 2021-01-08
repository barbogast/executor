class AudioFiles {
  knock: HTMLAudioElement

  constructor() {
    this.knock = new Audio('knock.mp3') // https://freesound.org/people/deleted_user_877451/sounds/66113/
  }

  playKnock() {
    this.knock.play()
  }
}

const audioFiles = new AudioFiles()
