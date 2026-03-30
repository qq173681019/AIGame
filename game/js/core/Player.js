/**
 * 玩家类 - Player
 * 管理玩家状态: 金币、等级、经验、生命等
 */
class Player {
  /**
   * @param {object} config - GameConfig
   */
  constructor(config) {
    this.config = config;
    this.hp = config.STARTING_HP;
    this.maxHp = config.STARTING_HP;
    this.gold = config.STARTING_GOLD;
    this.level = 1;
    this.xp = 0;
    this.winStreak = 0;
    this.loseStreak = 0;
    this.round = 0;

    // 备战席
    this.bench = new Array(config.BENCH_SLOTS).fill(null);
  }

  /** 获取当前等级允许上场的棋子数 */
  getMaxUnits() {
    return this.config.UNITS_PER_LEVEL[this.level] || 1;
  }

  /** 获取升级所需经验 */
  getXpToLevel() {
    if (this.level >= this.config.MAX_LEVEL) return Infinity;
    return this.config.XP_TO_LEVEL[this.level + 1] || Infinity;
  }

  /** 增加经验 */
  addXp(amount) {
    if (this.level >= this.config.MAX_LEVEL) return false;
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.getXpToLevel() && this.level < this.config.MAX_LEVEL) {
      this.xp -= this.getXpToLevel();
      this.level++;
      leveled = true;
    }
    return leveled;
  }

  /** 购买经验 */
  buyXp() {
    if (this.gold < this.config.BUY_XP_COST) return false;
    if (this.level >= this.config.MAX_LEVEL) return false;
    this.gold -= this.config.BUY_XP_COST;
    return this.addXp(this.config.XP_PER_BUY);
  }

  /** 是否有足够金币 */
  canAfford(cost) {
    return this.gold >= cost;
  }

  /** 扣除金币 */
  spendGold(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    return true;
  }

  /** 增加金币 */
  addGold(amount) {
    this.gold += amount;
  }

  /** 计算利息 */
  getInterest() {
    return Math.min(
      this.config.MAX_INTEREST,
      Math.floor(this.gold * this.config.INTEREST_RATE)
    );
  }

  /** 计算连胜/连败奖励 */
  getStreakBonus() {
    const streak = Math.max(this.winStreak, this.loseStreak);
    if (streak >= 5) return 3;
    if (streak >= 3) return 2;
    if (streak >= 2) return 1;
    return 0;
  }

  /** 回合开始时的收入计算 */
  calculateIncome() {
    const baseIncome = 5;
    const interest = this.getInterest();
    const streakBonus = this.getStreakBonus();
    return baseIncome + interest + streakBonus;
  }

  /** 记录胜利 */
  recordWin() {
    this.winStreak++;
    this.loseStreak = 0;
  }

  /** 记录失败并扣除生命 */
  recordLoss(damage) {
    this.loseStreak++;
    this.winStreak = 0;
    this.hp = Math.max(0, this.hp - damage);
    return this.hp <= 0;
  }

  /** 添加棋子到备战席 */
  addToBench(chess) {
    for (let i = 0; i < this.bench.length; i++) {
      if (!this.bench[i]) {
        this.bench[i] = chess;
        chess.benchIndex = i;
        chess.row = -1;
        chess.col = -1;
        return i;
      }
    }
    return -1; // 备战席已满
  }

  /** 从备战席移除棋子 */
  removeFromBench(index) {
    if (index < 0 || index >= this.bench.length) return null;
    const chess = this.bench[index];
    if (chess) {
      chess.benchIndex = -1;
    }
    this.bench[index] = null;
    return chess;
  }

  /** 获取备战席棋子数量 */
  getBenchCount() {
    return this.bench.filter(c => c !== null).length;
  }

  /** 检查是否存活 */
  isAlive() {
    return this.hp > 0;
  }
}

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Player;
}
