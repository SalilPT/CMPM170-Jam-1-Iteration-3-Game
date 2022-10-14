title = "Name of Game";

description = `
[Tap] Wipe
[Hold] Wipe faster
`;

characters = [
  `
  l l 
l ll  
 llll
  llll
 lllll
l ll
  `, // big splatter
  `
  l   
  ll l
 llll
  lll
    ll
 l
  `, // med splatter
  `
   l
  ll
  ll
 l   l
  ` // smol splatter

]; // TODO: Make sprites for dirt spots

// Game constants
const G = {
  WIDTH: 120,
  HEIGHT: 120,
  // Events for classes to use
  TIMER_FINISHED_EVENT: new Event("timerFinished"),
  sound: 34
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  isPlayingBgm: true
};

class WindowToClean {
  constructor() {
    /*
    Constants
    */
    this.COLOR = "light_black";
    this.LINE_THICKNESS = 3;
    // Each side will have a uniquely-colored bar drawn underneath it for collision checking
    this.SIDES_TO_COLLSION_COLORS = {
      "top": "light_blue",
      "right": "light_cyan",
      "bottom": "light_green",
      "left": "light_purple"
    };

    /*
    Mutable Properties
    */
    this.centerX;
    this.centerY;
    this.width;
    this.height;
  }

  // TODO: Fill this in
  // Generates dirt spots
  // Only called during level transitions
  generateDirtSpots() {

  }

  // Returns an array of 2 vectors representing the side bounds
  getSideBounds(side) {
    let halfWidth = this.width / 2;
    let halfHeight = this.height / 2;
    switch(side) {
      case "top":
        return [
          vec(this.centerX - halfWidth, this.centerY - halfHeight),
          vec(this.centerX + halfWidth, this.centerY - halfHeight)
        ];
      case "right":
        return [
          vec(this.centerX + halfWidth, this.centerY - halfHeight),
          vec(this.centerX + halfWidth, this.centerY + halfHeight)
        ];
      case "bottom":
        return [
          vec(this.centerX + halfWidth, this.centerY + halfHeight),
          vec(this.centerX - halfWidth, this.centerY + halfHeight)
        ];
      case "left":
        return [
          vec(this.centerX - halfWidth, this.centerY + halfHeight),
          vec(this.centerX - halfWidth, this.centerY - halfHeight)
        ];
    }
  }

  setProperties(centerX, centerY, width, height) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.width = width;
    this.height = height;
  }

  update() {
    // Draw 2 bars from center position first
    color(this.COLOR);
    bar(this.centerX, this.centerY, this.width, this.LINE_THICKNESS, 0);
    bar(this.centerX, this.centerY, this.height, this.LINE_THICKNESS, PI / 2);
    color("black");

    // Draw sides
    // Note: I don't like using a switch case here, but I don't feel like making a loop body that's hard to understand either
    for (const [side, c] of Object.entries(this.SIDES_TO_COLLSION_COLORS)) {
      color(c);
      switch (side) {
        case "top":
          bar(this.centerX, this.centerY - this.height / 2, this.width, this.LINE_THICKNESS, 0);
          color(this.COLOR);
          bar(this.centerX, this.centerY - this.height / 2, this.width, this.LINE_THICKNESS, 0);
          break;
        case "right":
          bar(this.centerX + this.width / 2, this.centerY, this.height, this.LINE_THICKNESS, PI / 2);
          color(this.COLOR);
          bar(this.centerX + this.width / 2, this.centerY, this.height, this.LINE_THICKNESS, PI / 2);
          break;
        case "bottom":
          bar(this.centerX, this.centerY + this.height / 2, this.width, this.LINE_THICKNESS, 0);
          color(this.COLOR);
          bar(this.centerX, this.centerY + this.height / 2, this.width, this.LINE_THICKNESS, 0);
          break;
        case "left":
          bar(this.centerX - this.width / 2, this.centerY, this.height, this.LINE_THICKNESS, PI / 2);
          color(this.COLOR);
          bar(this.centerX - this.width / 2, this.centerY, this.height, this.LINE_THICKNESS, PI / 2);
          break;
      }
    }
    color("black");
  }
}

class Squeegee {
  constructor() {
    /*
    Constants
    */
    this.DEFAULT_SIDE = "left";
    this.DEFAULT_SPEED = 1;

    /*
    Mutable Properties
    */
    this.x;
    this.y;

    this.movVector; // Movement vector
    this.oscPt1; // Oscillation point 1
    this.oscPt2; // Oscillation point 2
  }

  resetProperties() {
    [this.oscPt1, this.oscPt2] = windowToClean.getSideBounds(this.DEFAULT_SIDE);
    // Flip order of y coordinate subtraction here because y value is 0 at top of screen
    this.movVector = vec(Math.sign(this.oscPt2.x - this.oscPt1.x), Math.sign(this.oscPt1.y - this.oscPt2.y)).mul(this.DEFAULT_SPEED);
  }

  // TODO: Implement this
  update() {

  }
}

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

// Class for a single object that will be used to control level flow
// Heavily based off of SalilPT/CMPM170-Jam-1-Iteration-2-Game
class LevelManager {
  constructor() {
    this.currLevel;

    this.inLevelTransition;
    this.showCleanText;
  }

  // Return a vector for the position the given single line of non-scaled text would need to be drawn to be centered
  getCenteredTextLineCoords(text) {
    let textX = 3 + (G.WIDTH - text.length * 6)/2;
    let textY = G.HEIGHT / 2 - 3;
    return vec(textX, textY);
  }

  playLevelTransitionSequence() {
    this.inLevelTransition = true;
    this.currLevel++;

    squeegee.resetProperties();
    // Set a random size for the next window
    windowToClean.setProperties(G.WIDTH / 2, G.HEIGHT / 2, 40 + rndi(51), 40 + rndi(51));

    let transitionPhase1Callback = () => {
      this.inLevelTransition = false;

      removeEventListener("timerFinished", transitionPhase1Callback);
    }

    timer.startCountdown(1.5);
    addEventListener("timerFinished", transitionPhase1Callback);
  }

  showCleanTextThenTransition() {
    this.showCleanText = true;

    let cleanTextFinishedCallback = () => {
      this.showCleanText = false;
      this.playLevelTransitionSequence();

      removeEventListener("timerFinished", cleanTextFinishedCallback);
    }

    timer.startCountdown(1);
    addEventListener("timerFinished", cleanTextFinishedCallback);
  }

  resetProperties() {
    this.currLevel = 0;
    this.inLevelTransition = false;
    this.showCleanText = false;
  }

  update() {
    if (this.inLevelTransition) {
      let levelText = "Level " + this.currLevel;
      text(levelText, this.getCenteredTextLineCoords(levelText));
    }
    else if (this.showCleanText) {
      text("Clean!", this.getCenteredTextLineCoords("Clean!"), {color: "blue"});
    }
  }
}

let windowToClean = new WindowToClean();
let squeegee = new Squeegee();
let timer = new CountdownTimer();
let levelMgr = new LevelManager();

function update() {
  if (!ticks) {
    windowToClean.setProperties(G.WIDTH/2, G.HEIGHT/2, 60, 60);
    squeegee.resetProperties();
    timer.resetProperties();
    levelMgr.resetProperties();

    levelMgr.playLevelTransitionSequence();
  }

  if (!levelMgr.inLevelTransition) {
    windowToClean.update();
    squeegee.update();
  }
  timer.update();
  levelMgr.update();
}

addEventListener("load", onLoad);