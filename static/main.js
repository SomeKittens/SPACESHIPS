'use strict';

var name;
var socket = io.connect(document.location.href);

var canvas = document.getElementById('canvas'),
  height = canvas.height = canvas.clientHeight,
  width = canvas.width = canvas.clientWidth,
  context = canvas.getContext('2d'),
  dtime = Date.now(),
  timing = 1000,
  centerHeight = height / 2 | 0,
  centerWidth = width / 2 | 0;

var field = {};

var nameInput = document.querySelector('[name="name"]');

var stars = new CanvasCollection(Star);
var planets = new CanvasCollection(Planet);
var players = new CanvasCollection(FBPlayer);
var particles = new CanvasCollection(Particle, 1000);
var playerBullets = new CanvasCollection(Particle);
var scoreboard = new Scoreboard();
var thisPlayer;

function convertToCoords (x, y) {
  if (!thisPlayer) { return [x, y]; }
  var modX = 0, modY = 0;
  if (thisPlayer.offset.x > 0) {
    modX = thisPlayer.offset.x;
  }
  if (thisPlayer.offset.y > 0) {
    modY = thisPlayer.offset.y;
  }
  var offsetX = Math.max((thisPlayer.x - modX) - (width / 2), 0);
  var offsetY = Math.max((thisPlayer.y - modY) - (height / 2), 0);
  return {
    x: x - offsetX,
    y: y - offsetY
  };
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

var respawnMessageFlasher = (function () {
  var title = document.querySelector('title');
  var timeout;

  return function (pilot) {
    clearTimeout(timeout);

    var count = 6;
    var messages = [pilot.name + ' just respawned!', 'SPACESHIPS!'];
    var blink = function () {
        title.innerHTML = messages[count % 2];
        if (count > 1) {
          timeout = setTimeout(blink, 500);
        }
        count -= 1;
    };
    blink();
  };
})();

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
    name: name
  });

  setInterval(function () {
    socket.emit('heartbeat', {
      x: thisPlayer.x,
      y: thisPlayer.y,
      dx: thisPlayer.dx,
      dy: thisPlayer.dy,
      angle: thisPlayer.angle,
      name: name
    });
  }, 1000 / 30);
});

function run() {
  context.clearRect(0, 0, width, height);
  stars.render();
  planets.render();
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
  planets.update();
  if (thisPlayer) {
    thisPlayer.update();
  }
  particles.update();
  scoreboard.update();
  playerBullets.update();
  players.update();

  stars.gc();
  planets.gc();
  particles.gc();
  playerBullets.gc();
  players.gc();
}, 16);

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
socket.on('init', function (data) {
  field.x = data.gameX;
  field.y = data.gameY;
  for (var i = 0; i < 150; i++) {
    stars.create();
  }
  for (var j = 0; j < 4; j++) {
    planets.create();
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
  respawnMessageFlasher(data);
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
});
socket.on('fire', function (data) {
  particles.create({
    x: data.x,
    y: data.y,
    dx: data.dx,
    dy: data.dy,
    c: 'rgba(287,3,24,1)',
    r: 7,
    decay: 0.06
  });
});
socket.on('leave', function(data) {
  fbPlayers[data.name] = null;
});

window.addEventListener('beforeunload', function () {
  socket.emit('leave', {name: name});
}, false);

nameInput.focus();
socket.emit('init');