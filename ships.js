function Player() {
  this.x = Math.random() * width | 0;
  this.y = Math.random() * height| 0;

  // Image h/w
  this.h = this.w = 36;

  this.dx = 0;
  this.dy = 0;

  this.turnSpeed = 0.001;
  this.thrust = 0.1;
  this.angle = 0;
  this.exploded = false;

  this.name = name;

  this.img = new Image();
  this.img.src = 'http://retroships.com/generate.png?&size=3&cB=300&seed=' + name;
}

inherits(Player, CanvasItem);

Player.prototype.update = function () {
  if (keys[32]) {
    if (thisPlayer.exploded) {
      thisPlayer.reset();
    } else {
      thisPlayer.fire();
    }
  }
  if (keys[90]) {
    thisPlayer.explode();
  }
  // Turns
  if (keys[39]) {
    this.angle += this.turnSpeed * -1;
  }

  if (keys[37]) {
    this.angle += this.turnSpeed * 1;
  }

  // Math stuff to determine direction
  var radians = this.angle / Math.PI * 180;

  // Adjust speeds for player input
  if (keys[38]) {
    this.dx -= Math.sin(radians) * this.thrust;
    this.dy -= Math.cos(radians) * this.thrust;
  }
  if (keys[40]) {
    this.dx += Math.sin(radians) * this.thrust;
    this.dy += Math.cos(radians) * this.thrust;
  }
  // Actually make changes
  this.x += this.dx;
  this.y += this.dy;

  // Check for wraparound
  if (this.x < 0) {
    this.x = width;
  } else if (this.x > width) {
    this.x = 0;
  }
  if (this.y < 0) {
    this.y = height;
  } else if (this.y > height) {
    this.y = 0;
  }

  // There's totally friction in space.
  this.dx *= 0.98;
  this.dy *= 0.98;
};
Player.prototype.destroyed = function () {
  return this.exploded;
};
Player.prototype.explode = function () {
  if (!this.exploded) {
    this.exploded = true;
    socket.emit('exploded', {name: name});
    boom(this.x, this.y, this.dx, this.dy);
  }
};
Player.prototype.fire = function () {
  var radians = (this.angle + 0.055) * (180/Math.PI);

  var xx = this.x + (this.w/2 * Math.cos(-(this.angle + 0.0275) * (180/Math.PI)));
  var yy = this.y + (this.w/2 * Math.sin(-(this.angle + 0.0275) * (180/Math.PI)));

  var r = this.w/2;
  playerBullets.create({
    x: xx,
    y: yy,
    dx: Math.sin(radians) * 10,
    dy: Math.cos(radians) * 10,
    c: 'rgba(0,24,234,1)',
    r: 7,
    decay: 0.06
  });
}

function FBPlayer (params) {
  this.x = params.x;
  this.y = params.y;
  this.angle = params.angle;

  this.name = params.name;

  this.h = this.w = 36;

  this.connected = true;
  this.exploded = !!params.exploded;

  this.img = new Image();
  this.img.src = 'http://retroships.com/generate.png?&size=3&seed=' + this.name;

  this.lastUpdated = new Date();
};

inherits(FBPlayer, CanvasItem);

FBPlayer.prototype.update = function () {
  if (playerBullets.colliding(this.x, this.y)) {
    socket.emit('exploded', {name: this.name});
  }
  if (this.firing && !this.exploded) {
    this.fire();
  }
};
FBPlayer.prototype.destroyed = function () {
  return !this.connected
};


FBPlayer.prototype.render = Player.prototype.render = function () {
  context.fillStyle = 'white';
  context.font = '12px Arial';
  var w = context.measureText(this.name).width;
  context.fillText(this.name, this.x - (w/2), this.y + this.h);
  if (this.exploded) { return; }
  context.save();
  context.translate(this.x, this.y);
  context.rotate(-(this.angle + 0.055) * (180/Math.PI));
  context.drawImage(this.img, -this.w/2, -this.h/2);
  context.restore();
};
FBPlayer.prototype.reset = Player.prototype.reset = function (params) {
  if (!this.exploded) { return; }
  // Crummy workaround
  if (!params) {
    // We're a player
    socket.emit('reset', {name: name});
  }
  this.constructor(params);
};
FBPlayer.prototype.fire = function () {
  var radians = (this.angle + 0.055) * (180/Math.PI);

  var xx = this.x + (this.w/2 * Math.cos(-(this.angle + 0.0275) * (180/Math.PI)));
  var yy = this.y + (this.w/2 * Math.sin(-(this.angle + 0.0275) * (180/Math.PI)));

  var r = this.w/2;
  particles.create({
    x: xx,
    y: yy,
    dx: Math.sin(radians) * 10,
    dy: Math.cos(radians) * 10,
    c: 'rgba(287,3,24,1)',
    r: 7,
    decay: 0.06
  });
};