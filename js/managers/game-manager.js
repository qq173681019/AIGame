/**
 * 游戏管理器 - 控制游戏主循环、阶段切换、回合管理
 */
var EventEmitter = require('../base/event-emitter');
var Player = require('../game/player');
var Battle = require('../game/battle');
var AdManager = require('./ad-manager');
var GameConfig = require('../config/game-config');

// 游戏阶段枚举
var PHASE = {
  PREPARE: 'prepare',   // 准备阶段：买卖英雄、布阵
  BATTLE: 'battle',     // 战斗阶段：自动战斗
  RESULT: 'result'      // 结算阶段：显示本回合结果
};

class GameManager extends EventEmitter {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  constructor(canvas, ctx) {
    super();
    this.canvas = canvas;
    this.ctx = ctx;

    // 游戏状态
    this.phase = PHASE.PREPARE;
    this.round = 1;
    this.maxRounds = 30;
    this.isGameOver = false;
    this.gameResult = null; // 'win' | 'lose'

    // 阶段计时器（秒）
    this.phaseTimer = 30;
    this.prepareTime = 30;
    this.resultTime = 3;

    // 玩家与AI对手
    this.player = null;
    this.opponent = null;

    // 战斗系统
    this.battle = null;
    this.battleResult = null;

    // 广告管理器
    this.adManager = new AdManager({
      bannerId: (GameConfig.ads && GameConfig.ads.bannerId) || '',
      videoId: (GameConfig.ads && GameConfig.ads.videoId) || '',
      interstitialId: (GameConfig.ads && GameConfig.ads.interstitialId) || ''
    });

    // 选中状态（用于拖拽英雄）
    this.selectedHero = null;
    this.selectedSource = null; // 'bench' | 'board'
    this.selectedIndex = -1;

    // 统计数据
    this.stats = {
      totalHeroesBought: 0,
      totalBattlesWon: 0,
      totalBattlesLost: 0,
      totalGoldEarned: 0
    };
  }

  /**
   * 初始化游戏
   */
  init() {
    // 创建玩家
    this.player = new Player('玩家');
    this.opponent = new Player('AI对手');

    // 初始化广告
    this.adManager.init();

    // 开始第一回合准备阶段
    this.startPreparePhase();

    this.emit('gameInit');
  }

  /**
   * 开始准备阶段
   */
  startPreparePhase() {
    this.phase = PHASE.PREPARE;
    this.phaseTimer = this.prepareTime;

    // 玩家获得收入
    this.player.receiveIncome();
    this.stats.totalGoldEarned += this.player.gold;

    // 刷新商店
    this.player.refreshShop();

    // AI生成阵容
    this.opponent.generateAIArmy(this.round);

    // 每3回合尝试展示插屏广告
    if (this.round > 1 && this.round % 3 === 0) {
      this.adManager.showInterstitial();
    }

    this.emit('phaseChange', { phase: this.phase, round: this.round });
  }

  /**
   * 开始战斗阶段
   */
  startBattlePhase() {
    this.phase = PHASE.BATTLE;
    this.phaseTimer = 0;

    // 更新羁绊
    this.player.updateSynergies();
    this.opponent.updateSynergies();

    // 创建战斗实例
    this.battle = new Battle(this.player, this.opponent);
    this.battle.start();

    this.emit('phaseChange', { phase: this.phase, round: this.round });
  }

  /**
   * 开始结算阶段
   */
  startResultPhase(result) {
    this.phase = PHASE.RESULT;
    this.phaseTimer = this.resultTime;
    this.battleResult = result;

    // 更新统计
    if (result === 'win') {
      this.stats.totalBattlesWon++;
      this.player.recordResult(true);
    } else {
      this.stats.totalBattlesLost++;
      this.player.recordResult(false);
      // 失败扣血
      var damage = this._calculateDamage();
      this.player.takeDamage(damage);
    }

    // 检查游戏结束
    if (this.player.hp <= 0) {
      this.isGameOver = true;
      this.gameResult = 'lose';
      this.emit('gameOver', { result: 'lose', stats: this.stats });
      return;
    }
    if (this.round >= this.maxRounds) {
      this.isGameOver = true;
      this.gameResult = 'win';
      this.emit('gameOver', { result: 'win', stats: this.stats });
      return;
    }

    this.emit('phaseChange', { phase: this.phase, round: this.round });
  }

  /**
   * 计算战斗失败伤害
   */
  _calculateDamage() {
    var baseDamage = 2;
    var roundBonus = Math.floor(this.round / 5);
    return baseDamage + roundBonus;
  }

  /**
   * 进入下一回合
   */
  nextRound() {
    this.round++;
    this.battle = null;
    this.battleResult = null;
    this.startPreparePhase();
  }

