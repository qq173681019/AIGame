/**
 * 游戏主场景 - 棋盘、英雄、商店、HUD渲染与交互
 */
var GameManager = require('../managers/game-manager');
var HUD = require('../ui/hud');
var ShopUI = require('../ui/shop-ui');

// 棋盘布局常量
var BOARD_ROWS = 4;
var BOARD_COLS = 7;
var BENCH_SLOTS = 8;

class GameScene {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    // 游戏管理器
    this.gameManager = new GameManager(canvas, ctx);

    // UI组件
    this.hud = new HUD();
    this.shopUI = new ShopUI();

    // 布局参数（根据画布尺寸动态计算）
    this.layout = this._calculateLayout();

    // 拖拽状态
    this.dragging = false;
    this.dragHero = null;
    this.dragSource = null; // { type: 'bench'|'board', index, row, col }
    this.dragX = 0;
    this.dragY = 0;

    // 动画状态
    this.battleAnimations = [];
    this.damageTexts = [];

    // 消息提示
    this.message = '';
    this.messageTimer = 0;
  }

  /**
   * 计算UI布局参数
   */
  _calculateLayout() {
    var w = this.canvasWidth;
    var h = this.canvasHeight;

    var hudHeight = 60;
    var shopHeight = 140;
    var boardAreaHeight = h - hudHeight - shopHeight - 80;

    var cellSize = Math.min(
      Math.floor((w - 40) / BOARD_COLS),
      Math.floor((boardAreaHeight - 60) / (BOARD_ROWS + 1.5))
    );

    var boardWidth = cellSize * BOARD_COLS;
    var boardHeight = cellSize * BOARD_ROWS;
    var boardX = (w - boardWidth) / 2;
    var boardY = hudHeight + 20;

    var benchY = boardY + boardHeight + 15;
    var benchCellSize = cellSize;
    var benchWidth = benchCellSize * BENCH_SLOTS;
    var benchX = (w - benchWidth) / 2;

    return {
      hudHeight: hudHeight,
      shopHeight: shopHeight,
      shopY: h - shopHeight,
      boardX: boardX,
      boardY: boardY,
      boardWidth: boardWidth,
      boardHeight: boardHeight,
      cellSize: cellSize,
      benchX: benchX,
      benchY: benchY,
      benchCellSize: benchCellSize
    };
  }

  /**
   * 初始化场景
   */
  init() {
    this.gameManager.init();
    // 监听游戏事件
    var self = this;
    this.gameManager.on('phaseChange', function(data) {
      if (data.phase === 'battle') {
        self.showMessage('⚔️ 战斗开始！');
      } else if (data.phase === 'prepare') {
        self.showMessage('第 ' + data.round + ' 回合 - 准备阶段');
      }
    });
    this.gameManager.on('gameOver', function(data) {
      self.showMessage(data.result === 'win' ? '🎉 胜利！' : '💀 失败！');
    });
  }

  /**
   * 显示提示消息
   */
  showMessage(text, duration) {
    this.message = text;
    this.messageTimer = duration || 2;
  }

  /**
   * 更新
   * @param {number} dt - 帧间隔（秒）
   */
  update(dt) {
    this.gameManager.update(dt);

    // 更新消息计时器
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) {
        this.message = '';
      }
    }

    // 更新伤害飘字
    for (var i = this.damageTexts.length - 1; i >= 0; i--) {
      this.damageTexts[i].y -= 30 * dt;
      this.damageTexts[i].alpha -= dt;
      if (this.damageTexts[i].alpha <= 0) {
        this.damageTexts.splice(i, 1);
      }
    }
  }

  /**
   * 渲染整个游戏场景
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  render(ctx, canvasWidth, canvasHeight) {
    var state = this.gameManager.getState();
    var layout = this.layout;

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 渲染HUD（顶部状态栏）
    this._renderHUD(ctx, state, canvasWidth);

    // 渲染棋盘
    this._renderBoard(ctx, state, layout);

    // 渲染备战席
    this._renderBench(ctx, state, layout);

    // 渲染商店（准备阶段）
    if (state.phase === 'prepare') {
      this._renderShop(ctx, state, layout, canvasWidth, canvasHeight);
    }

    // 渲染战斗动画
    if (state.phase === 'battle') {
      this._renderBattleEffects(ctx, state, layout);
    }

    // 渲染拖拽中的英雄
    if (this.dragging && this.dragHero) {
      this._renderHeroSprite(ctx, this.dragHero, this.dragX - layout.cellSize / 2, this.dragY - layout.cellSize / 2, layout.cellSize, 0.7);
    }

    // 渲染伤害飘字
    this._renderDamageTexts(ctx);

    // 渲染消息提示
    if (this.message) {
      this._renderMessage(ctx, canvasWidth, canvasHeight);
    }
  }

  /**
   * 渲染顶部HUD
   */
  _renderHUD(ctx, state, canvasWidth) {
    // HUD背景
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvasWidth, this.layout.hudHeight);

    ctx.font = '14px Arial';
    ctx.textBaseline = 'middle';
    var y = this.layout.hudHeight / 2;

    // 回合数
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText('回合 ' + state.round, 10, y);

    // 阶段与倒计时
    var phaseText = state.phase === 'prepare' ? '准备阶段' :
                    state.phase === 'battle' ? '战斗中' : '结算中';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(phaseText + (state.phaseTimer > 0 ? ' ' + state.phaseTimer + 's' : ''), canvasWidth / 2, y);

    // 玩家信息
    if (state.player) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FF4444';
      ctx.fillText('❤️ ' + state.player.hp, canvasWidth - 80, y);
      ctx.fillStyle = '#FFD700';
      ctx.fillText('💰 ' + state.player.gold, canvasWidth - 10, y);

      // 等级
      ctx.textAlign = 'left';
      ctx.fillStyle = '#88CCFF';
      ctx.fillText('Lv.' + state.player.level, 100, y);
    }
  }

  /**
   * 渲染棋盘网格
   */
  _renderBoard(ctx, state, layout) {
    var cs = layout.cellSize;

    for (var row = 0; row < BOARD_ROWS; row++) {
      for (var col = 0; col < BOARD_COLS; col++) {
        var x = layout.boardX + col * cs;
        var y = layout.boardY + row * cs;

        // 交替颜色棋盘格
        var isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ? '#2d5016' : '#1e3a0e';
        ctx.fillRect(x, y, cs, cs);

        // 格子边框
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(x, y, cs, cs);

        // 渲染棋盘上的英雄
        if (state.player && state.player.board) {
          var hero = state.player.board.getHero
            ? state.player.board.getHero(row, col)
            : (state.player.board.grid && state.player.board.grid[row] && state.player.board.grid[row][col]);
          if (hero) {
            this._renderHeroSprite(ctx, hero, x + 2, y + 2, cs - 4, 1.0);
          }
        }
      }
    }

    // 棋盘边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(layout.boardX, layout.boardY, layout.boardWidth, layout.boardHeight);
    ctx.lineWidth = 1;
  }

  /**
   * 渲染备战席
   */
  _renderBench(ctx, state, layout) {
    var cs = layout.benchCellSize;

    for (var i = 0; i < BENCH_SLOTS; i++) {
      var x = layout.benchX + i * cs;
      var y = layout.benchY;

      // 备战席格子背景
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(x, y, cs, cs);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.strokeRect(x, y, cs, cs);

      // 渲染备战席英雄
      if (state.player && state.player.bench) {
        var hero = state.player.bench[i];
        if (hero) {
          this._renderHeroSprite(ctx, hero, x + 2, y + 2, cs - 4, 1.0);
        }
      }
    }

    // 备战席标签
    ctx.fillStyle = '#888888';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('备战席', layout.benchX + (cs * BENCH_SLOTS) / 2, layout.benchY + cs + 14);
  }

  /**
   * 渲染英雄精灵（彩色圆形 + 名字 + 星级 + 血量）
   */
  _renderHeroSprite(ctx, hero, x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha || 1.0;

    var cx = x + size / 2;
    var cy = y + size / 2;
    var radius = size * 0.4;

    // 品质颜色映射
    var costColors = {
      1: '#AAAAAA', // 灰色 - 1费
      2: '#55AA55', // 绿色 - 2费
      3: '#5555FF', // 蓝色 - 3费
      4: '#AA55AA', // 紫色 - 4费
      5: '#FFAA00'  // 橙色 - 5费
    };
    var color = costColors[hero.cost] || '#AAAAAA';

    // 英雄圆形底色
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 星级标记（上方）
    var stars = hero.star || hero.stars || 1;
    ctx.fillStyle = '#FFD700';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    var starStr = '';
    for (var s = 0; s < stars; s++) starStr += '★';
    ctx.fillText(starStr, cx, y + size * 0.15);

    // 英雄名字（中间）
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold ' + Math.max(9, size * 0.18) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var name = hero.name || '?';
    if (name.length > 3) name = name.substring(0, 3);
    ctx.fillText(name, cx, cy);

    // 血量条（下方）
    var hpRatio = (hero.hp || hero.currentHp || 0) / (hero.maxHp || hero.baseHp || 1);
    hpRatio = Math.max(0, Math.min(1, hpRatio));
    var barWidth = size * 0.7;
    var barHeight = 4;
    var barX = cx - barWidth / 2;
    var barY = y + size * 0.82;

    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = hpRatio > 0.5 ? '#44CC44' : hpRatio > 0.25 ? '#CCCC44' : '#CC4444';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    ctx.restore();
  }

  /**
   * 渲染商店UI
   */
  _renderShop(ctx, state, layout, canvasWidth, canvasHeight) {
    var shopY = layout.shopY;
    var shopH = layout.shopHeight;

    // 商店背景
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, shopY, canvasWidth, shopH);

    // 商店标题栏
    ctx.fillStyle = '#333344';
    ctx.fillRect(0, shopY, canvasWidth, 28);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛒 商店', 10, shopY + 14);

    // 刷新按钮
    ctx.fillStyle = '#4488CC';
    ctx.fillRect(canvasWidth - 150, shopY + 2, 65, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('刷新 2💰', canvasWidth - 150 + 32, shopY + 14);

    // 买经验按钮
    ctx.fillStyle = '#44AA44';
    ctx.fillRect(canvasWidth - 78, shopY + 2, 72, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('买经验 4💰', canvasWidth - 78 + 36, shopY + 14);

    // 商店英雄卡片
    if (state.player && state.player.shop && state.player.shop.slots) {
      var slots = state.player.shop.slots;
      var cardWidth = Math.min(80, (canvasWidth - 40) / 5 - 8);
      var cardHeight = shopH - 45;
      var startX = (canvasWidth - (cardWidth + 8) * slots.length + 8) / 2;

      for (var i = 0; i < slots.length; i++) {
        var hero = slots[i];
        if (!hero) continue;

        var cx = startX + i * (cardWidth + 8);
        var cy = shopY + 33;

        // 卡片背景
        var costBg = {1:'#3a3a3a', 2:'#2a3a2a', 3:'#2a2a4a', 4:'#3a2a3a', 5:'#3a3a1a'};
        ctx.fillStyle = costBg[hero.cost] || '#3a3a3a';
        ctx.fillRect(cx, cy, cardWidth, cardHeight);
        ctx.strokeStyle = '#666666';
        ctx.strokeRect(cx, cy, cardWidth, cardHeight);

        // 英雄图标
        this._renderHeroSprite(ctx, hero, cx + 5, cy + 5, cardWidth - 10, 1.0);

        // 费用
        ctx.fillStyle = '#FFD700';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(hero.cost + '💰', cx + cardWidth / 2, cy + cardHeight - 8);
      }
    }
  }

  /**
   * 渲染战斗特效
   */
  _renderBattleEffects(ctx, state, layout) {
    // 战斗中的闪烁边框
    var alpha = 0.3 + 0.3 * Math.sin(Date.now() / 200);
    ctx.strokeStyle = 'rgba(255, 50, 50, ' + alpha + ')';
    ctx.lineWidth = 3;
    ctx.strokeRect(layout.boardX - 2, layout.boardY - 2, layout.boardWidth + 4, layout.boardHeight + 4);
    ctx.lineWidth = 1;

    // 战斗状态文字
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚔️ 战斗进行中...', this.canvasWidth / 2, layout.boardY - 8);
  }

  /**
   * 渲染伤害飘字
   */
  _renderDamageTexts(ctx) {
    for (var i = 0; i < this.damageTexts.length; i++) {
      var dt = this.damageTexts[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, dt.alpha);
      ctx.fillStyle = dt.color || '#FF4444';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dt.text, dt.x, dt.y);
      ctx.restore();
    }
  }

  /**
   * 渲染消息提示
   */
  _renderMessage(ctx, canvasWidth, canvasHeight) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.messageTimer);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(canvasWidth * 0.1, canvasHeight * 0.4, canvasWidth * 0.8, 50);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.message, canvasWidth / 2, canvasHeight * 0.4 + 25);
    ctx.restore();
  }

  // ========== 触摸事件处理 ==========

  /**
   * 处理触摸/点击事件
   * @param {number} x
   * @param {number} y
   * @returns {string|null} 动作字符串
   */
  handleTouch(x, y) {
    var state = this.gameManager.getState();
    var layout = this.layout;

    // 准备阶段处理商店点击
    if (state.phase === 'prepare') {
      // 检查刷新按钮
      if (y >= layout.shopY && y <= layout.shopY + 28) {
        if (x >= this.canvasWidth - 150 && x <= this.canvasWidth - 85) {
          this.gameManager.refreshShop();
          return 'refreshShop';
        }
        if (x >= this.canvasWidth - 78 && x <= this.canvasWidth - 6) {
          this.gameManager.buyXP();
          return 'buyXP';
        }
      }

      // 检查商店英雄点击（购买）
      if (y >= layout.shopY + 33 && state.player && state.player.shop && state.player.shop.slots) {
        var slots = state.player.shop.slots;
        var cardWidth = Math.min(80, (this.canvasWidth - 40) / 5 - 8);
        var startX = (this.canvasWidth - (cardWidth + 8) * slots.length + 8) / 2;
        for (var i = 0; i < slots.length; i++) {
          var cx = startX + i * (cardWidth + 8);
          if (x >= cx && x <= cx + cardWidth) {
            this.gameManager.buyHero(i);
            return 'buyHero';
          }
        }
      }

      // 检查备战席英雄点击
      var cs = layout.benchCellSize;
      if (y >= layout.benchY && y <= layout.benchY + cs) {
        var benchIdx = Math.floor((x - layout.benchX) / cs);
        if (benchIdx >= 0 && benchIdx < BENCH_SLOTS) {
          // 选中备战席英雄（后续可拖拽到棋盘）
          if (state.player && state.player.bench && state.player.bench[benchIdx]) {
            this.dragSource = { type: 'bench', index: benchIdx };
            this.dragHero = state.player.bench[benchIdx];
            return 'selectBenchHero';
          }
        }
      }

      // 检查棋盘格点击
      if (x >= layout.boardX && x <= layout.boardX + layout.boardWidth &&
          y >= layout.boardY && y <= layout.boardY + layout.boardHeight) {
        var col = Math.floor((x - layout.boardX) / layout.cellSize);
        var row = Math.floor((y - layout.boardY) / layout.cellSize);
        if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
          // 如果已选中备战席英雄，则放置到棋盘
          if (this.dragSource && this.dragSource.type === 'bench') {
            this.gameManager.benchToBoard(this.dragSource.index, row, col);
            this.dragSource = null;
            this.dragHero = null;
            return 'placeHero';
          }
          // 否则选中棋盘英雄（可下场或卖出）
          return 'selectBoardCell';
        }
      }
    }

    return null;
  }

  /**
   * 处理触摸释放
   */
  handleTouchEnd(x, y) {
    if (this.dragging && this.dragSource) {
      var layout = this.layout;
      // 检查是否释放在棋盘上
      if (x >= layout.boardX && x <= layout.boardX + layout.boardWidth &&
          y >= layout.boardY && y <= layout.boardY + layout.boardHeight) {
        var col = Math.floor((x - layout.boardX) / layout.cellSize);
        var row = Math.floor((y - layout.boardY) / layout.cellSize);
        if (this.dragSource.type === 'bench') {
          this.gameManager.benchToBoard(this.dragSource.index, row, col);
        }
      }
    }
    this.dragging = false;
    this.dragSource = null;
    this.dragHero = null;
  }

  /**
   * 处理触摸移动（拖拽）
   */
  handleTouchMove(x, y) {
    if (this.dragSource) {
      this.dragging = true;
      this.dragX = x;
      this.dragY = y;
    }
  }

  /**
   * 检查游戏是否结束
   */
  isGameOver() {
    return this.gameManager.isGameOver;
  }

  /**
   * 获取游戏结果
   */
  getGameResult() {
    return {
      result: this.gameManager.gameResult,
      stats: this.gameManager.stats,
      round: this.gameManager.round,
      player: this.gameManager.player
    };
  }

  /**
   * 销毁场景
   */
  destroy() {
    this.gameManager.destroy();
  }
}

module.exports = GameScene;
