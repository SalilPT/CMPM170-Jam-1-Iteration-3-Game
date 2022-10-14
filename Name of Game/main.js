title = "Name of Game";

description = `
[Tap] Wipe
[Hold] Wipe faster
`;

characters = [
`
 ll
 lllll
 lllllll
 llll
lllll
`,`
  ll
 ll
lll
lllll
llll
ll
`,`
ll
 lll

ll
 lllll
ll
`,`
lllllllll
`
]; // TODO: Make sprites for dirt spots

const dirt_sprites = ["a", "b", "c"];

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

    let spots = Math.floor(Math.random() * (5 - 1) + 1);
    for (let i = 0; i < spots; i++) {
      let x = Math.floor(Math.random() * (85 - 34) + 34);
      let y = Math.floor(Math.random() * (85 - 34) + 34);
      let sprite = Math.floor(Math.random() * 3)
      char(dirt_sprites[sprite], x, y);
    }

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
    bar(this.centerX, this.centerY, this.width, this.LINE_THICKNESS, PI/2);
    bar(this.centerX, this.centerY, this.height, this.LINE_THICKNESS, 0);
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
    this.generateDirtSpots();
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

    this.pos = vec(34, 25);
    this.speed = 1;
    this.direction = 1;
  }

  resetProperties() {
    [this.oscPt1, this.oscPt2] = windowToClean.getSideBounds(this.DEFAULT_SIDE);
    // Flip order of y coordinate subtraction here because y value is 0 at top of screen
    this.movVector = vec(Math.sign(this.oscPt2.x - this.oscPt1.x), Math.sign(this.oscPt1.y - this.oscPt2.y)).mul(this.DEFAULT_SPEED);
  }

  // TODO: Implement this
  update() {

    if (input.isJustPressed || (this.pos.x < 34 && this.direction < 0) || (this.pos.x > 90 && this.direction > 0) ) {
        this.direction *= -1;
    }

    this.pos.x += this.direction * sqrt(difficulty);
    color("blue");
    char("d", this.pos);

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

let windowToClean = new WindowToClean();
let squeegee = new Squeegee();
let timer = new CountdownTimer();

function update() {
  if (!ticks) {
    windowToClean.setProperties(G.WIDTH/2, G.HEIGHT/2, 60, 60);
    squeegee.resetProperties();
    timer.resetProperties();
  }

  windowToClean.update();
  squeegee.update();
  timer.update();
}

addEventListener("load", onLoad);