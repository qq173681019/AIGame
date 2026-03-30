/**
 * HUD — 顶部信息栏 & 羁绊面板
 * 显示玩家 HP、金币、等级/经验、回合数、阶段名称、倒计时、上阵数、羁绊
 */

var GameConfig = require('../config/game-config');
var COLORS = GameConfig.COLORS;

var PHASE_NAMES = {};
PHASE_NAMES[GameConfig.PHASE_PREPARE] = '准备阶段';
PHASE_NAMES[GameConfig.PHASE_BATTLE]  = '战斗阶段';
PHASE_NAMES[GameConfig.PHASE_RESULT]  = '结算阶段';

function HUD() {
  this.player = null;

  // 动态数据
  this.round = 1;
  this.phase = GameConfig.PHASE_PREPARE;
  this.timer = 0;
  this.synergies = []; // [{name, count, threshold, active}]
}

/**
 * 绑定玩家对象（需含 hp, maxHp, gold, level, xp, boardUnits 等属性）
 */
HUD.prototype.setPlayer = function (player) {
  this.player = player;
};

/**
 * 每帧/每阶段切换时更新
 * @param {number} round
 * @param {string} phase
 * @param {number} timer   剩余秒数
 * @param {Array}  synergies 激活的羁绊列表
 */
HUD.prototype.update = function (round, phase, timer, synergies) {
  this.round = round;
  this.phase = phase;
  this.timer = timer;
  this.synergies = synergies || [];
};

// ── 绘制辅助 ───────────────────────────────────────────────

function _roundRect(ctx, x, y, w, h, r) {
  if (r > h / 2) r = h / 2;
  if (r > w / 2) r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ── 主渲染 ─────────────────────────────────────────────────

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasWidth  当前画布宽度（用于自适应）
 */
HUD.prototype.render = function (ctx, canvasWidth) {
  var cw = canvasWidth || GameConfig.DESIGN_WIDTH;
  var p = this.player;

  ctx.save();

  // ── 顶部背景条 ──
  var barH = 100;
  ctx.fillStyle = COLORS.PANEL_BG;
  ctx.fillRect(0, 0, cw, barH);

  // 分割线
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barH);
  ctx.lineTo(cw, barH);
  ctx.stroke();

  var leftX = 20;
  var lineY1 = 30; // 第一行 y
  var lineY2 = 70; // 第二行 y

  // ── 第一行：HP · 金币 · 等级/经验 ──
  ctx.font = 'bold 26px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  if (p) {
    var hp = p.hp !== undefined ? p.hp : GameConfig.INITIAL_HP;
    var maxHp = p.maxHp !== undefined ? p.maxHp : GameConfig.INITIAL_HP;
    var gold = p.gold !== undefined ? p.gold : 0;
    var level = p.level !== undefined ? p.level : 1;
    var xp = p.xp !== undefined ? p.xp : 0;
    var xpNeed = GameConfig.LEVEL_XP[level] || 0;

    // HP
    this._drawHP(ctx, leftX, lineY1, hp, maxHp);

    // 金币
    var goldX = leftX + 200;
    ctx.fillStyle = COLORS.GOLD;
    ctx.fillText('💰 ' + gold, goldX, lineY1);

    // 等级 / 经验
    var lvlX = goldX + 150;
    ctx.fillStyle = COLORS.TEXT_WHITE;
    var xpText = level >= GameConfig.MAX_LEVEL ? 'MAX' : xp + '/' + xpNeed;
    ctx.fillText('Lv.' + level + ' (' + xpText + ')', lvlX, lineY1);
  }

  // ── 第二行：回合 · 阶段 · 倒计时 · 上阵数 ──
  ctx.font = '24px "PingFang SC","Microsoft YaHei",sans-serif';

  // 回合
  ctx.fillStyle = COLORS.TEXT_WHITE;
  ctx.fillText('回合 ' + this.round, leftX, lineY2);

  // 阶段
  var phaseX = leftX + 130;
  var phaseName = PHASE_NAMES[this.phase] || this.phase;
  ctx.fillStyle = this.phase === GameConfig.PHASE_BATTLE ? '#FF6B6B' : '#6BCB77';
  ctx.fillText(phaseName, phaseX, lineY2);

  // 倒计时
  var timerX = phaseX + 150;
  var sec = Math.ceil(this.timer);
  ctx.fillStyle = sec <= 5 ? COLORS.HP_RED : COLORS.TEXT_WHITE;
  ctx.fillText('⏱ ' + sec + 's', timerX, lineY2);

  // 上阵数
  if (p) {
    var boardCount = 0;
    if (p.boardUnits) {
      boardCount = typeof p.boardUnits === 'number' ? p.boardUnits : p.boardUnits.length || 0;
    }
    var maxUnits = GameConfig.LEVEL_UNIT_COUNT[p.level || 1] || 1;
    var countX = timerX + 130;
    ctx.fillStyle = boardCount >= maxUnits ? COLORS.HP_RED : COLORS.TEXT_WHITE;
    ctx.fillText('棋子 ' + boardCount + '/' + maxUnits, countX, lineY2);
  }

  // ── 羁绊列表（顶栏下方左侧）──
  this._drawSynergies(ctx, barH);

  ctx.restore();
};

// ── HP 条 ──────────────────────────────────────────────────

HUD.prototype._drawHP = function (ctx, x, cy, hp, maxHp) {
  var barW = 160;
  var barH = 18;
  var bx = x;
  var by = cy - barH / 2;
  var ratio = Math.max(0, Math.min(1, hp / maxHp));

  // 背景
  _roundRect(ctx, bx, by, barW, barH, 6);
  ctx.fillStyle = '#3a3a3a';
  ctx.fill();

  // 血量
  if (ratio > 0) {
    _roundRect(ctx, bx, by, barW * ratio, barH, 6);
    ctx.fillStyle = ratio > 0.35 ? COLORS.HP_GREEN : COLORS.HP_RED;
    ctx.fill();
  }

  // 数值
  ctx.fillStyle = COLORS.TEXT_WHITE;
  ctx.font = 'bold 20px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('❤ ' + hp + '/' + maxHp, bx + barW / 2, cy);
  ctx.textAlign = 'left';
  ctx.font = 'bold 26px "PingFang SC","Microsoft YaHei",sans-serif';
};

// ── 羁绊面板 ──────────────────────────────────────────────

HUD.prototype._drawSynergies = function (ctx, startY) {
  if (!this.synergies || this.synergies.length === 0) return;

  var padX = 16;
  var padY = startY + 10;
  var tagH = 30;
  var gap = 6;

  ctx.font = 'bold 20px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textBaseline = 'middle';

  for (var i = 0; i < this.synergies.length; i++) {
    var syn = this.synergies[i];
    var ty = padY + i * (tagH + gap);
    var label = syn.name + ' ' + syn.count + '/' + syn.threshold;
    var tw = ctx.measureText(label).width + 20;

    // 标签背景
    _roundRect(ctx, padX, ty, tw, tagH, 8);
    ctx.fillStyle = syn.active ? 'rgba(107,203,119,0.85)' : 'rgba(255,255,255,0.15)';
    ctx.fill();

    // 文字
    ctx.fillStyle = syn.active ? '#1a1a2e' : 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'left';
    ctx.fillText(label, padX + 10, ty + tagH / 2);
  }
};

module.exports = HUD;
