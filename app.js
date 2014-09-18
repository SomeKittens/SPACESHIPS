'use strict';

var express = require('express.io');
var app = express();
var path = require('path');
app.http().io();

app.use(express.static(__dirname));

['join', 'exploded', 'reset', 'heartbeat', 'leave'].forEach(function (e) {
  app.io.route(e, function (req) {
    req.io.broadcast(e, req.data);
  });
});

app.listen(8080);

console.log('running');