'use strict';

/**
 * Browserify this whole thing.
 * Only trouble is providing it with updated values (or how values update)
 */

function AI (x, y, consts) {
  // May not be the best way
  this.consts = consts;

  this.x = x;
  this.y = y;

  this.dx = 0;
  this.dy = 0;

  this.angle = 0;

  this.turnSpeed = 0.001;

  this.thrust = 0.1;
}

var counter = 0;
function onceEvery() {
  if (counter < 30) {
    return counter++;
  }
  counter = 0;
  console.log.apply(console, arguments);
}

AI.prototype.update = function(players) {
  if (this.exploded) { return; }
  // Math stuff to determine direction
  var radians = (this.angle ) / Math.PI * 180;

  // http://stackoverflow.com/a/1571429/1216976
  // var m =
  if (!players['a']) { return; }
  var player = players['a'];
  var currentAngle = Math.atan2(this.dy, this.dx);
  var desiredAngle = Math.atan2(this.y - player.y, this.x - player.x);

  var copyWants = (desiredAngle - currentAngle) % (2 * Math.PI);

  if (copyWants < 0) {
    copyWants += 2 * Math.PI;
  }

  onceEvery(currentAngle, desiredAngle, copyWants);

  if (!(copyWants + 0.14 >= Math.PI && copyWants - 0.14 <= Math.PI)) {
    if (copyWants < Math.PI) {
      this.angle += this.turnSpeed;
    } else {
      this.angle -= this.turnSpeed;
    }
  }


  // FULL SPEED AHEAD
  this.dx -= Math.sin(radians) * this.thrust;
  this.dy -= Math.cos(radians) * this.thrust;
  this.x += this.dx;
  this.y += this.dy;

  if (this.x < 0) {
    this.x = 0;
    this.dx = -this.dx;
  }
  if (this.x > this.consts.x) {
    this.x = this.consts.x;
    this.dx = -this.dx;
  }

  if (this.y < 0) {
    this.y = 0;
    this.dy = -this.dy;
  }
  if (this.y > this.consts.y) {
    this.y = this.consts.y;
    this.dy = -this.dy;
  }

  // There's totally friction in space.
  this.dx *= 0.99;
  this.dy *= 0.99;

};

AI.prototype.getData = function() {
  return {
    x: this.x,
    y: this.y,
    dx: this.dx,
    dy: this.dy,
    angle: this.angle,
    name: 'ai'
  };
};

module.exports = AI;