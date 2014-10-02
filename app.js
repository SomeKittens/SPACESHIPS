'use strict';

var express = require('express.io');
var Quadtree = require('./quadtree');
var Scores = require('./scores');
var app = express();
app.http().io();

app.use(express.static(__dirname + '/static'));

var consts = {
  shipSize: 36
};

var players = {};
var scores = new Scores();
var bullets = [];

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

app.io.route('fire', function (req) {
  bullets.push()
});

var tickLengthMs = 1000 / 30;

var previousTick = Date.now()
var actualTicks = 0;

var gameLoop = function () {
  var now = Date.now();
  actualTicks++;

  if (previousTick + tickLengthMs <= now) {
    bullets = bullets.map(function (bullet) {
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;
      bullet.life -= bullet.decay;
    }).filter(function (bullet) {
      return bullet.life > 0;
    });
    var delta = (now - previousTick) / 1000;
    previousTick = now;

    // update(delta)

    console.log('delta', delta, '(target: ' + tickLengthMs +' ms)', 'node ticks', actualTicks);
    actualTicks = 0;
  }

  if (Date.now() - previousTick < tickLengthMs - 16) {
    setTimeout(gameLoop);
  } else {
    setImmediate(gameLoop);
  }
};

// gameLoop();

app.listen(process.env.PORT || 8080);

console.log('running');