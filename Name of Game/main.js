title = "Name of Game";

description = `
[Tap] Wipe
[Hold] Wipe faster
`;

characters = [];

// Game constants
const G = {
  WIDTH: 120,
  HEIGHT: 120,
  // Events for classes to use
  TIMER_FINISHED_EVENT: new Event("timerFinished")
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  isPlayingBgm: true
};

// CountdownTimer class copied from SalilPT/CMPM170-Jam-1-Iteration-2-Game
class CountdownTimer {
  constructor() {
    /*
    Constants
    */
    this.UI_TEXT_X_COORD = 3;
    this.UI_TEXT_Y_COORD = G.HEIGHT - 3;

    /*
    Mutable Properties
    */
    this.countdownInProgress;
    this.ticksSinceTimerStart;
    this.totalCountdownTicks; // For a countdown of 2 seconds, this would be 120.

    this.displayUIText;
  }

  resetProperties() {
    this.countdownInProgress = false;
    this.ticksSinceTimerStart = 0;
    this.totalCountdownTicks = 0;
    this.displayUIText = false;
  }

  // Takes the number of seconds for the countdown as an argument.
  // Works with non-integer values.
  // The second parameter controls whether or not to show the countdown UI text.
  startCountdown(seconds, display = false) {
    // Ticks occur every 1/60th of a second
    this.totalCountdownTicks = ceil(seconds * 60);

    this.ticksSinceTimerStart = 0;
    this.countdownInProgress = true;
    this.displayUIText = display;
  }

  update() {
    if (this.countdownInProgress) {
      this.ticksSinceTimerStart++;
    }
    if (this.countdownInProgress && (this.ticksSinceTimerStart >= this.totalCountdownTicks)) {
      this.countdownInProgress = false;
      dispatchEvent(G.TIMER_FINISHED_EVENT);
    }

    // Draw text indicating time left
    if (this.displayUIText) {
      let secondsRemaining = floor((this.totalCountdownTicks - this.ticksSinceTimerStart) / 60);
      text("T " + secondsRemaining, this.UI_TEXT_X_COORD, this.UI_TEXT_Y_COORD);
    }
  }
}

let timer = new CountdownTimer();

function update() {
  if (!ticks) {
    timer.resetProperties();
  }

  timer.update();
}

addEventListener("load", onLoad);