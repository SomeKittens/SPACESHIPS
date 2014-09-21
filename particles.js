// http://jsfiddle.net/rlemon/g8y6xq8g/

function Particle(props) {
  this.x = props.x;
  this.y = props.y;
  var r = this.r = props.r || Math.random() * 9 + 1 | 0;

  this.img = (function() {
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');
    canvas.height = canvas.width = r;
    context.beginPath();
    context.rect(0, 0, r, r);
    context.fillStyle = props.c;
    context.fill();
    context.closePath();
    return canvas;
  }());

  this.dx = props.dx;
  this.dy = props.dy;

  this.created = Date.now();
  this.life = 1;
  this.decay = props.decay || 0.01;
}

inherits(Particle, CanvasItem);

Particle.prototype.update = function() {
  this.x += this.dx;
  this.y += this.dy;

  this.life -= this.decay;

  // Check for wraparound
  if (this.x < -(this.r/2)) {
    this.x = width + (this.r/2);
  } else if (this.x > width + (this.r/2)) {
    this.x = -(this.r/2);
  }
  if (this.y < -(this.r/2)) {
    this.y = height + (this.r/2);
  } else if (this.y > height + (this.r/2)) {
    this.y = -(this.r/2);
  }
};
Particle.prototype.render = function() {
  context.globalAlpha = this.life;
  context.drawImage(this.img, this.x, this.y);
};
Particle.prototype.destroyed = function () {
  return this.life < 0;
};

function boom(x, y, dx, dy) {
  var color = randomColor();
  for( var i = 0, l = Math.random() * 16+32|0; i < l; i++ ) {
    var props = {
      x: x,
      y: y,
      c: color
    };
    props.dx = dx + Math.random() * 4 - 2;
    props.dy = dy + Math.random() * 4 - 2;
    particles.create(props);
  }
}
function randomColor() {
  var r = Math.random() * 255 | 0,
    g = Math.random() * 255 | 0,
    b = Math.random() * 255 | 0;
  return 'rgba(' + r + ',' + g + ',' + b + ',1)';
}

