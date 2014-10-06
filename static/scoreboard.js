function Scoreboard () {
  var self = this;
  socket.on('score', function(data) {
    self.scores = data;
  });
}

inherits(Scoreboard, CanvasItem);

Scoreboard.prototype.render = function () {
  var row = 0;
  var longest = {
    name: ''
  };
  if (this.scores) {
    longest = this.scores.sort(function(a, b) {
      return b.name.length - a.name.length;
    })[0];
  }
  context.fillStyle = 'white';
  context.font = '18px Arial';
  var offset = Math.max(context.measureText(longest.name).width, 150);

  context.fillText('Name', width - offset, 20);
  context.fillText('Score', width - 75, 20);
  if (this.scores) {
    row++;
    context.font = '14px Arial';
    this.scores.forEach(function(score) {
      row++;
      context.fillText(score.name, width - offset, row * 20);
      context.fillText(score.score, width - 75, row * 20);
    });
  }
};
