/**
 * 主入口 - Main Game Entry
 * 初始化游戏并连接所有模块
 */
(function () {
  'use strict';

  // 等待 DOM 加载
  function startGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }

    // 创建游戏引擎
    const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
      Board, Chess, Player, Shop, Battle, Synergy
    });

    // 创建UI
    const ui = new UIManager(canvas, GameConfig);

    // 创建广告管理器
    const adManager = new AdManager(GameConfig);
    adManager.init();

    // 游戏状态
    let animFrameId = null;
    let battleTimer = null;
    let gameStarted = false;
    let gameOver = false;
    let showingMenu = true;

    // ===== 事件回调 =====
    engine.onPhaseChange = (phase, round) => {
      if (phase === 'battle') {
        startBattleAnimation();
      }
      // 每3回合显示一次插屏广告
      if (phase === 'prep' && round > 1 && round % 3 === 0) {
        adManager.showInterstitial();
      }
    };

    engine.onBattleResult = (result, round) => {
      stopBattleAnimation();
    };

    engine.onGameOver = (round) => {
      gameOver = true;
      stopBattleAnimation();
      adManager.showInterstitial();
    };

    // ===== 渲染循环 =====
    function gameLoop() {
      if (showingMenu) {
        renderMenu();
      } else if (gameOver) {
        renderGameOver();
      } else if (engine.phase === 'battle' && engine.currentBattle) {
        ui.renderBattle(engine.getState(), engine.currentBattle);
      } else {
        ui.render(engine.getState());
      }
      animFrameId = requestAnimationFrame(gameLoop);
    }

    function renderMenu() {
      const ctx = ui.ctx;
      const C = GameConfig.COLORS;

      ctx.fillStyle = C.BACKGROUND;
      ctx.fillRect(0, 0, 750, 1334);

      // 标题
      ctx.font = 'bold 48px sans-serif';
      ctx.fillStyle = C.GOLD;
      ctx.textAlign = 'center';
      ctx.fillText('⚔️ 自走棋大战 ⚔️', 375, 350);

      ctx.font = '24px sans-serif';
      ctx.fillStyle = C.TEXT_WHITE;
      ctx.fillText('Auto Chess Battle', 375, 400);

      // 游戏说明
      ctx.font = '18px sans-serif';
      ctx.fillStyle = C.TEXT_GRAY;
      ctx.fillText('购买棋子 → 布置阵容 → 自动战斗', 375, 480);
      ctx.fillText('相同棋子x3自动合成升星', 375, 510);
      ctx.fillText('激活羁绊获得强力加成', 375, 540);

      // 开始按钮
      ctx.fillStyle = C.GOLD;
      ctx.beginPath();
      ctx.roundRect(250, 620, 250, 60, 12);
      ctx.fill();

      ctx.fillStyle = C.BACKGROUND;
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('🎮 开始游戏', 375, 660);

      // 版本信息
      ctx.font = '14px sans-serif';
      ctx.fillStyle = C.TEXT_GRAY;
      ctx.fillText('v1.0.0 | 支持微信小游戏 & Web平台', 375, 750);
      ctx.fillText('展示广告已集成', 375, 775);
    }

    function renderGameOver() {
      const ctx = ui.ctx;
      const C = GameConfig.COLORS;
      const state = engine.getState();

      ctx.fillStyle = C.BACKGROUND;
      ctx.fillRect(0, 0, 750, 1334);

      ctx.font = 'bold 42px sans-serif';
      ctx.fillStyle = '#f44336';
      ctx.textAlign = 'center';
      ctx.fillText('💀 游戏结束 💀', 375, 400);

      ctx.font = '24px sans-serif';
      ctx.fillStyle = C.TEXT_WHITE;
      ctx.fillText(`坚持了 ${state.round} 回合`, 375, 460);
      ctx.fillText(`最终等级: Lv.${state.player.level}`, 375, 500);

      // 观看广告获得奖励
      ctx.fillStyle = '#4a90d9';
      ctx.beginPath();
      ctx.roundRect(200, 560, 350, 50, 10);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('🎬 看广告复活 (+30HP)', 375, 592);

      // 重新开始
      ctx.fillStyle = C.GOLD;
      ctx.beginPath();
      ctx.roundRect(250, 640, 250, 50, 10);
      ctx.fill();
      ctx.fillStyle = C.BACKGROUND;
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('🔄 重新开始', 375, 672);
    }

    // ===== 战斗动画 =====
    function startBattleAnimation() {
      if (battleTimer) return;
      battleTimer = setInterval(() => {
        if (engine.currentBattle && !engine.currentBattle.isFinished) {
          engine.battleTick();
        }
      }, GameConfig.BATTLE_TICK_MS);
    }

    function stopBattleAnimation() {
      if (battleTimer) {
        clearInterval(battleTimer);
        battleTimer = null;
      }
    }

    // ===== 输入处理 =====
    function handleClick(e) {
      const touch = e.touches ? e.touches[0] : e;
      const pos = ui.screenToCanvas(touch.clientX, touch.clientY);

      if (showingMenu) {
        // 检查开始按钮
        if (pos.x >= 250 && pos.x <= 500 && pos.y >= 620 && pos.y <= 680) {
          showingMenu = false;
          gameStarted = true;
          engine.init();
          adManager.showBanner();
        }
        return;
      }

      if (gameOver) {
        // 观看广告复活
        if (pos.x >= 200 && pos.x <= 550 && pos.y >= 560 && pos.y <= 610) {
          adManager.showRewarded(
            () => {
              // 广告看完，复活
              engine.player.hp = 30;
              gameOver = false;
              engine.startNewRound();
            },
            () => {}
          );
          return;
        }
        // 重新开始
        if (pos.x >= 250 && pos.x <= 500 && pos.y >= 640 && pos.y <= 690) {
          gameOver = false;
          engine.init();
        }
        return;
      }

      // 战斗阶段 - 点击继续
      if (engine.phase === 'battle' && engine.currentBattle && engine.currentBattle.isFinished) {
        stopBattleAnimation();
        engine.startNewRound();
        return;
      }

      if (engine.phase === 'result') {
        engine.startNewRound();
        return;
      }

      // 准备阶段
      if (engine.phase === 'prep') {
        // 商店按钮
        const btn = ui.canvasToButton(pos.x, pos.y);
        if (btn === 'refresh') {
          engine.refreshShop();
          return;
        }
        if (btn === 'lock') {
          engine.shop.toggleLock();
          return;
        }
        if (btn === 'buyxp') {
          engine.buyXp();
          return;
        }
        if (btn === 'battle') {
          if (engine.board.getUnitCount() > 0) {
            engine.startBattle();
          }
          return;
        }

        // 商店购买
        const shopSlot = ui.canvasToShop(pos.x, pos.y);
        if (shopSlot >= 0) {
          engine.buyChampion(shopSlot);
          return;
        }

        // 备战席 → 棋盘 (点击备战席选中，再点棋盘放置)
        const benchIdx = ui.canvasToBench(pos.x, pos.y);
        if (benchIdx >= 0) {
          if (ui.selectedUnit && ui.selectedUnit.source === 'board') {
            // 从棋盘放回备战席
            engine.boardToBench(ui.selectedUnit.row, ui.selectedUnit.col);
            ui.selectedUnit = null;
          } else if (engine.player.bench[benchIdx]) {
            // 选中备战席棋子
            ui.selectedUnit = { source: 'bench', index: benchIdx };
          }
          return;
        }

        // 棋盘点击
        const cell = ui.canvasToBoard(pos.x, pos.y);
        if (cell) {
          if (ui.selectedUnit && ui.selectedUnit.source === 'bench') {
            // 将备战席棋子放到棋盘
            const result = engine.benchToBoard(ui.selectedUnit.index, cell.row, cell.col);
            if (result.success) {
              ui.selectedUnit = null;
              ui.highlightCell = null;
            }
          } else {
            // 选中棋盘上的棋子或取消
            const unit = engine.board.getUnit(cell.row, cell.col);
            if (unit) {
              ui.selectedUnit = { source: 'board', row: cell.row, col: cell.col };
              ui.highlightCell = cell;
            } else if (ui.selectedUnit && ui.selectedUnit.source === 'board') {
              // 移动棋盘上的棋子到空格
              engine.board.moveUnit(ui.selectedUnit.row, ui.selectedUnit.col, cell.row, cell.col);
              ui.selectedUnit = null;
              ui.highlightCell = null;
            } else {
              ui.selectedUnit = null;
              ui.highlightCell = null;
            }
          }
          return;
        }

        // 点击其他区域取消选中
        ui.selectedUnit = null;
        ui.highlightCell = null;
      }
    }

    // 绑定事件
    canvas.addEventListener('click', handleClick);

    // 触摸事件(含长按出售)
    let longPressTimer = null;
    let longPressTriggered = false;
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      longPressTriggered = false;

      // 检查备战席长按出售
      const touch = e.touches[0];
      const pos = ui.screenToCanvas(touch.clientX, touch.clientY);
      const benchIdx = ui.canvasToBench(pos.x, pos.y);
      if (benchIdx >= 0 && engine.player.bench[benchIdx]) {
        longPressTimer = setTimeout(() => {
          longPressTriggered = true;
          engine.sellFromBench(benchIdx);
        }, 800);
      }

      handleClick(e);
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });

    // 启动渲染循环
    gameLoop();

    console.log('[AutoChess] Game initialized successfully!');
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
  } else {
    startGame();
  }
})();
