function Star() {
  this.x = Math.random() * width | 0;
  this.y = 0;

  this.img = (function() {
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');
    canvas.height = canvas.width = 10;
    context.beginPath();
    context.arc(2, 2, 2, 0, 2 * Math.PI, false);
    context.fillStyle = 'white';
    context.fill();
    context.closePath();
    return canvas;
  })();
}

inherits(Star, CanvasItem);

Star.prototype.update = function() {
  this.y += 1;
};
Star.prototype.destroyed = function () {
  return this.x < 0 || this.x >= width
    || this.y < 0 || this.y >= height;
};