/**
 * UI管理器 - UIManager
 * 使用Canvas渲染游戏界面
 */
class UIManager {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} config - GameConfig
   */
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.C = config.COLORS;

    // 适配屏幕
    this._resize();
    window.addEventListener('resize', () => this._resize());

    // 触摸/点击状态
    this.selectedUnit = null;
    this.dragUnit = null;
    this.dragPos = null;
    this.highlightCell = null;
  }

  /** 适配屏幕尺寸 */
  _resize() {
    const ratio = window.devicePixelRatio || 1;
    const w = Math.min(window.innerWidth, 450);
    const h = window.innerHeight;
    const scale = w / this.config.CANVAS_WIDTH;

    this.canvas.style.width = w + 'px';
    this.canvas.style.height = (this.config.CANVAS_HEIGHT * scale) + 'px';
    this.canvas.width = this.config.CANVAS_WIDTH * ratio;
    this.canvas.height = this.config.CANVAS_HEIGHT * ratio;
    this.ctx.setTransform(ratio * scale, 0, 0, ratio * scale, 0, 0);
    this.scale = scale;
    this.ratio = ratio;
  }

  /** 主渲染方法 */
  render(state) {
    const ctx = this.ctx;
    const C = this.C;

    // 清屏
    ctx.fillStyle = C.BACKGROUND;
    ctx.fillRect(0, 0, this.config.CANVAS_WIDTH, this.config.CANVAS_HEIGHT);

    // 渲染各个UI层
    this._renderHUD(ctx, state);
    this._renderSynergies(ctx, state);
    this._renderEnemyArea(ctx, state);
    this._renderBoard(ctx, state);
    this._renderBench(ctx, state);
    this._renderShop(ctx, state);
    this._renderPhaseInfo(ctx, state);

    // 拖拽中的棋子
    if (this.dragUnit && this.dragPos) {
      this._renderChessPiece(ctx, this.dragUnit, this.dragPos.x - 40, this.dragPos.y - 40, 80, 0.8);
    }
  }

  /** 渲染战斗场景 */
  renderBattle(state, battle) {
    const ctx = this.ctx;
    const C = this.C;

    ctx.fillStyle = C.BACKGROUND;
    ctx.fillRect(0, 0, this.config.CANVAS_WIDTH, this.config.CANVAS_HEIGHT);

    this._renderHUD(ctx, state);
    this._renderBattleBoard(ctx, battle);
    this._renderBattleInfo(ctx, state, battle);
  }

  /** 渲染顶部HUD */
  _renderHUD(ctx, state) {
    const p = state.player;

    // 背景条
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, 750, 70);

    // 回合数
    ctx.fillStyle = this.C.TEXT_WHITE;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`回合 ${state.round}`, 15, 30);

    // 阶段
    const phaseText = state.phase === 'prep' ? '🛠️ 准备' : state.phase === 'battle' ? '⚔️ 战斗' : '📊 结算';
    ctx.fillText(phaseText, 15, 58);

    // 生命值
    ctx.fillStyle = this.C.HP_RED;
    ctx.fillText(`❤️ ${p.hp}/${p.maxHp}`, 160, 30);

    // 金币
    ctx.fillStyle = this.C.GOLD;
    ctx.fillText(`💰 ${p.gold}`, 160, 58);

    // 等级&经验
    ctx.fillStyle = this.C.TEXT_WHITE;
    ctx.textAlign = 'right';
    const xpText = p.xpToLevel === Infinity ? 'MAX' : `${p.xp}/${p.xpToLevel}`;
    ctx.fillText(`Lv.${p.level} (${xpText})`, 550, 30);

    // 上场数
    ctx.fillText(`棋子: ${state.boardUnits.length}/${p.maxUnits}`, 550, 58);

    // 连胜/连败
    if (p.winStreak > 0) {
      ctx.fillStyle = '#4caf50';
      ctx.fillText(`🔥 ${p.winStreak}连胜`, 735, 30);
    } else if (p.loseStreak > 0) {
      ctx.fillStyle = '#f44336';
      ctx.fillText(`💔 ${p.loseStreak}连败`, 735, 30);
    }
  }

  /** 渲染羁绊信息 */
  _renderSynergies(ctx, state) {
    const synergies = state.activeSynergies;
    if (synergies.length === 0) return;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 75, 750, 35);

    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    let x = 10;
    for (const syn of synergies) {
      ctx.fillStyle = this.C.GOLD;
      const text = `${syn.icon}${syn.name}(${syn.count})`;
      ctx.fillText(text, x, 98);
      x += ctx.measureText(text).width + 15;
      if (x > 700) break;
    }
  }

  /** 渲染敌方区域 */
  _renderEnemyArea(ctx, state) {
    ctx.fillStyle = 'rgba(255,0,0,0.05)';
    ctx.fillRect(0, 115, 750, 175);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = this.C.TEXT_GRAY;
    ctx.textAlign = 'center';
    ctx.fillText('— 敌方阵容 —', 375, 135);

    // 渲染敌方棋子缩略
    const enemies = state.enemyUnits;
    const startX = 100;
    const cellW = 70;
    for (let i = 0; i < enemies.length; i++) {
      const x = startX + (i % 7) * cellW;
      const y = 145 + Math.floor(i / 7) * 70;
      this._renderMiniChess(ctx, enemies[i], x, y, 60);
    }
  }

  /** 渲染棋盘 */
  _renderBoard(ctx, state) {
    const ox = this.config.BOARD_OFFSET_X;
    const oy = this.config.BOARD_OFFSET_Y;
    const size = this.config.CELL_SIZE;

    // 棋盘标题
    ctx.font = '14px sans-serif';
    ctx.fillStyle = this.C.TEXT_GRAY;
    ctx.textAlign = 'center';
    ctx.fillText('— 我的棋盘 —', 375, oy - 8);

    for (let r = 0; r < this.config.BOARD_ROWS; r++) {
      for (let c = 0; c < this.config.BOARD_COLS; c++) {
        const x = ox + c * (size + 6);
        const y = oy + r * (size + 6);

        // 格子背景
        const isHighlight = this.highlightCell &&
          this.highlightCell.row === r && this.highlightCell.col === c;
        ctx.fillStyle = isHighlight ? this.C.BOARD_HIGHLIGHT :
          ((r + c) % 2 === 0 ? this.C.BOARD_LIGHT : this.C.BOARD_DARK);
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 8);
        ctx.fill();

        // 棋子
        const unit = state.boardUnits.find(u => u.row === r && u.col === c);
        if (unit) {
          this._renderChessPiece(ctx, unit, x, y, size, 1.0);
        }
      }
    }
  }

  /** 渲染备战席 */
  _renderBench(ctx, state) {
    const ox = this.config.BENCH_OFFSET_X;
    const oy = this.config.BENCH_OFFSET_Y;
    const size = 70;

    ctx.font = '14px sans-serif';
    ctx.fillStyle = this.C.TEXT_GRAY;
    ctx.textAlign = 'center';
    ctx.fillText('— 备战席 —', 375, oy - 8);

    for (let i = 0; i < this.config.BENCH_SLOTS; i++) {
      const x = ox + i * (size + 6);
      const y = oy;

      ctx.fillStyle = this.C.BENCH_BG;
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, 6);
      ctx.fill();
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.stroke();

      const chess = state.benchUnits[i];
      if (chess) {
        this._renderChessPiece(ctx, chess, x, y, size, 1.0);
      }
    }
  }

  /** 渲染商店 */
  _renderShop(ctx, state) {
    const y = 830;

    // 商店背景
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, y, 750, 220);

    // 标题
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = state.shopLocked ? '#f44336' : this.C.GOLD;
    ctx.textAlign = 'center';
    ctx.fillText(state.shopLocked ? '🔒 商店已锁定' : '🏪 商店', 375, y + 25);

    // 商店棋子
    const slotW = 130;
    const slotH = 120;
    const startX = 25;
    for (let i = 0; i < this.config.SHOP_SLOTS; i++) {
      const sx = startX + i * (slotW + 10);
      const sy = y + 40;
      const champion = state.shopSlots[i];

      // 槽位背景
      ctx.fillStyle = champion ? '#2a2a45' : '#1a1a30';
      ctx.beginPath();
      ctx.roundRect(sx, sy, slotW, slotH, 8);
      ctx.fill();

      if (champion) {
        // 费用边框颜色
        const costColor = this._getCostColor(champion.cost);
        ctx.strokeStyle = costColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Emoji
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(champion.emoji, sx + slotW / 2, sy + 45);

        // 名称
        ctx.font = '13px sans-serif';
        ctx.fillStyle = this.C.TEXT_WHITE;
        ctx.fillText(champion.name, sx + slotW / 2, sy + 70);

        // 费用
        ctx.fillStyle = costColor;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`💰${champion.cost}`, sx + slotW / 2, sy + 95);

        // 羁绊
        ctx.font = '11px sans-serif';
        ctx.fillStyle = this.C.TEXT_GRAY;
        ctx.fillText(champion.synergies.slice(0, 2).join(' '), sx + slotW / 2, sy + 112);
      }
    }

    // 操作按钮
    this._renderShopButtons(ctx, state, y);
  }

  /** 渲染商店操作按钮 */
  _renderShopButtons(ctx, state, shopY) {
    const btnY = shopY + 175;
    const btnH = 35;

    // 刷新按钮
    this._renderButton(ctx, 25, btnY, 160, btnH, `🔄 刷新 (${this.config.REFRESH_COST}💰)`, '#4a90d9');

    // 锁定按钮
    this._renderButton(ctx, 195, btnY, 120, btnH,
      state.shopLocked ? '🔓 解锁' : '🔒 锁定',
      state.shopLocked ? '#d94a4a' : '#666');

    // 买经验按钮
    this._renderButton(ctx, 325, btnY, 200, btnH,
      `📈 买经验 (${this.config.BUY_XP_COST}💰)`, '#4ad97a');

    // 开始战斗按钮
    if (state.phase === 'prep') {
      this._renderButton(ctx, 535, btnY, 190, btnH, '⚔️ 开始战斗', '#d9a64a');
    }
  }

  /** 渲染按钮 */
  _renderButton(ctx, x, y, w, h, text, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + h / 2 + 5);
  }

  /** 渲染阶段信息 */
  _renderPhaseInfo(ctx, state) {
    if (state.phase === 'result') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(200, 500, 350, 80);
      ctx.fillStyle = this.C.GOLD;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('点击继续下一回合', 375, 548);
    }
  }

  /** 渲染战斗棋盘 */
  _renderBattleBoard(ctx, battle) {
    if (!battle || !battle.board) return;

    const ox = 35;
    const oy = 120;
    const size = 75;
    const gap = 6;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < this.config.BOARD_COLS; c++) {
        const x = ox + c * (size + gap);
        const y = oy + r * (size + gap);

        // 分区颜色
        const isPlayerSide = r < 4;
        ctx.fillStyle = isPlayerSide ?
          ((r + c) % 2 === 0 ? '#2d3d2d' : '#253525') :
          ((r + c) % 2 === 0 ? '#3d2d2d' : '#352525');
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 6);
        ctx.fill();

        // 棋子
        const unit = battle.board.getUnit(r, c);
        if (unit && unit.isAlive) {
          this._renderBattleUnit(ctx, unit, x, y, size, r < 4);
        }
      }
    }

    // 分割线
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ox, oy + 4 * (size + gap) - 3);
    ctx.lineTo(ox + 7 * (size + gap), oy + 4 * (size + gap) - 3);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /** 渲染战斗中的单位 */
  _renderBattleUnit(ctx, unit, x, y, size, isPlayer) {
    // 背景
    ctx.fillStyle = isPlayer ? 'rgba(0,100,200,0.3)' : 'rgba(200,0,0,0.3)';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, size - 4, size - 4, 6);
    ctx.fill();

    // Emoji
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(unit.emoji, x + size / 2, y + 30);

    // HP条
    const hpRatio = unit.hp / unit.maxHp;
    const barW = size - 10;
    const barH = 5;
    const barX = x + 5;
    const barY = y + size - 20;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? this.C.HP_GREEN : this.C.HP_RED;
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    // 蓝条
    const manaRatio = unit.mana / unit.maxMana;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY + 7, barW, 3);
    ctx.fillStyle = this.C.MANA_BLUE;
    ctx.fillRect(barX, barY + 7, barW * manaRatio, 3);

    // 星级
    ctx.font = '10px sans-serif';
    ctx.fillStyle = this.C.GOLD;
    ctx.fillText('⭐'.repeat(unit.star), x + size / 2, y + size - 5);
  }

  /** 渲染战斗信息 */
  _renderBattleInfo(ctx, state, battle) {
    if (!battle) return;

    const y = 800;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, y, 750, 100);

    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = this.C.TEXT_WHITE;
    ctx.textAlign = 'center';

    if (battle.isFinished) {
      const resultText = battle.winner === 'player' ? '✅ 战斗胜利!' :
        battle.winner === 'draw' ? '🤝 战斗平局' : '❌ 战斗失败';
      const resultColor = battle.winner === 'player' ? '#4caf50' :
        battle.winner === 'draw' ? '#ff9800' : '#f44336';
      ctx.fillStyle = resultColor;
      ctx.fillText(resultText, 375, y + 35);

      ctx.font = '16px sans-serif';
      ctx.fillStyle = this.C.TEXT_WHITE;
      ctx.fillText('点击继续', 375, y + 65);
    } else {
      ctx.fillText(`⚔️ 战斗进行中... Tick: ${battle.tickCount}`, 375, y + 35);

      const pAlive = battle.getPlayerUnits().length;
      const eAlive = battle.getEnemyUnits().length;
      ctx.font = '16px sans-serif';
      ctx.fillStyle = this.C.TEXT_GRAY;
      ctx.fillText(`己方存活: ${pAlive}  |  敌方存活: ${eAlive}`, 375, y + 65);
    }
  }

  /** 渲染单个棋子 */
  _renderChessPiece(ctx, unit, x, y, size, alpha) {
    ctx.globalAlpha = alpha;

    // 费用等级底色
    const costColor = this._getCostColor(unit.cost);
    ctx.fillStyle = costColor;
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, size - 6, size - 6, 6);
    ctx.fill();

    // 内部深色
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 6, size - 12, size - 12, 4);
    ctx.fill();

    // Emoji
    ctx.font = `${size * 0.35}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(unit.emoji, x + size / 2, y + size * 0.42);

    // 名称
    ctx.font = `${Math.max(10, size * 0.13)}px sans-serif`;
    ctx.fillStyle = this.C.TEXT_WHITE;
    ctx.fillText(unit.name, x + size / 2, y + size * 0.62);

    // 星级
    ctx.font = `${Math.max(8, size * 0.12)}px sans-serif`;
    ctx.fillStyle = this.C.GOLD;
    ctx.fillText('⭐'.repeat(unit.star), x + size / 2, y + size * 0.78);

    // HP/攻击小字
    ctx.font = `${Math.max(8, size * 0.11)}px sans-serif`;
    ctx.fillStyle = this.C.TEXT_GRAY;
    ctx.fillText(`${unit.hp}❤ ${unit.attack}⚔`, x + size / 2, y + size * 0.92);

    ctx.globalAlpha = 1;
  }

  /** 渲染迷你棋子(敌方区域用) */
  _renderMiniChess(ctx, unit, x, y, size) {
    const costColor = this._getCostColor(unit.cost);
    ctx.fillStyle = costColor;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 4);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, size - 4, size - 4, 3);
    ctx.fill();

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(unit.emoji, x + size / 2, y + 28);

    ctx.font = '9px sans-serif';
    ctx.fillStyle = this.C.GOLD;
    ctx.fillText('⭐'.repeat(unit.star), x + size / 2, y + 45);

    ctx.font = '9px sans-serif';
    ctx.fillStyle = this.C.TEXT_GRAY;
    ctx.fillText(unit.name, x + size / 2, y + 56);
  }

  /** 获取费用对应的颜色 */
  _getCostColor(cost) {
    const colors = {
      1: this.C.COST_1,
      2: this.C.COST_2,
      3: this.C.COST_3,
      4: this.C.COST_4,
      5: this.C.COST_5,
    };
    return colors[cost] || this.C.COST_1;
  }

  // ===== 输入检测辅助方法 =====

  /** 屏幕坐标转画布坐标 */
  screenToCanvas(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (screenX - rect.left) / this.scale,
      y: (screenY - rect.top) / this.scale
    };
  }

  /** 画布坐标转棋盘格子 */
  canvasToBoard(cx, cy) {
    const ox = this.config.BOARD_OFFSET_X;
    const oy = this.config.BOARD_OFFSET_Y;
    const size = this.config.CELL_SIZE + 6;

    const col = Math.floor((cx - ox) / size);
    const row = Math.floor((cy - oy) / size);

    if (row >= 0 && row < this.config.BOARD_ROWS && col >= 0 && col < this.config.BOARD_COLS) {
      return { row, col };
    }
    return null;
  }

  /** 画布坐标转备战席位置 */
  canvasToBench(cx, cy) {
    const ox = this.config.BENCH_OFFSET_X;
    const oy = this.config.BENCH_OFFSET_Y;
    const size = 76;

    if (cy >= oy && cy <= oy + 70) {
      const index = Math.floor((cx - ox) / size);
      if (index >= 0 && index < this.config.BENCH_SLOTS) {
        return index;
      }
    }
    return -1;
  }

  /** 画布坐标转商店槽位 */
  canvasToShop(cx, cy) {
    const shopY = 870;
    const slotW = 140;
    const startX = 25;

    if (cy >= shopY && cy <= shopY + 120) {
      const index = Math.floor((cx - startX) / slotW);
      if (index >= 0 && index < this.config.SHOP_SLOTS) {
        return index;
      }
    }
    return -1;
  }

  /** 画布坐标转商店按钮 */
  canvasToButton(cx, cy) {
    const btnY = 1005;
    if (cy < btnY || cy > btnY + 35) return null;

    if (cx >= 25 && cx <= 185) return 'refresh';
    if (cx >= 195 && cx <= 315) return 'lock';
    if (cx >= 325 && cx <= 525) return 'buyxp';
    if (cx >= 535 && cx <= 725) return 'battle';
    return null;
  }
}

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}
