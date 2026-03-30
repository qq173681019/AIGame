/**
 * 事件发射器 - Simple Event Emitter
 */
class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(event, fn) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(fn);
    return this;
  }

  off(event, fn) {
    if (!this._events[event]) return this;
    if (fn) {
      this._events[event] = this._events[event].filter(function(f) { return f !== fn; });
    } else {
      delete this._events[event];
    }
    return this;
  }

  emit(event) {
    if (!this._events[event]) return this;
    var args = Array.prototype.slice.call(arguments, 1);
    var listeners = this._events[event].slice();
    for (var i = 0; i < listeners.length; i++) {
      listeners[i].apply(this, args);
    }
    return this;
  }

  once(event, fn) {
    var self = this;
    function wrapper() {
      fn.apply(this, arguments);
      self.off(event, wrapper);
    }
    this.on(event, wrapper);
    return this;
  }
}

module.exports = EventEmitter;
