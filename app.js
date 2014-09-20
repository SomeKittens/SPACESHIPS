'use strict';

var express = require('express.io');
var app = express();
var path = require('path');
app.http().io();

app.use(express.static(__dirname));

var consts = {
  shipSize: 36
};

var players = {};

function within(x, y, within) {
  return x + within >= y && x - within <= y;
}

['exploded', 'reset', 'leave'].forEach(function (e) {
  app.io.route(e, function (req) {
    req.io.broadcast(e, req.data);
  });
});

app.io.route('join', function(req) {
  req.io.broadcast('join', req.data);
  players[req.data.name] = req.data;
});

app.io.route('heartbeat', function(req) {
  req.io.broadcast('join', req.data);
  players[req.data.name] = req.data;

  // Collision check
  Object.keys(players).forEach(function(key) {
    if (key === req.data.name) { return; }
    var otherPlayer = players[key];
    var x = otherPlayer.x - req.data.x,
        y = otherPlayer.y - req.data.y,
        distance = Math.sqrt(x*x + y*y);
    if (distance <= consts.shipSize) {
      console.log(req.data.name, ' collided with ', key);
      app.io.broadcast('exploded', {name: key});
      app.io.broadcast('exploded', {name: req.data.name});
    }
  });
});

app.listen(8080);

console.log('running');