function Scores () {
  this.scores = {};
}

Scores.prototype.addPlayer = function(player) {
  this.scores[player] = 0;
};

Scores.prototype.scorePoint = function(player) {
  this.scores[player]++;
};

Scores.prototype.toSortedArray = function () {
  var arr = [];
  var self = this;
  Object.keys(this.scores).forEach(function (player) {
    arr.push({
      name: player,
      score: self.scores[player]
    });
  });
  arr.sort(function(a,b) {
    return b.score - a.score;
  });
  return arr;
};

module.exports = Scores;