function Player() {
  this.x = (Math.random() * (field.x - width)| 0) + width/2;
  this.y = (Math.random() * (field.y - height)| 0) + height/2;

  this.offset = {
    x: 0,
    y: 0
  };

  // Image h/w
  this.h = this.w = 36;

  this.dx = 0;
  this.dy = 0;

  this.turnSpeed = 0.001;
  this.thrust = 0.1;
  this.angle = 0;
  this.exploded = false;
  // Fires a bullet every fireRate millis
  this.fireRate = 300;
  this.lastFire = Date.now();
  this.particleRate = 200;
  this.lastParticle = {
    time: Date.now()
  };

  this.name = name;

  this.img = new Image();
  // this.img.src = 'http://retroships.com/generate.png?&size=3&cB=300&seed=' + name;
  this.img.src = '/player.png';
}

inherits(Player, CanvasItem);

Player.prototype.update = function () {
  if (keys[32] && !thisPlayer.exploded) {
    thisPlayer.fire();
  }
  if (keys[90] && thisPlayer.exploded) {
    thisPlayer.reset();
  }
  if (keys[81]) {
    thisPlayer.explode();
  }

  if (this.exploded) { return; }

  // Turns
  if (keys[39]) {
    this.angle += -this.turnSpeed;
  }

  if (keys[37]) {
    this.angle += this.turnSpeed;
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

  this.x += this.dx;
  this.y += this.dy;

  if (this.x < 0) {
    this.x = 0;
    this.offset.x = -width/2;
    this.dx = -this.dx;
  }
  if (this.x > field.x) {
    this.x = field.x;
    this.offset.x = width/2;
    this.dx = -this.dx;
  }

  if (this.y < 0) {
    this.y = 0;
    this.offset.y = -height/2;
    this.dy = -this.dy;
  }
  if (this.y > field.y) {
    this.y = field.y;
    this.offset.y = height/2;
    this.dy = -this.dy;
  }

  // Actually make changes
  if (this.x < width/2) {
    this.offset.x += this.dx;
  } else if (this.x > field.x - width/2) {
    this.offset.x += this.dx;
  } else if (this.offset.x) {
    this.offset.x = 0;
  }

  if (this.y < height/2) {
    this.offset.y += this.dy;
  } else if (this.y > field.y - height/2) {
    this.offset.y += this.dy;
  } else if (this.offset.y) {
    this.offset.y = 0;
  }

  // There's totally friction in space.
  this.dx *= 0.98;
  this.dy *= 0.98;

  var radians = (this.angle + 0.055) * (180/Math.PI);

  var xx = this.x - (this.w/2 * Math.cos(-(this.angle + 0.0275) * (180/Math.PI)));
  var yy = this.y - (this.w/2 * Math.sin(-(this.angle + 0.0275) * (180/Math.PI)));

  var r = this.w/2;
  // Particle trails
  if (Date.now() - this.particleRate >= this.lastParticle.time &&
      (!within(this.lastParticle.x, xx, 5) ||
      !within(this.lastParticle.y, yy, 5))) {
    this.lastParticle = {
      time: Date.now(),
      x: xx,
      y: yy
    };
    particles.create({
      x: xx,
      y: yy,
      r: 5,
      c: 'rgb(130,100,0)',
      decay: 0.015
    });
  }
};
Player.prototype.destroyed = function () {
  return this.exploded;
};
Player.prototype.explode = function () {
  if (!this.exploded) {
    this.exploded = true;
    boom(this.x, this.y, this.dx, this.dy);
  }
};
Player.prototype.fire = function () {
  if (Date.now() - this.fireRate < this.lastFire) { return; }
  this.lastFire = Date.now();
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
    decay: 0.05
  });
  socket.emit('fire', {
    x: xx,
    y: yy,
    dx: Math.sin(radians) * 10,
    dy: Math.cos(radians) * 10,
    decay: 0.05,
    life: 1,
    owner: name
  });
};
Player.prototype.render = function () {
  context.fillStyle = 'white';
  context.font = '12px Arial';
  var playerX = width/2 + this.offset.x;
  var playerY = height/2 + this.offset.y;
  var title = this.exploded ? '☠ ' + this.name + ' ☠' : this.name;
  var w = context.measureText(title).width;
  context.fillText(title, playerX - (w/2), playerY + this.h);
  if (this.exploded) { return; }
  context.save();
  // context.translate(this.x, this.y);
  context.translate(playerX, playerY);
  // 0.055 adjustment rotates image 180 degrees
  context.rotate(-(this.angle + 0.055) * (180/Math.PI));
  context.drawImage(this.img, -this.w/2, -this.h/2);
  context.restore();
};

function FBPlayer (params) {
  this.x = params.x;
  this.y = params.y;
  this.angle = params.angle;

  this.name = params.name;

  this.h = this.w = 36;

  this.connected = true;
  this.exploded = !!params.exploded;

  this.particleRate = 200;
  this.lastParticle = {
    time: Date.now()
  };

  this.img = new Image();
  this.img.src = 'http://retroships.com/generate.png?&size=3&seed=' + this.name;

  this.lastUpdated = new Date();
}

inherits(FBPlayer, CanvasItem);

FBPlayer.prototype.update = function () {
  var radians = (this.angle + 0.055) * (180/Math.PI);

  var xx = this.x - (this.w/2 * Math.cos(-(this.angle + 0.0275) * (180/Math.PI)));
  var yy = this.y - (this.w/2 * Math.sin(-(this.angle + 0.0275) * (180/Math.PI)));

  var r = this.w/2;
  // Particle trails
  if (Date.now() - this.particleRate >= this.lastParticle.time &&
      (!within(this.lastParticle.x, xx, 5) ||
      !within(this.lastParticle.y, yy, 5))) {
    this.lastParticle = {
      time: Date.now(),
      x: xx,
      y: yy
    };
    particles.create({
      x: xx,
      y: yy,
      r: 5,
      c: 'rgb(130,100,0)',
      decay: 0.015
    });
  }
};
FBPlayer.prototype.destroyed = function () {
  return !this.connected;
};

FBPlayer.prototype.render = function () {
  var coords = convertToCoords(this.x, this.y);
  context.fillStyle = 'white';
  context.font = '12px Arial';
  var title = this.exploded ? '☠ ' + this.name + ' ☠' : this.name;
  var w = context.measureText(title).width;
  context.fillText(title, coords.x - (w/2), coords.y + this.h);
  if (this.exploded) { return; }
  context.save();
  context.translate(coords.x, coords.y);
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
