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
    context.drawImage(this.img, this.x, this.y);
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
    if (this.item.prototype instanceof Particle) {
      console.log(this.items);
    }
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].render();
    }
  }
};