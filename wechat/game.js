/**
 * 微信小游戏入口文件 - WeChat Mini Game Entry
 *
 * 使用说明:
 * 1. 将 game/ 目录下的 js/ 和 css/ 文件复制到微信小游戏项目中
 * 2. 在微信开发者工具中打开 wechat/ 目录
 * 3. 配置 project.config.json 中的 appid
 * 4. 配置 GameConfig 中的广告位 ID
 */

// 引入游戏模块
require('./js/config.js');
require('./js/data/champions.js');
require('./js/data/synergies.js');
require('./js/core/Chess.js');
require('./js/core/Board.js');
require('./js/core/Player.js');
require('./js/core/Shop.js');
require('./js/core/Synergy.js');
require('./js/core/Battle.js');
require('./js/core/GameEngine.js');
require('./js/ads/AdManager.js');

// 微信小游戏 Canvas 适配
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 设置画布尺寸
const systemInfo = wx.getSystemInfoSync();
canvas.width = systemInfo.windowWidth * systemInfo.pixelRatio;
canvas.height = systemInfo.windowHeight * systemInfo.pixelRatio;

// 游戏配置适配
GameConfig.CANVAS_WIDTH = systemInfo.windowWidth;
GameConfig.CANVAS_HEIGHT = systemInfo.windowHeight;

// 初始化游戏引擎
const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
  Board, Chess, Player, Shop, Battle, Synergy
});

// 初始化广告
const adManager = new AdManager(GameConfig);
adManager.init();

// 简化的渲染器(微信小游戏版)
class WxRenderer {
  constructor(canvas, ctx, config) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.config = config;
    this.C = config.COLORS;
    this.scale = systemInfo.pixelRatio;
  }

  render(state) {
    const ctx = this.ctx;
    const w = this.canvas.width / this.scale;
    const h = this.canvas.height / this.scale;
    ctx.save();
    ctx.scale(this.scale, this.scale);

    // 清屏
    ctx.fillStyle = this.C.BACKGROUND;
    ctx.fillRect(0, 0, w, h);

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, 50);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = this.C.TEXT_WHITE;
    ctx.textAlign = 'left';
    ctx.fillText(`回合${state.round} | ❤️${state.player.hp} | 💰${state.player.gold} | Lv.${state.player.level}`, 10, 32);

    // 商店
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, h - 150, w, 150);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = this.C.GOLD;
    ctx.textAlign = 'center';
    ctx.fillText('🏪 点击购买棋子', w / 2, h - 130);

    const slotW = (w - 30) / 5;
    for (let i = 0; i < 5; i++) {
      const sx = 10 + i * (slotW + 4);
      const sy = h - 115;
      const ch = state.shopSlots[i];

      ctx.fillStyle = '#2a2a45';
      ctx.fillRect(sx, sy, slotW, 80);

      if (ch) {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ch.emoji, sx + slotW / 2, sy + 35);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = this.C.TEXT_WHITE;
        ctx.fillText(ch.name, sx + slotW / 2, sy + 55);
        ctx.fillStyle = this.C.GOLD;
        ctx.fillText(`💰${ch.cost}`, sx + slotW / 2, sy + 70);
      }
    }

    // 棋盘
    const boardY = 60;
    const cellSize = Math.min(50, (w - 20) / 7);
    const boardX = (w - cellSize * 7) / 2;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 7; c++) {
        const x = boardX + c * cellSize;
        const y = boardY + r * cellSize;
        ctx.fillStyle = (r + c) % 2 === 0 ? this.C.BOARD_LIGHT : this.C.BOARD_DARK;
        ctx.fillRect(x, y, cellSize - 2, cellSize - 2);

        const unit = state.boardUnits.find(u => u.row === r && u.col === c);
        if (unit) {
          ctx.font = `${cellSize * 0.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(unit.emoji, x + cellSize / 2, y + cellSize * 0.6);
        }
      }
    }

    ctx.restore();
  }
}

const renderer = new WxRenderer(canvas, ctx, GameConfig);

// 游戏循环
let showMenu = true;
let gameOver = false;
let battleTimer = null;

engine.onPhaseChange = (phase) => {
  if (phase === 'battle') {
    battleTimer = setInterval(() => {
      if (engine.currentBattle && !engine.currentBattle.isFinished) {
        engine.battleTick();
      }
    }, GameConfig.BATTLE_TICK_MS);
  }
};

engine.onBattleResult = () => {
  if (battleTimer) { clearInterval(battleTimer); battleTimer = null; }
};

engine.onGameOver = () => {
  gameOver = true;
  if (battleTimer) { clearInterval(battleTimer); battleTimer = null; }
  adManager.showInterstitial();
};

function gameLoop() {
  if (!showMenu && !gameOver) {
    renderer.render(engine.getState());
  }
  requestAnimationFrame(gameLoop);
}

// 触摸处理
wx.onTouchStart((e) => {
  const touch = e.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;
  const h = systemInfo.windowHeight;

  if (showMenu) {
    showMenu = false;
    engine.init();
    adManager.showBanner();
    return;
  }

  if (gameOver) {
    gameOver = false;
    engine.init();
    return;
  }

  // 简单的商店点击检测
  if (y > h - 150) {
    const slotW = (systemInfo.windowWidth - 30) / 5;
    const slotIdx = Math.floor((x - 10) / (slotW + 4));
    if (slotIdx >= 0 && slotIdx < 5) {
      engine.buyChampion(slotIdx);
      // 自动放到棋盘空位
      const benchUnits = engine.player.bench.filter(b => b !== null);
      if (benchUnits.length > 0) {
        const lastBench = benchUnits[benchUnits.length - 1];
        const idx = engine.player.bench.indexOf(lastBench);
        const emptyCells = engine.board.getEmptyCells();
        if (emptyCells.length > 0 && engine.board.getUnitCount() < engine.player.getMaxUnits()) {
          engine.benchToBoard(idx, emptyCells[0].row, emptyCells[0].col);
        }
      }
    }
    return;
  }

  // 战斗结束时点击继续
  if (engine.phase === 'battle' && engine.currentBattle && engine.currentBattle.isFinished) {
    engine.startNewRound();
    return;
  }

  if (engine.phase === 'prep' && engine.board.getUnitCount() > 0) {
    engine.startBattle();
  }
});

// 显示Banner广告
adManager.showBanner();

// 启动游戏循环
gameLoop();

console.log('[AutoChess] WeChat Mini Game initialized!');
