var heroConfig = require('../config/heroes');
var HEROES = heroConfig.HEROES;

class Hero {
  constructor(heroId) {
    var config = HEROES[heroId];
    if (!config) throw new Error('Unknown hero: ' + heroId);
    
    this.id = heroId;
    this.name = config.name;
    this.cost = config.cost;
    this.race = config.race;
    this.class = config.class;
    this.color = config.color;
    this.star = 1; // 1-3 stars
    
    // Stats (base + star scaling)
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.attack = config.attack;
    this.defense = config.defense;
    this.attackSpeed = config.attackSpeed;
    this.range = config.range;
    this.ability = Object.assign({}, config.ability);
    
    // Battle state
    this.mana = 0;
    this.maxMana = 100;
    this.attackCooldown = 0;
    this.target = null;
    this.alive = true;
    
    // Position on board (row, col) or bench (benchIndex)
    this.boardRow = -1;
    this.boardCol = -1;
    this.benchIndex = -1;
    this.isOnBoard = false;
    this.isOnBench = false;
    
    // Rendering
    this.renderX = 0;
    this.renderY = 0;
    this.renderSize = 0;
    
    // Synergy bonuses applied
    this.bonusHp = 0;
    this.bonusAttack = 0;
    this.bonusDefense = 0;
    this.bonusAttackSpeed = 0;
  }
  
  // Star up: multiply stats
  starUp() {
    this.star++;
    var multiplier = this.star; // 2x at 2 star, 3x at 3 star
    var config = HEROES[this.id];
    this.maxHp = Math.floor(config.hp * multiplier);
    this.hp = this.maxHp;
    this.attack = Math.floor(config.attack * multiplier);
    this.defense = Math.floor(config.defense * multiplier);
    this.ability.value = Math.floor(config.ability.value * multiplier);
  }
  
  // Get effective stats (base + synergy bonuses)
  getEffectiveAttack() { return this.attack + this.bonusAttack; }
  getEffectiveDefense() { return this.defense + this.bonusDefense; }
  getEffectiveMaxHp() { return this.maxHp + this.bonusHp; }
  getEffectiveAttackSpeed() { return this.attackSpeed + this.bonusAttackSpeed; }
  
  // Apply synergy bonuses
  applySynergyBonus(bonus) {
    if (bonus.hp) this.bonusHp += bonus.hp;
    if (bonus.attack) this.bonusAttack += bonus.attack;
    if (bonus.defense) this.bonusDefense += bonus.defense;
    if (bonus.attackSpeed) this.bonusAttackSpeed += bonus.attackSpeed;
  }
  
  // Reset for new battle
  resetForBattle() {
    this.hp = this.getEffectiveMaxHp();
    this.mana = 0;
    this.attackCooldown = 0;
    this.target = null;
    this.alive = true;
    this.bonusHp = 0;
    this.bonusAttack = 0;
    this.bonusDefense = 0;
    this.bonusAttackSpeed = 0;
  }
  
  // Take damage, return actual damage dealt
  takeDamage(rawDamage) {
    var effectiveDefense = this.getEffectiveDefense();
    var reduction = effectiveDefense / (effectiveDefense + 100);
    var actualDamage = Math.max(1, Math.floor(rawDamage * (1 - reduction)));
    this.hp -= actualDamage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return actualDamage;
  }
  
  // Clone for battle (don't modify original)
  cloneForBattle() {
    var clone = new Hero(this.id);
    clone.star = this.star;
    // Re-apply star stats
    if (this.star > 1) {
      var config = HEROES[this.id];
      clone.maxHp = Math.floor(config.hp * this.star);
      clone.hp = clone.maxHp;
      clone.attack = Math.floor(config.attack * this.star);
      clone.defense = Math.floor(config.defense * this.star);
      clone.ability.value = Math.floor(config.ability.value * this.star);
    }
    clone.boardRow = this.boardRow;
    clone.boardCol = this.boardCol;
    clone.isOnBoard = this.isOnBoard;
    return clone;
  }
}

module.exports = Hero;