  /**
   * 主更新循环
   * @param {number} dt - 帧间隔时间（秒）
   */
  update(dt) {
    if (this.isGameOver) return;

    switch (this.phase) {
      case PHASE.PREPARE:
        // 准备阶段倒计时
        this.phaseTimer -= dt;
        if (this.phaseTimer <= 0) {
          this.startBattlePhase();
        }
        break;

      case PHASE.BATTLE:
        // 战斗阶段更新
        if (this.battle) {
          this.battle.update(dt);
          if (this.battle.isFinished()) {
            var result = this.battle.getResult();
            this.startResultPhase(result);
          }
        }
        break;

      case PHASE.RESULT:
        // 结算阶段倒计时
        this.phaseTimer -= dt;
        if (this.phaseTimer <= 0) {
          this.nextRound();
        }
        break;
    }
  }

  /**
   * 主渲染循环
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    // 由外部场景负责具体渲染，此处提供状态数据
  }

  // ========== 玩家操作接口 ==========

  /**
   * 购买英雄
   * @param {number} shopIndex - 商店槽位索引
   * @returns {boolean}
   */
  buyHero(shopIndex) {
    if (this.phase !== PHASE.PREPARE) return false;
    var result = this.player.buyHero(shopIndex);
    if (result) {
      this.stats.totalHeroesBought++;
      this.emit('heroBought', { index: shopIndex });
    }
    return result;
  }

  /**
   * 从备战席卖出英雄
   * @param {number} benchIndex
   * @returns {boolean}
   */
  sellBenchHero(benchIndex) {
    if (this.phase !== PHASE.PREPARE) return false;
    return this.player.sellFromBench(benchIndex);
  }

  /**
   * 从棋盘卖出英雄
   * @param {number} row
   * @param {number} col
   * @returns {boolean}
   */
  sellBoardHero(row, col) {
    if (this.phase !== PHASE.PREPARE) return false;
    return this.player.sellFromBoard(row, col);
  }

  /**
   * 备战席英雄上场
   * @param {number} benchIndex
   * @param {number} row
   * @param {number} col
   * @returns {boolean}
   */
  benchToBoard(benchIndex, row, col) {
    if (this.phase !== PHASE.PREPARE) return false;
    return this.player.benchToBoard(benchIndex, row, col);
  }

  /**
   * 棋盘英雄下场到备战席
   * @param {number} row
   * @param {number} col
   * @returns {boolean}
   */
  boardToBench(row, col) {
    if (this.phase !== PHASE.PREPARE) return false;
    return this.player.boardToBench(row, col);
  }

  /**
   * 刷新商店
   * @returns {boolean}
   */
  refreshShop() {
    if (this.phase !== PHASE.PREPARE) return false;
    return this.player.refreshShop();
  }

  /**
   * 使用免费刷新
   * @returns {boolean}
   */
  freeRoll() {
    if (this.phase !== PHASE.PREPARE) return false;
    return this.player.freeRoll();
  }

  /**
   * 购买经验
   * @returns {boolean}
   */
  buyXP() {
    if (this.phase !== PHASE.PREPARE) return false;
    return this.player.buyXP();
  }

  /**
   * 观看广告获取额外金币
   * @param {Function} callback
   */
  watchAdForGold(callback) {
    this.adManager.showRewardedVideo(function(rewarded) {
      if (rewarded) {
        // 奖励2金币
        if (callback) callback(true, 2);
      } else {
        if (callback) callback(false, 0);
      }
    });
  }

  /**
   * 获取当前游戏状态（供渲染使用）
   */
  getState() {
    return {
      phase: this.phase,
      round: this.round,
      phaseTimer: Math.ceil(this.phaseTimer),
      player: this.player,
      opponent: this.opponent,
      battle: this.battle,
      battleResult: this.battleResult,
      isGameOver: this.isGameOver,
      gameResult: this.gameResult,
      stats: this.stats
    };
  }

  /**
   * 重置游戏
   */
  reset() {
    this.phase = PHASE.PREPARE;
    this.round = 1;
    this.isGameOver = false;
    this.gameResult = null;
    this.battle = null;
    this.battleResult = null;
    this.selectedHero = null;
    this.stats = {
      totalHeroesBought: 0,
      totalBattlesWon: 0,
      totalBattlesLost: 0,
      totalGoldEarned: 0
    };
    this.init();
  }

  /**
   * 销毁管理器，释放资源
   */
  destroy() {
    this.adManager.destroy();
    this.removeAllListeners();
  }
}

// 导出阶段常量
GameManager.PHASE = PHASE;

module.exports = GameManager;
