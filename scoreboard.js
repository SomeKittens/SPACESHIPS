function Scoreboard () {
  var self = this;
  socket.on('score', function(data) {
    self.scores = data;
  });
}

inherits(Scoreboard, CanvasItem);

Scoreboard.prototype.render = function () {
  var row = 0;
  context.fillStyle = 'white';
  context.font = '18px Arial';
  context.fillText('Name', width - 150, 20);
  context.fillText('Score', width - 75, 20);
  if (this.scores) {
    row++;
    context.font = '14px Arial';
    this.scores.forEach(function(score) {
      row++;
      context.fillText(score.name, width - 150, row * 20);
      context.fillText(score.score, width - 75, row * 20);
    });
  }
};
