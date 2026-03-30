/**
 * 战斗系统 - Battle
 * 管理战斗逻辑: 攻击、技能释放、战斗结算
 */
class Battle {
  /**
   * @param {Board} board - 战斗棋盘
   * @param {number} cols - 列数
   */
  constructor(board, cols) {
    this.board = board;
    this.cols = cols;
    this.isFinished = false;
    this.winner = null; // 'player' or 'enemy'
    this.tickCount = 0;
    this.log = [];
  }

  /** 获取玩家方棋子(0-3行) */
  getPlayerUnits() {
    return this.board.getAllUnits().filter(u => u.row < 4 && u.isAlive);
  }

  /** 获取敌方棋子(4-7行) */
  getEnemyUnits() {
    return this.board.getAllUnits().filter(u => u.row >= 4 && u.isAlive);
  }

  /** 执行一个战斗 tick */
  tick() {
    if (this.isFinished) return;
    this.tickCount++;

    const playerUnits = this.getPlayerUnits();
    const enemyUnits = this.getEnemyUnits();

    // 检查胜负
    if (playerUnits.length === 0 && enemyUnits.length === 0) {
      this.isFinished = true;
      this.winner = 'draw';
      return;
    }
    if (playerUnits.length === 0) {
      this.isFinished = true;
      this.winner = 'enemy';
      return;
    }
    if (enemyUnits.length === 0) {
      this.isFinished = true;
      this.winner = 'player';
      return;
    }

    // 所有存活棋子执行行动
    const allUnits = [...playerUnits, ...enemyUnits];
    // 按攻速排序(快的先动)
    allUnits.sort((a, b) => b.attackSpeed - a.attackSpeed);

    for (const unit of allUnits) {
      if (!unit.isAlive) continue;

      const isPlayerUnit = unit.row < 4;
      const enemies = isPlayerUnit ? this.getEnemyUnits() : this.getPlayerUnits();

      if (enemies.length === 0) continue;

      // 找最近的敌人
      const target = this.board.findNearestEnemy(unit, enemies);
      if (!target) continue;

      const dist = Battle.distance(unit.row, unit.col, target.row, target.col);

      // 先尝试释放技能
      if (unit.mana >= unit.maxMana) {
        const results = unit.castSkill([target]);
        for (const r of results) {
          this.log.push({
            tick: this.tickCount,
            unit: unit.name,
            action: 'skill',
            skill: unit.skill.name,
            target: r.target.name,
            result: r
          });
        }
        continue;
      }

      // 在攻击范围内则攻击
      if (dist <= unit.range) {
        unit.attackCooldown -= 1;
        if (unit.attackCooldown <= 0) {
          const damage = unit.performAttack(target);
          unit.attackCooldown = Math.round(1 / unit.attackSpeed);
          this.log.push({
            tick: this.tickCount,
            unit: unit.name,
            action: 'attack',
            target: target.name,
            damage
          });
        }
      } else {
        // 向目标移动
        this._moveToward(unit, target);
      }
    }

    // 超时判定
    if (this.tickCount >= 120) {
      this.isFinished = true;
      const pHp = playerUnits.reduce((s, u) => s + u.hp, 0);
      const eHp = enemyUnits.reduce((s, u) => s + u.hp, 0);
      this.winner = pHp >= eHp ? 'player' : 'enemy';
    }
  }

  /** 移动棋子向目标靠近(战斗棋盘扩展) */
  _moveToward(unit, target) {
    const dr = Math.sign(target.row - unit.row);
    const dc = Math.sign(target.col - unit.col);
    const newRow = unit.row + dr;
    const newCol = unit.col + dc;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < this.cols) {
      if (!this.board.getUnit(newRow, newCol)) {
        this.board.moveUnit(unit.row, unit.col, newRow, newCol);
      }
    }
  }

  /** 运行完整战斗到结束 */
  runToCompletion() {
    while (!this.isFinished) {
      this.tick();
    }
    return this.winner;
  }

  /** 计算两个格子之间的距离(切比雪夫距离) */
  static distance(r1, c1, r2, c2) {
    return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
  }

  /** 计算战败伤害 */
  calculateDamage() {
    const survivors = this.winner === 'enemy'
      ? this.getEnemyUnits()
      : this.getPlayerUnits();
    // 基础伤害 + 每个存活棋子额外伤害
    return 2 + survivors.reduce((sum, u) => sum + u.star, 0);
  }
}

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Battle;
}
