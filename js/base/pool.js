/**
 * 对象池 - Object Pool for performance optimization
 */
class Pool {
  constructor() {
    this.pools = {};
  }

  getPool(name) {
    if (!this.pools[name]) {
      this.pools[name] = [];
    }
    return this.pools[name];
  }

  get(name, createFn) {
    const pool = this.getPool(name);
    if (pool.length > 0) {
      return pool.pop();
    }
    return createFn();
  }

  put(name, obj) {
    const pool = this.getPool(name);
    pool.push(obj);
  }

  clear(name) {
    if (name) {
      this.pools[name] = [];
    } else {
      this.pools = {};
    }
  }
}

module.exports = new Pool();
