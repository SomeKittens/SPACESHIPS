'use strict';

function inherits (ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}

function within(x, y, within) {
  if (!x || !y) { return false; }
  return x + within >= y && x - within <= y;
}

function CanvasItem () {
  this.x = 0;
  this.y = 0;

  this.img = null;
}

CanvasItem.prototype = {
  constructor: CanvasItem,
  update: function () {},
  destroyed: function () {},
  render: function () {
    var coords = convertToCoords(this.x, this.y);
    context.drawImage(this.img, coords.x, coords.y);
  }
};

function CanvasCollection (item, max) {
  if (!(item.prototype instanceof CanvasItem)) {
    throw new Error('BAD USER');
  }
  this.item = item;
  this.items = [];
  this.max = max;
}

CanvasCollection.prototype = {
  constructor: CanvasCollection,
  create: function (params) {
    var newItem = new this.item(params);
    if (this.items.length >= this.max) {
      this.items.shift();
    }
    this.items.push(newItem);
    return newItem;
  },
  update: function () {
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].update();
    }
  },
  gc: function () {
    this.items = this.items.filter(function (item) {
      return !item.destroyed();
    });
  },
  render: function () {
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].render();
    }
  }
};

function colorImage (img, r, g, b, x, y) {
  if (!y) { y = x; }
  var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');
  canvas.height = y;
  canvas.width = x;

  context.drawImage(img, 0, 0);

  var imgData = context.getImageData(0, 0, x, y);

  // For loop incrementing by 4 is easier than forEach
  for (var i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i + 3] === 0) { continue; }
    imgData.data[i + 0] = Math.floor(r * imgData.data[i + 0] / 255);
    imgData.data[i + 1] = Math.floor(g * imgData.data[i + 1] / 255);
    imgData.data[i + 2] = Math.floor(b * imgData.data[i + 2] / 255);
  }
  context.putImageData(imgData, 0, 0);

  return canvas;
}