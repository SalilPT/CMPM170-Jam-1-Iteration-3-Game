title = "Right Wipe";

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
];

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

    this.DIRT_SPRITE_POINTS = {
      "a": 2,
      "b": 2,
      "c": 3
    };

    /*
    Mutable Properties
    */
    this.centerX;
    this.centerY;
    this.width;
    this.height;
    this.dirtArray;
  }

  // Generates the specified number of dirt spots
  // Only called during level transitions
  generateDirtSpots(numSpots) {
    this.dirtArray = [];
    let minDistFromSide = 6;

    let leftXBound = this.centerX - (this.width / 2) + minDistFromSide;
    let rightXBound = this.centerX + (this.width / 2) - minDistFromSide;
    let topYBound = this.centerY - (this.height / 2) + minDistFromSide;
    let bottomYBound = this.centerY + (this.height / 2) - minDistFromSide;
    for (let i = 0; i < numSpots; i++) {
      let xCoord = rndi(leftXBound, rightXBound);
      let yCoord = rndi(topYBound, bottomYBound);
      let randomSprite = Object.keys(this.DIRT_SPRITE_POINTS)[rndi(Object.keys(this.DIRT_SPRITE_POINTS).length)];

      this.dirtArray.push({
        x: xCoord,
        y: yCoord,
        sprite: randomSprite
      });
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

  // Called by squeegee
  updateDirtSpots() {
    // Draw dirt
    let dirtToRemove = [];
    color("black");
    for (let dirt of this.dirtArray) {
      let dirtCollision = char(dirt.sprite, dirt.x, dirt.y);
      if (dirtCollision.isColliding.rect[squeegee.WIPER_COLOR]) {
        dirtToRemove.push(dirt);
        addScore(this.DIRT_SPRITE_POINTS[dirt.sprite], dirt.x, dirt.y);
        play("coin");
      }
    }
    // Clean up any dirt that collided with the squeegee
    remove(this.dirtArray, (d) => {return dirtToRemove.includes(d);});
  }
}

class Squeegee {
  constructor() {
    /*
    Constants
    */
    this.DEFAULT_SIDE = "left";
    this.DEFAULT_SPEED = 1;
    this.DEFAULT_WIPE_SPEED = 0.75;

    this.MIDDLE_COLLISION_COLOR = "blue";
    this.WIPER_COLOR = "blue";
    this.HANDLE_COLOR = "black";
    this.WIPER_LENGTH = 10;
    this.WIPER_THICKNESS = 3;
    this.HANDLE_LENGTH = 6;
    this.HANDLE_THICKNESS = 2;

    this.SIDES_TO_WIPE_VECTORS = {
      "top": vec(0, 1),
      "right": vec(-1, 0),
      "bottom": vec(0, -1),
      "left": vec(1, 0)
    };

    /*
    Mutable Properties
    */
    this.x;
    this.y;

    this.movVector; // Movement vector
    this.oscPt1; // Oscillation point 1
    this.oscPt2; // Oscillation point 2

    this.currentSide;
    this.isWiping;
    this.wipeSpeed;
    this.sideAtStartOfWipe;
  }

  getSpeedForCurrentLevel() {
    return this.DEFAULT_SPEED + Math.min(levelMgr.currLevel / 100, 1);
  }

  resetProperties() {
    [this.oscPt1, this.oscPt2] = windowToClean.getSideBounds(this.DEFAULT_SIDE);
    // Flip order of y coordinate subtraction here because y value is 0 at top of screen
    this.movVector = vec(Math.sign(this.oscPt2.x - this.oscPt1.x), Math.sign(this.oscPt1.y - this.oscPt2.y)).mul(this.getSpeedForCurrentLevel());
    this.x = abs(this.oscPt1.x + this.oscPt2.x) / 2;
    this.y = abs(this.oscPt1.y + this.oscPt2.y) / 2;

    this.currentSide = this.DEFAULT_SIDE;
    this.isWiping = false;
    this.wipeSpeed = this.DEFAULT_WIPE_SPEED;
    this.sideAtStartOfWipe = this.DEFAULT_SIDE;
  }

  update() {
    // Update movement vector
    if (this.isWiping && input.isPressed) {
      this.movVector.addWithAngle(this.movVector.angle, 0.05);
    }
    if (this.isWiping) {
      // Rotate the squeegee clockwise
      this.movVector.rotate(PI / 180);
    }
    if (!this.isWiping && input.isJustPressed) {
      this.isWiping = true;
      let tempVec = vec(this.SIDES_TO_WIPE_VECTORS[this.currentSide].x, this.SIDES_TO_WIPE_VECTORS[this.currentSide].y);
      this.movVector = tempVec.mul(this.wipeSpeed);
    }

    // Update x position
    this.x += clamp(this.movVector.x, -windowToClean.width, windowToClean.width);
    let rightBound = windowToClean.centerX + windowToClean.width / 2;
    let leftBound = windowToClean.centerX - windowToClean.width / 2;
    if (this.x >= rightBound) {
      this.movVector.x *= -1;
      this.x -= 2 * (this.x - rightBound);
    }
    else if (this.x <= leftBound) {
      this.movVector.x *= -1;
      this.x += 2 * (leftBound - this.x);
    }

    // Update y position
    this.y += clamp(this.movVector.y, -windowToClean.height, windowToClean.height);
    let bottomBound = windowToClean.centerY + windowToClean.height / 2;
    let topBound = windowToClean.centerY - windowToClean.height / 2;
    if (this.y >= bottomBound) {
      this.movVector.y *= -1;
      this.y -= 2 * (this.y - bottomBound);
    }
    else if (this.y <= topBound) {
      this.movVector.y *= -1;
      this.y += 2 * (topBound - this.y);
    }

    // Drawing
    color(this.MIDDLE_COLLISION_COLOR);
    let squeegeeMiddleCollision = bar(this.x, this.y, 1, 1);
    color(this.HANDLE_COLOR);
    let wiperCollision;
    if (!this.isWiping) {
      let tempVec = vec(this.SIDES_TO_WIPE_VECTORS[this.currentSide].x, this.SIDES_TO_WIPE_VECTORS[this.currentSide].y);
      bar(this.x, this.y, this.HANDLE_LENGTH, this.HANDLE_THICKNESS, tempVec.mul(-1).angle, 0);
      color(this.WIPER_COLOR);
      wiperCollision = bar(this.x, this.y, this.WIPER_LENGTH, this.WIPER_THICKNESS, this.movVector.angle);
    }
    else {
      bar(this.x, this.y, this.HANDLE_LENGTH, this.HANDLE_THICKNESS, this.movVector.angle, 1);
      color(this.WIPER_COLOR);
      wiperCollision = bar(this.x, this.y, this.WIPER_LENGTH, this.WIPER_THICKNESS, this.movVector.angle + PI / 2);
    }

    windowToClean.updateDirtSpots();

    // Check if this collided with a side
    if (this.isWiping) {
      for (let [side, c] of Object.entries(windowToClean.SIDES_TO_COLLSION_COLORS)) {
        if (side != this.sideAtStartOfWipe && squeegeeMiddleCollision.isColliding.rect[c]) {
          let [sideBound1, sideBound2] = windowToClean.getSideBounds(side);

          // Snap squeegee to side
          if (sideBound1.x == sideBound2.x) {
            this.x = sideBound1.x;
          }
          else {
            this.y = sideBound1.y;
          }

          this.movVector = vec(Math.sign(sideBound1.x - sideBound2.x), Math.sign(sideBound1.y - sideBound2.y)).mul(this.getSpeedForCurrentLevel());
          this.currentSide = side;
          this.isWiping = false;
          this.wipeSpeed = this.DEFAULT_WIPE_SPEED;
          this.sideAtStartOfWipe = side;
          break;
        }
      }
    }
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

  stop() {
    this.countdownInProgress = false;
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
      text("Time: " + secondsRemaining, this.UI_TEXT_X_COORD, this.UI_TEXT_Y_COORD);
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
    this.gameEnd;

    this.timeUpCallback = () => {
      removeEventListener("timerFinished", this.timeUpCallback);
      play("explosion");
      end("Time up! GAME OVER");
      // Putting this here will hopefully fix a bug caused by cleaning off the last piece of dirt on the same tick that the timer finishes
      this.gameEnd = true;
    }
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

    // Set a random size for the next window
    // Note: rndi() never rolls the high integer passed to it
    let randomSideLengthLowerBound = Math.min(floor(this.currLevel / 5), 24); // Maxes out at level 125
    windowToClean.setProperties(G.WIDTH / 2, G.HEIGHT / 2, 50 + 2 * rndi(randomSideLengthLowerBound, 26), 50 + 2 * rndi(randomSideLengthLowerBound, 26)); // Guaranteed that dimensions will only be even numbers

    squeegee.resetProperties();

    windowToClean.generateDirtSpots(Math.min(floor(4 + 3 * sqrt(this.currLevel)), 75));

    let transitionPhase1Callback = () => {
      this.inLevelTransition = false;

      // Set up timer for next level
      timer.startCountdown(8 * pow(2, -0.075 * (this.currLevel + 6)) + 11, true); // Approaches 11 seconds, but doesn't go lower
      addEventListener("timerFinished", this.timeUpCallback);

      removeEventListener("timerFinished", transitionPhase1Callback);
    }

    timer.startCountdown(1.5);
    addEventListener("timerFinished", transitionPhase1Callback);
  }

  showCleanTextThenTransition() {
    this.showCleanText = true;
    removeEventListener("timerFinished", this.timeUpCallback);

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
    this.gameEnd = false;
  }

  update() {
    // Hopefully prevent bug that occurs when the cleaning last dirt spot on the same tick that the level timer ends
    if (this.gameEnd) {
      return;
    }

    if (this.inLevelTransition) {
      let levelText = "Level " + this.currLevel;
      text(levelText, this.getCenteredTextLineCoords(levelText));
    }
    else if (this.showCleanText) {
      text("Clean!", this.getCenteredTextLineCoords("Clean!"), {color: "blue"});
    }
    else if (windowToClean.dirtArray.length == 0) {
      timer.stop();
      this.showCleanTextThenTransition();
      play("powerup");
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