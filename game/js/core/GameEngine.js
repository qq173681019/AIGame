/**
 * 游戏引擎 - GameEngine
 * 统合所有核心系统，管理游戏流程
 */
class GameEngine {
  /**
   * @param {object} config - GameConfig
   * @param {Array} championData - ChampionData
   * @param {object} synergyData - SynergyData
   * @param {object} deps - 依赖注入 { Board, Chess, Player, Shop, Battle, Synergy }
   */
  constructor(config, championData, synergyData, deps) {
    this.config = config;
    this.championData = championData;
    this.Board = deps.Board;
    this.Chess = deps.Chess;
    this.Battle = deps.Battle;

    this.player = new deps.Player(config);
    this.board = new deps.Board(config.BOARD_ROWS, config.BOARD_COLS);
    this.shop = new deps.Shop(config, championData);
    this.synergy = new deps.Synergy(synergyData);

    // 游戏状态
    this.phase = 'prep'; // 'prep', 'battle', 'result'
    this.round = 0;
    this.activeSynergies = [];
    this.currentBattle = null;
    this.battleBoard = null;

    // AI 敌人棋子(简单AI)
    this.enemyUnits = [];

    // 回调
    this.onPhaseChange = null;
    this.onBattleResult = null;
    this.onGameOver = null;
  }

  /** 初始化新游戏 */
  init() {
    this.round = 0;
    this.player.hp = this.config.STARTING_HP;
    this.player.gold = this.config.STARTING_GOLD;
    this.player.level = 1;
    this.player.xp = 0;
    this.board.clear();
    this.player.bench = new Array(this.config.BENCH_SLOTS).fill(null);
    this.startNewRound();
  }

  /** 开始新回合 */
  startNewRound() {
    this.round++;
    this.player.round = this.round;
    this.phase = 'prep';

    // 收入结算
    if (this.round > 1) {
      const income = this.player.calculateIncome();
      this.player.addGold(income);
      // 给一点经验
      this.player.addXp(2);
    }

    // 刷新商店
    this.shop.refresh(this.player.level);

    // 生成AI敌人
    this._generateEnemyUnits();

    // 计算羁绊
    this._recalcSynergies();

    if (this.onPhaseChange) {
      this.onPhaseChange('prep', this.round);
    }
  }

  /** 购买商店棋子 */
  buyChampion(slotIndex) {
    const championData = this.shop.getSlot(slotIndex);
    if (!championData) return { success: false, reason: '该位置没有棋子' };
    if (!this.player.canAfford(championData.cost)) {
      return { success: false, reason: '金币不足' };
    }

    // 检查备战席是否有空位
    if (this.player.getBenchCount() >= this.config.BENCH_SLOTS) {
      return { success: false, reason: '备战席已满' };
    }

    // 购买
    this.shop.buy(slotIndex);
    this.player.spendGold(championData.cost);

    const chess = new this.Chess(championData);
    this.player.addToBench(chess);

    // 检查是否可以合成
    this._checkMerge(chess);

    return { success: true, chess };
  }

  /** 刷新商店 */
  refreshShop() {
    if (!this.player.canAfford(this.config.REFRESH_COST)) {
      return { success: false, reason: '金币不足' };
    }
    this.player.spendGold(this.config.REFRESH_COST);
    this.shop.refresh(this.player.level);
    return { success: true };
  }

  /** 购买经验 */
  buyXp() {
    const leveled = this.player.buyXp();
    if (leveled === false && this.player.gold < this.config.BUY_XP_COST) {
      return { success: false, reason: '金币不足' };
    }
    this._recalcSynergies();
    return { success: true, leveled };
  }

  /** 将备战席棋子放到棋盘 */
  benchToBoard(benchIndex, row, col) {
    if (this.phase !== 'prep') return { success: false, reason: '非准备阶段' };

    const chess = this.player.bench[benchIndex];
    if (!chess) return { success: false, reason: '备战席该位置没有棋子' };

    // 检查上场数量限制
    const currentOnBoard = this.board.getUnitCount();
    if (currentOnBoard >= this.player.getMaxUnits()) {
      return { success: false, reason: '上场棋子已达上限' };
    }

    if (!this.board.placeUnit(chess, row, col)) {
      return { success: false, reason: '该位置已被占用' };
    }

    this.player.bench[benchIndex] = null;
    chess.benchIndex = -1;
    this._recalcSynergies();

    return { success: true };
  }

  /** 将棋盘棋子放回备战席 */
  boardToBench(row, col) {
    if (this.phase !== 'prep') return { success: false, reason: '非准备阶段' };

    const chess = this.board.removeUnit(row, col);
    if (!chess) return { success: false, reason: '该位置没有棋子' };

    const idx = this.player.addToBench(chess);
    if (idx === -1) {
      // 放不下，放回去
      this.board.placeUnit(chess, row, col);
      return { success: false, reason: '备战席已满' };
    }

    this._recalcSynergies();
    return { success: true };
  }

