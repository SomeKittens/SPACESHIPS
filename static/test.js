'use strict';

var socket = io.connect();
var results = document.querySelector('#results');
console.log('inti');

socket.emit('debug-init');

socket.on('debug-update', function(data) {
  console.log(data);
  results.innerHTML += 'tickAverage: ' + data.tickAverage.toFixed(2) + ', bullets: ' + data.bullets + '<br>';
});

setInterval(function () {
  socket.emit('debug-fire-10', {
    x: Math.random() * 500 | 0,
    y: Math.random() * 500 | 0,
    dx: Math.sin(Math.random()) * 10,
    dy: Math.cos(Math.random()) * 10,
    decay: 0,
    life: 1
  });
});