/**
 * 商店类 - Shop
 * 管理商店中的棋子刷新与购买
 */
class Shop {
  /**
   * @param {object} config - GameConfig
   * @param {Array} championPool - ChampionData
   */
  constructor(config, championPool) {
    this.config = config;
    this.championPool = championPool;
    this.slots = new Array(config.SHOP_SLOTS).fill(null);
    this.locked = false;
  }

  /** 刷新商店(根据玩家等级) */
  refresh(playerLevel) {
    if (this.locked) return;

    const odds = this.config.SHOP_ODDS[playerLevel] || this.config.SHOP_ODDS[1];

    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i] = this._rollChampion(odds);
    }
  }

  /** 根据概率随机选取一个棋子 */
  _rollChampion(odds) {
    const roll = Math.random();
    let cumulative = 0;
    let selectedCost = 1;

    for (let cost = 0; cost < odds.length; cost++) {
      cumulative += odds[cost];
      if (roll < cumulative) {
        selectedCost = cost + 1;
        break;
      }
    }

    // 从对应费用的棋子中随机选一个
    const candidates = this.championPool.filter(c => c.cost === selectedCost);
    if (candidates.length === 0) {
      // fallback to cost 1
      const fallback = this.championPool.filter(c => c.cost === 1);
      return fallback[Math.floor(Math.random() * fallback.length)];
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /** 购买指定槽位的棋子, 返回棋子数据或null */
  buy(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.slots.length) return null;
    const champion = this.slots[slotIndex];
    if (!champion) return null;
    this.slots[slotIndex] = null;
    return champion;
  }

  /** 获取指定槽位的棋子 */
  getSlot(index) {
    return this.slots[index] || null;
  }

  /** 锁定/解锁商店 */
  toggleLock() {
    this.locked = !this.locked;
    return this.locked;
  }

  /** 是否锁定 */
  isLocked() {
    return this.locked;
  }
}

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Shop;
}
