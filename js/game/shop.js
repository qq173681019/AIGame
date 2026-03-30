var GameConfig = require('../config/game-config');
var heroConfig = require('../config/heroes');
var HEROES = heroConfig.HEROES;
var HERO_POOL_SIZE = heroConfig.HERO_POOL_SIZE;

class Shop {
  constructor() {
    this.heroPool = {};  // heroId -> remaining count in pool
    this.currentOffers = []; // Array of heroIds (or null if bought)
    this.initPool();
  }
  
  initPool() {
    this.heroPool = {};
    var ids = Object.keys(HEROES);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var cost = HEROES[id].cost;
      this.heroPool[id] = HERO_POOL_SIZE[cost] || 10;
    }
  }
  
  // Roll new heroes based on player level
  roll(playerLevel) {
    this.currentOffers = [];
    var odds = GameConfig.SHOP_ODDS[playerLevel] || GameConfig.SHOP_ODDS[1];
    
    for (var i = 0; i < GameConfig.SHOP_SLOTS; i++) {
      var cost = this._rollCost(odds);
      var heroId = this._getRandomHeroOfCost(cost);
      this.currentOffers.push(heroId);
    }
    return this.currentOffers;
  }
  
  _rollCost(odds) {
    var roll = Math.random() * 100;
    var cumulative = 0;
    for (var i = 0; i < odds.length; i++) {
      cumulative += odds[i];
      if (roll < cumulative) return i + 1;
    }
    return 1;
  }
  
  _getRandomHeroOfCost(cost) {
    var candidates = [];
    var ids = Object.keys(HEROES);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      if (HEROES[id].cost === cost && this.heroPool[id] > 0) {
        candidates.push(id);
      }
    }
    if (candidates.length === 0) {
      // Fallback: any hero with available pool
      for (var j = 0; j < ids.length; j++) {
        if (this.heroPool[ids[j]] > 0) candidates.push(ids[j]);
      }
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  
  // Buy hero at slot index, returns heroId or null
  buyHero(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.currentOffers.length) return null;
    var heroId = this.currentOffers[slotIndex];
    if (!heroId) return null;
    
    // Decrease pool
    if (this.heroPool[heroId] > 0) {
      this.heroPool[heroId]--;
    }
    this.currentOffers[slotIndex] = null; // Mark as bought
    return heroId;
  }
  
  // Return hero to pool (when sold)
  returnHero(heroId, count) {
    count = count || 1;
    if (this.heroPool[heroId] !== undefined) {
      this.heroPool[heroId] += count;
    }
  }
  
  // Get hero info for display
  getOfferInfo(slotIndex) {
    var heroId = this.currentOffers[slotIndex];
    if (!heroId) return null;
    return HEROES[heroId];
  }
}

module.exports = Shop;
