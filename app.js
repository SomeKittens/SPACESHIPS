'use strict';

var express = require('express.io');
var app = express();
app.http().io();

app.use(express.static(__dirname));

var consts = {
  shipSize: 36
};

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

var players = {};
var scores = new Scores();

['reset', 'leave'].forEach(function (e) {
  app.io.route(e, function (req) {
    req.io.broadcast(e, req.data);
  });
});

app.io.route('join', function(req) {
  req.io.broadcast('join', req.data);
  players[req.data.name] = req.data;
  scores.addPlayer(req.data.name);
  req.io.emit('score', scores.toSortedArray());
  req.io.broadcast('score', scores.toSortedArray());
});

app.io.route('heartbeat', function(req) {
  req.io.broadcast('heartbeat', req.data);
  players[req.data.name] = req.data;

  if (req.data.exploded) { return; }

  // Collision check
  Object.keys(players).forEach(function(key) {
    if (key === req.data.name) { return; }
    var otherPlayer = players[key];
    if (otherPlayer.exploded) { return; }
    var x = otherPlayer.x - req.data.x,
        y = otherPlayer.y - req.data.y,
        distance = Math.sqrt(x*x + y*y);
    if (distance <= consts.shipSize) {
      console.log(req.data.name, ' collided with ', key);
      otherPlayer.exploded = true;
      players[req.data.name].exploded = true;
      app.io.broadcast('exploded', {
        name: key
      });
      app.io.broadcast('exploded', {
        name: req.data.name
      });
    }
  });
});

app.io.route('exploded', function(req) {
  if (players[req.data.name].exploded) { return; }
  players[req.data.name].exploded = true;

  scores.scorePoint(req.data.killer);
  console.log(scores.toSortedArray());
  req.io.broadcast('score', scores.toSortedArray());
  req.io.emit('score', scores.toSortedArray());

  req.io.broadcast('exploded', req.data);
  req.io.emit('exploded', req.data);
});

app.listen(process.env.PORT || 8080);

console.log('running');