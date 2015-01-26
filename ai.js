'use strict';

/**
 * Browserify this whole thing.
 * Only trouble is providing it with updated values (or how values update)
 */

function AI (consts) {
  // May not be the best way
  this.consts = consts;

  this.x = Math.random() * consts.width | 0;
  this.y = Math.random() * consts.height | 0;

  this.dx = 0;
  this.dy = 0;

  this.angle = 0;

  this.turnSpeed = 0.001;

  this.thrust = 0.1;
  this.name = 'AI #' + Math.random();
}

var counter = 0;
function onceEvery() {
  if (counter < 30) {
    return counter++;
  }
  counter = 0;
  console.log.apply(console, arguments);
}

var toAngle /*converts x/y line into degree from point*/
= function (x, y, xx, yy) {
    if (xx < x && yy >= y) {
        return (Math.atan(Math.abs(yy - y) / Math.abs(xx - x))) + 4.7123889804
    } //bottom left quadrant
    if (yy < y && xx >= x) {
        return (Math.atan(Math.abs(yy - y) / Math.abs(xx - x))) + 1.5707963268
    } //top right quadrant
    else if (yy < y && xx < x) {
        return (Math.atan(Math.abs(xx - x) / Math.abs(yy - y))) + 3.1415926536
    } //top left quadrant
    else {
        return (Math.atan(Math.abs(xx - x) / Math.abs(yy - y)))
    } //bottom right quadrant
}

AI.prototype.update = function(players) {
  if (this.exploded) { return; }
  // Math stuff to determine direction
  var radians = (this.angle ) / Math.PI * 180;

  // http://stackoverflow.com/a/1571429/1216976
  if (!players['a']) { return; }
  var player = players['a'];
  if ((this.angle * (180/Math.PI)) < toAngle(player.x, player.y, this.x, this.y)) {
    this.angle += this.turnSpeed;
  } else {
    this.angle -= this.turnSpeed;
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
    name: this.name
  };
};

module.exports = AI;