  /** 出售棋子(从备战席) */
  sellFromBench(benchIndex) {
    const chess = this.player.removeFromBench(benchIndex);
    if (!chess) return { success: false, reason: '没有棋子可出售' };
    this.player.addGold(chess.cost * chess.star);
    return { success: true, goldGained: chess.cost * chess.star };
  }

  /** 出售棋子(从棋盘) */
  sellFromBoard(row, col) {
    if (this.phase !== 'prep') return { success: false, reason: '非准备阶段' };
    const chess = this.board.removeUnit(row, col);
    if (!chess) return { success: false, reason: '没有棋子可出售' };
    this.player.addGold(chess.cost * chess.star);
    this._recalcSynergies();
    return { success: true, goldGained: chess.cost * chess.star };
  }

  /** 开始战斗 */
  startBattle() {
    this.phase = 'battle';
    const playerUnits = this.board.getAllUnits();

    // 创建战斗棋盘
    this.battleBoard = this.Board.createBattleBoard(
      playerUnits,
      this.enemyUnits,
      this.config.BOARD_COLS
    );

    // 应用羁绊加成到战斗单位
    const battlePlayerUnits = this.battleBoard.getAllUnits().filter(u => u.row < 4);
    this.synergy.applyBonuses(battlePlayerUnits, this.activeSynergies);

    this.currentBattle = new this.Battle(this.battleBoard, this.config.BOARD_COLS);

    if (this.onPhaseChange) {
      this.onPhaseChange('battle', this.round);
    }

    return this.currentBattle;
  }

  /** 战斗tick */
  battleTick() {
    if (!this.currentBattle || this.currentBattle.isFinished) return;
    this.currentBattle.tick();

    if (this.currentBattle.isFinished) {
      this._resolveBattle();
    }
  }

  /** 战斗结算 */
  _resolveBattle() {
    const result = this.currentBattle.winner;
    this.phase = 'result';

    if (result === 'player' || result === 'draw') {
      this.player.recordWin();
    } else {
      const damage = this.currentBattle.calculateDamage();
      const isDead = this.player.recordLoss(damage);

      if (isDead && this.onGameOver) {
        this.onGameOver(this.round);
        return;
      }
    }

    if (this.onBattleResult) {
      this.onBattleResult(result, this.round);
    }
  }

  /** 重新计算羁绊 */
  _recalcSynergies() {
    const units = this.board.getAllUnits();
    this.activeSynergies = this.synergy.calculateActiveSynergies(units);
  }

  /** 检查合成 */
  _checkMerge(newChess) {
    const allChess = [
      ...this.board.getAllUnits(),
      ...this.player.bench.filter(c => c !== null)
    ];

    const same = allChess.filter(
      c => c.id === newChess.id && c.star === newChess.star
    );

    if (same.length >= this.config.UNITS_TO_UPGRADE) {
      // 合成: 保留第一个，移除其他
      const keeper = same[0];
      const toRemove = same.slice(1, this.config.UNITS_TO_UPGRADE);

      for (const unit of toRemove) {
        if (unit.benchIndex >= 0) {
          this.player.bench[unit.benchIndex] = null;
        } else if (unit.row >= 0) {
          this.board.removeUnit(unit.row, unit.col);
        }
      }

      keeper.upgrade();
      this._recalcSynergies();

      // 递归检查是否可以继续合成
      this._checkMerge(keeper);
    }
  }

  /** 生成AI敌人棋子 */
  _generateEnemyUnits() {
    this.enemyUnits = [];
    // 敌人强度随回合增长
    const enemyCount = Math.min(this.round, this.config.BOARD_COLS);
    const maxCost = Math.min(5, Math.ceil(this.round / 3));

    for (let i = 0; i < enemyCount; i++) {
      const cost = Math.min(maxCost, Math.ceil(Math.random() * maxCost));
      const candidates = this.championData.filter(c => c.cost <= cost);
      const data = candidates[Math.floor(Math.random() * candidates.length)];
      const star = this.round >= 15 ? 2 : 1;
      const chess = new this.Chess(data, star);
      // 随机放置在棋盘上
      chess.row = Math.floor(Math.random() * 4);
      chess.col = i % this.config.BOARD_COLS;
      this.enemyUnits.push(chess);
    }
  }

  /** 获取游戏状态快照 */
  getState() {
    return {
      phase: this.phase,
      round: this.round,
      player: {
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        gold: this.player.gold,
        level: this.player.level,
        xp: this.player.xp,
        xpToLevel: this.player.getXpToLevel(),
        maxUnits: this.player.getMaxUnits(),
        winStreak: this.player.winStreak,
        loseStreak: this.player.loseStreak,
      },
      boardUnits: this.board.getAllUnits(),
      benchUnits: this.player.bench,
      shopSlots: this.shop.slots,
      shopLocked: this.shop.isLocked(),
      activeSynergies: this.activeSynergies,
      enemyUnits: this.enemyUnits,
    };
  }
}

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}
