var GameConfig = require('../config/game-config');

class Battle {
  constructor() {
    this.playerUnits = [];  // Cloned heroes for battle
    this.enemyUnits = [];
    this.isRunning = false;
    this.result = null; // 'win', 'lose', 'draw'
    this.battleTime = 0;
    this.maxTime = GameConfig.BATTLE_TIME;
    this.animations = []; // For visual effects
  }
  
  // Start battle with arrays of hero clones
  start(playerHeroes, enemyHeroes) {
    this.playerUnits = playerHeroes;
    this.enemyUnits = enemyHeroes;
    this.isRunning = true;
    this.result = null;
    this.battleTime = 0;
    this.animations = [];
    
    // Position enemy units mirrored
    for (var i = 0; i < this.enemyUnits.length; i++) {
      var unit = this.enemyUnits[i];
      // Mirror: row becomes (BOARD_ROWS*2-1) - row
      unit.boardRow = (GameConfig.BOARD_ROWS * 2 - 1) - unit.boardRow;
    }
    
    // Reset all units for battle
    for (var p = 0; p < this.playerUnits.length; p++) {
      this.playerUnits[p].resetForBattle();
    }
    for (var e = 0; e < this.enemyUnits.length; e++) {
      this.enemyUnits[e].resetForBattle();
    }
  }
  
  // Update battle by dt seconds
  update(dt) {
    if (!this.isRunning) return;
    
    this.battleTime += dt;
    
    // Update animations
    this._updateAnimations(dt);
    
    // Process each living player unit
    for (var i = 0; i < this.playerUnits.length; i++) {
      var unit = this.playerUnits[i];
      if (!unit.alive) continue;
      this._processUnit(unit, this.enemyUnits, dt);
    }
    
    // Process each living enemy unit
    for (var j = 0; j < this.enemyUnits.length; j++) {
      var eUnit = this.enemyUnits[j];
      if (!eUnit.alive) continue;
      this._processUnit(eUnit, this.playerUnits, dt);
    }
    
    // Check win condition
    var playerAlive = this._countAlive(this.playerUnits);
    var enemyAlive = this._countAlive(this.enemyUnits);
    
    if (enemyAlive === 0) {
      this.result = 'win';
      this.isRunning = false;
    } else if (playerAlive === 0) {
      this.result = 'lose';
      this.isRunning = false;
    } else if (this.battleTime >= this.maxTime) {
      this.result = playerAlive >= enemyAlive ? 'win' : 'lose';
      this.isRunning = false;
    }
  }
  
  _processUnit(unit, enemies, dt) {
    // Reduce cooldown using delta time for frame-rate independence
    unit.attackCooldown -= dt;
    
    // Find target if none or target is dead
    if (!unit.target || !unit.target.alive) {
      unit.target = this._findNearestEnemy(unit, enemies);
    }
    
    if (!unit.target) return;
    
    var dist = this._getDistance(unit, unit.target);
    
    if (dist <= unit.range) {
      // In range - attack if cooldown ready
      if (unit.attackCooldown <= 0) {
        this._attack(unit, unit.target);
        unit.attackCooldown = 1.0 / unit.getEffectiveAttackSpeed();
      }
    } else {
      // Move toward target
      this._moveToward(unit, unit.target);
    }
  }
  
  _attack(attacker, target) {
    var damage = attacker.getEffectiveAttack();
    var actualDmg = target.takeDamage(damage);
    
    // Gain mana on attack
    attacker.mana += 10;
    target.mana += Math.floor(actualDmg * 0.5);
    
    // Check if ability ready
    if (attacker.mana >= attacker.maxMana) {
      this._useAbility(attacker, target);
      attacker.mana = 0;
    }
    
    // Add attack animation
    this.animations.push({
      type: 'attack',
      fromRow: attacker.boardRow,
      fromCol: attacker.boardCol,
      toRow: target.boardRow,
      toCol: target.boardCol,
      time: 0.3,
      elapsed: 0,
      color: attacker.color || '#ffffff'
    });
  }
  
  _useAbility(unit, target) {
    var ability = unit.ability;
    if (!ability) return;
    
    switch (ability.effect) {
      case 'damage':
        target.takeDamage(ability.value);
        break;
      case 'aoe_damage':
        // Damage nearby enemies: determine which side the unit belongs to
        var isPlayer = this.playerUnits.indexOf(unit) !== -1;
        var aoeTargets = isPlayer ? this.enemyUnits : this.playerUnits;
        for (var i = 0; i < aoeTargets.length; i++) {
          if (aoeTargets[i].alive && this._getDistance(target, aoeTargets[i]) <= 2) {
            aoeTargets[i].takeDamage(ability.value);
          }
        }
        break;
      case 'defense_up':
        unit.bonusDefense += ability.value;
        break;
      case 'attack_up':
        unit.bonusAttack += ability.value;
        break;
      case 'heal':
        unit.hp = Math.min(unit.getEffectiveMaxHp(), unit.hp + ability.value);
        break;
      case 'speed_up':
        unit.bonusAttackSpeed += ability.value;
        break;
      case 'stun':
        target.attackCooldown += ability.value; // Stun by adding cooldown
        break;
      default:
        target.takeDamage(ability.value || 0);
        break;
    }
    
    this.animations.push({
      type: 'ability',
      row: unit.boardRow,
      col: unit.boardCol,
      name: ability.name,
      time: 0.5,
      elapsed: 0,
      color: '#FFD700'
    });
  }
  
  _findNearestEnemy(unit, enemies) {
    var nearest = null;
    var minDist = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      if (!enemies[i].alive) continue;
      var d = this._getDistance(unit, enemies[i]);
      if (d < minDist) {
        minDist = d;
        nearest = enemies[i];
      }
    }
    return nearest;
  }
  
  _getDistance(a, b) {
    var dr = a.boardRow - b.boardRow;
    var dc = a.boardCol - b.boardCol;
    return Math.sqrt(dr * dr + dc * dc);
  }
  
  _moveToward(unit, target) {
    var dr = target.boardRow - unit.boardRow;
    var dc = target.boardCol - unit.boardCol;
    var dist = Math.sqrt(dr * dr + dc * dc);
    if (dist === 0) return;
    
    // Move one step (simplified grid movement)
    var moveRow = dr > 0 ? 1 : (dr < 0 ? -1 : 0);
    var moveCol = dc > 0 ? 1 : (dc < 0 ? -1 : 0);
    
    // Only move one direction per tick for simplicity
    if (Math.abs(dr) >= Math.abs(dc)) {
      unit.boardRow += moveRow * 0.02; // Smooth movement
    } else {
      unit.boardCol += moveCol * 0.02;
    }
  }
  
  _updateAnimations(dt) {
    for (var i = this.animations.length - 1; i >= 0; i--) {
      this.animations[i].elapsed += dt;
      if (this.animations[i].elapsed >= this.animations[i].time) {
        this.animations.splice(i, 1);
      }
    }
  }
  
  _countAlive(units) {
    var count = 0;
    for (var i = 0; i < units.length; i++) {
      if (units[i].alive) count++;
    }
    return count;
  }
  
  // Get surviving enemy count (for damage calculation)
  getSurvivingEnemies() {
    if (this.result === 'win') return [];
    return this.enemyUnits.filter(function(u) { return u.alive; });
  }
  
  getSurvivingPlayers() {
    if (this.result === 'lose') return [];
    return this.playerUnits.filter(function(u) { return u.alive; });
  }
}

module.exports = Battle;
