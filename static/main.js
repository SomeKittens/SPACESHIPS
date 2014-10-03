'use strict';

var name;
var socket = io.connect(document.location.href);

var canvas = document.getElementById('canvas'),
  height = canvas.height = 700,
  width = canvas.width = 960,
  context = canvas.getContext('2d'),
  dtime = Date.now(),
  timing = 1000,
  centerHeight = height / 2 | 0,
  centerWidth = width / 2 | 0;

var nameInput = document.querySelector('[name="name"]');

var stars = new CanvasCollection(Star);
var players = new CanvasCollection(FBPlayer);
var particles = new CanvasCollection(Particle, 1000);
var playerBullets = new CanvasCollection(Particle);
var scoreboard = new Scoreboard();
var thisPlayer;

playerBullets.colliding = function (x, y) {
  for (var i = 0; i < playerBullets.items.length; i++) {
    if (within(playerBullets.items[i].x, x, 24) && within(playerBullets.items[i].y, y, 24)) {
      return true;
    }
  }
  return false;
};

for (var i = 0; i < 150; i++) {
  stars.create();
}

// http://stackoverflow.com/a/8916697/1216976
var keys = {};
document.body.addEventListener('keydown', function(e) {
  keys[e.keyCode] = true;
  if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
});

document.body.addEventListener('keyup', function(e) {
  keys[e.keyCode] = false;
  if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
});

document.querySelector('form').addEventListener('submit', function(e) {

  e.preventDefault();
  name = nameInput.value;
  thisPlayer = new Player();
  document.querySelector('#name').style.display = 'none';

  socket.emit('join', {
    x: thisPlayer.x,
    y: thisPlayer.y,
    dx: thisPlayer.dx,
    dy: thisPlayer.dy,
    angle: thisPlayer.angle,
    firing: !!keys[32],
    name: name
  });

  setInterval(function () {
    socket.emit('heartbeat', {
      x: thisPlayer.x,
      y: thisPlayer.y,
      dx: thisPlayer.dx,
      dy: thisPlayer.dy,
      angle: thisPlayer.angle,
      firing: !!keys[32],
      name: name,
      exploded: thisPlayer.exploded
    });
  }, 1000 / 30);
});

function run() {
  context.clearRect(0, 0, width, height);
  stars.render();
  players.render();
  if (thisPlayer) {
    thisPlayer.render();
  }
  scoreboard.render();

  // Particles & bullets need to be last
  //   as they mess with globalAlpha
  particles.render();
  playerBullets.render();
  context.globalAlpha = 1;
  requestAnimationFrame(run);
}

// This will continue running onblur
setInterval(function() {
  stars.update();
  if (thisPlayer) {
    thisPlayer.update();
  }
  particles.update();
  scoreboard.update();
  playerBullets.update();
  players.update();

  stars.gc();
  particles.gc();
  playerBullets.gc();
  players.gc();
}, 32);

run();

// Share prototype things
var fbPlayers = {};
socket.on('join', function (data) {
  if (data.name === name) {
    return;
  }
  // Create the player if we haven't seen them before
  if (!fbPlayers[data.name]) {
    fbPlayers[data.name] = players.create(data);
  }
});
socket.on('exploded', function (data) {
  if (data.name === name) {
    thisPlayer.explode();
    return;
  }
  var plr = fbPlayers[data.name];
  if (plr && !plr.exploded) {
    // Handle them exploding
    boom(plr.x, plr.y, plr.dx, plr.dy);
    plr.exploded = true;
  }
});
socket.on('reset', function (data) {
  fbPlayers[data.name].reset(data);
});
socket.on('heartbeat', function (data) {
  if (!fbPlayers[data.name]) {
    fbPlayers[data.name] = players.create(data);
    return;
  }
  var plr = fbPlayers[data.name];
  // Typical update
  plr.x = data.x;
  plr.y = data.y;
  plr.dx = data.dx;
  plr.dy = data.dy;
  plr.angle = data.angle;
  plr.firing = data.firing;
  plr.exploded = data.exploded;
});
socket.on('leave', function(data) {
  fbPlayers[data.name] = null;
});

window.addEventListener('beforeunload', function () {
  socket.emit('leave', {name:name});
}, false);

nameInput.focus();