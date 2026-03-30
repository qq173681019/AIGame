/**
 * 棋子类 - Chess Piece / Unit
 * 表示一个棋盘上的棋子单位
 */
class Chess {
  /**
   * @param {object} championData - 来自 ChampionData 的棋子模板数据
   * @param {number} [star=1] - 星级 (1-3)
   */
  constructor(championData, star = 1) {
    this.id = championData.id;
    this.instanceId = Chess._nextId++;
    this.name = championData.name;
    this.cost = championData.cost;
    this.star = star;
    this.emoji = championData.emoji;
    this.synergies = [...championData.synergies];
    this.skill = { ...championData.skill };
    this.range = championData.range;

    // 根据星级计算属性
    const multiplier = this._starMultiplier();
    this.maxHp = Math.floor(championData.hp * multiplier);
    this.hp = this.maxHp;
    this.attack = Math.floor(championData.attack * multiplier);
    this.defense = Math.floor(championData.defense * multiplier);
    this.attackSpeed = championData.attackSpeed;
    this.maxMana = championData.mana;
    this.mana = 0;

    // 战斗状态
    this.shield = 0;
    this.isAlive = true;
    this.attackCooldown = 0;

    // 位置 (row, col) - 棋盘坐标
    this.row = -1;
    this.col = -1;

    // 在备战席的位置索引 (-1 表示不在备战席)
    this.benchIndex = -1;

    // 动画状态
    this.animState = 'idle';
    this.animTimer = 0;

    // 羁绊加成缓存
    this.bonuses = {};
  }

  /** 星级属性倍率 */
  _starMultiplier() {
    if (this.star === 2) return 1.8;
    if (this.star === 3) return 3.24;
    return 1;
  }

  /** 受到伤害 */
  takeDamage(amount, type) {
    let finalDamage = amount;

    // 物理减伤
    if (type === 'physical') {
      const totalDefense = this.defense + (this.bonuses.defense || 0);
      finalDamage = Math.max(1, amount - totalDefense * 0.5);
    }

    // 魔法减伤
    if (type === 'magic' && this.bonuses.magicResist) {
      finalDamage = Math.floor(finalDamage * (1 - this.bonuses.magicResist));
    }

    // 通用减伤
    if (this.bonuses.damageReduction) {
      finalDamage = Math.floor(finalDamage * (1 - this.bonuses.damageReduction));
    }

    // 先扣护盾
    if (this.shield > 0) {
      if (this.shield >= finalDamage) {
        this.shield -= finalDamage;
        finalDamage = 0;
      } else {
        finalDamage -= this.shield;
        this.shield = 0;
      }
    }

    this.hp = Math.max(0, this.hp - Math.floor(finalDamage));
    if (this.hp <= 0) {
      this.isAlive = false;
    }

    // 获取法力(受伤获得)
    this.mana = Math.min(this.maxMana, this.mana + Math.floor(finalDamage * 0.1));

    return Math.floor(finalDamage);
  }

  /** 执行普通攻击 */
  performAttack(target) {
    if (!target || !target.isAlive) return 0;

    let damage = this.attack + (this.bonuses.attack || 0);

    // 暴击判定
    const critChance = this.bonuses.critChance || 0;
    const critDamage = 1.5 + (this.bonuses.critDamage || 0);
    if (Math.random() < critChance) {
      damage = Math.floor(damage * critDamage);
    }

    // 暗影额外伤害
    if (this.bonuses.bonusDamage) {
      damage = Math.floor(damage * (1 + this.bonuses.bonusDamage));
    }

    // 回蓝(攻击获得)
    this.mana = Math.min(this.maxMana, this.mana + 10);

    const dealt = target.takeDamage(damage, 'physical');
    this.animState = 'attack';
    this.animTimer = 300;
    return dealt;
  }

  /** 释放技能 */
  castSkill(targets) {
    if (this.mana < this.maxMana) return [];
    this.mana = 0;

    const results = [];
    const skill = this.skill;

    let skillDamage = skill.damage;

    // 法术强度加成
    if (skill.type === 'magic' && this.bonuses.spellPower) {
      skillDamage = Math.floor(skillDamage * (1 + this.bonuses.spellPower));
    }

    if (skill.type === 'physical' || skill.type === 'magic') {
      // 伤害技能
      const target = targets[0];
      if (target && target.isAlive) {
        const dealt = target.takeDamage(skillDamage, skill.type);
        results.push({ target, damage: dealt, type: 'damage' });
      }
    } else if (skill.type === 'heal') {
      // 治疗技能 - 治疗自己
      const healAmount = skill.healAmount || 0;
      this.hp = Math.min(this.maxHp, this.hp + healAmount);
      results.push({ target: this, healAmount, type: 'heal' });
    } else if (skill.type === 'buff') {
      // 护盾技能
      const shieldAmount = skill.shieldAmount || 0;
      this.shield += shieldAmount;
      results.push({ target: this, shieldAmount, type: 'shield' });
    }

    // 人类羁绊 - 施法后回蓝
    if (this.bonuses.manaRestore) {
      this.mana += this.bonuses.manaRestore;
    }

    this.animState = 'skill';
    this.animTimer = 500;
    return results;
  }

  /** 获取有效攻击力(含加成) */
  getEffectiveAttack() {
    return this.attack + (this.bonuses.attack || 0);
  }

  /** 获取有效防御(含加成) */
  getEffectiveDefense() {
    return this.defense + (this.bonuses.defense || 0);
  }

  /** 重置战斗状态(每场战斗开始前调用) */
  resetForBattle() {
    this.hp = this.maxHp;
    this.mana = 0;
    this.shield = 0;
    this.isAlive = true;
    this.attackCooldown = 0;
    this.animState = 'idle';
    this.animTimer = 0;
  }

  /** 克隆一个棋子 */
  clone() {
    const templateData = {
      id: this.id,
      name: this.name,
      cost: this.cost,
      hp: Math.floor(this.maxHp / this._starMultiplier()),
      attack: Math.floor(this.attack / this._starMultiplier()),
      defense: Math.floor(this.defense / this._starMultiplier()),
      attackSpeed: this.attackSpeed,
      range: this.range,
      mana: this.maxMana,
      synergies: [...this.synergies],
      skill: { ...this.skill },
      emoji: this.emoji
    };
    return new Chess(templateData, this.star);
  }

  /** 是否可以合成升星 */
  canMergeWith(other) {
    return this.id === other.id && this.star === other.star && this.star < 3;
  }

  /** 升星 */
  upgrade() {
    if (this.star >= 3) return;
    this.star++;
    const multiplier = this._starMultiplier();
    // 通过 base 数据重新计算
    const baseMultiplier = this.star === 2 ? 1.0 : (this.star === 3 ? 1.8 : 1.0);
    const prevMaxHp = Math.floor(this.maxHp / baseMultiplier);
    this.maxHp = Math.floor(prevMaxHp * multiplier / (this.star === 2 ? 1 : 1.8));
    this.hp = this.maxHp;
    this.attack = Math.floor(this.attack * multiplier / baseMultiplier);
    this.defense = Math.floor(this.defense * multiplier / baseMultiplier);
  }
}

Chess._nextId = 1;

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Chess;
}
