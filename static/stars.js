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

inherits(Star, CanvasItem);