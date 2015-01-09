function Star() {
  this.x = (Math.random() * (field.x)| 0);
  this.y = (Math.random() * (field.y)| 0);

  this.img = (function() {
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');
    canvas.height = canvas.width = 10;
    context.beginPath();
    var radius = Math.random() * 3 |0;
    context.arc(2, 2, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'white';
    context.fill();
    context.closePath();
    return canvas;
  })();
}

function Planet() {
  this.x = (Math.random() * (field.x)| 0);
  this.y = (Math.random() * (field.y)| 0);

  var img = new Image();
  img.onload = function () {
    var r = Math.random() * 255 | 0,
      g = Math.random() * 255 | 0,
      b = Math.random() * 255 | 0;
    this.img = colorImage(img, r, g, b, 64);
  }.bind(this);
  img.src = '/img/gas.png';
  this.img = document.createElement('canvas');
}

inherits(Star, CanvasItem);
inherits(Planet, CanvasItem);
